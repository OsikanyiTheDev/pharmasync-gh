-- ==============================================================================
-- PharmaSync GH — Initial Production PostgreSQL / Supabase Migration
-- File: supabase/migrations/001_initial_schema.sql
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUMS & CONSTANTS
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('OWNER', 'BRANCH_MANAGER', 'CASHIER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transfer_status AS ENUM ('PENDING', 'DISPATCHED', 'RECEIVED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 2. CORE TABLES
-- ------------------------------------------------------------------------------

-- Branches Table (Accra Central Main, Osu Branch, Spintex Branch)
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    location TEXT NOT NULL,
    phone TEXT NOT NULL,
    manager TEXT NOT NULL,
    is_main BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medicines Catalog Table
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_name TEXT NOT NULL,
    generic_name TEXT NOT NULL,
    category TEXT NOT NULL,
    dosage_form TEXT NOT NULL,
    strength TEXT NOT NULL,
    pack_size TEXT DEFAULT '10x10 Blister',
    retail_price NUMERIC(10, 2) NOT NULL CHECK (retail_price >= 0),
    cost_price NUMERIC(10, 2) NOT NULL CHECK (cost_price >= 0),
    reorder_level INT DEFAULT 15 CHECK (reorder_level >= 0),
    requires_prescription BOOLEAN DEFAULT false,
    nafdac_fda_no TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branch Stock (Batch & FEFO Level Inventory per Branch)
CREATE TABLE IF NOT EXISTS branch_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    batch_number TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    mfg_date DATE,
    quantity INT NOT NULL CHECK (quantity >= 0),
    unit_cost_price NUMERIC(10, 2) NOT NULL CHECK (unit_cost_price >= 0),
    unit_selling_price NUMERIC(10, 2) NOT NULL CHECK (unit_selling_price >= 0),
    supplier TEXT DEFAULT 'Okaishie Wholesale Depot',
    shelf_location TEXT DEFAULT 'Main Shelf',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_branch_medicine_batch UNIQUE (branch_id, medicine_id, batch_number)
);

-- User Profiles & Role Assignment Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'CASHIER',
    assigned_branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Ledger Table
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id),
    invoice_number TEXT UNIQUE NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    doctor_name TEXT,
    rx_number TEXT,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT NOT NULL, -- 'CASH', 'MOMO', 'SPLIT'
    momo_provider TEXT,           -- 'MTN Mobile Money', 'Telecel Cash', 'AT Money'
    momo_ref TEXT,
    cash_paid NUMERIC(10, 2),
    cash_change NUMERIC(10, 2),
    cashier_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    attendant_name TEXT NOT NULL DEFAULT 'Dispenser',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sale Items Line Ledger Table
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    branch_stock_id UUID REFERENCES branch_stock(id) ON DELETE SET NULL,
    medicine_id UUID REFERENCES medicines(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    discount NUMERIC(10, 2) DEFAULT 0,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inter-Branch Transfers Ledger Table
CREATE TABLE IF NOT EXISTS transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_no TEXT UNIQUE NOT NULL,
    source_branch_id UUID NOT NULL REFERENCES branches(id),
    dest_branch_id UUID NOT NULL REFERENCES branches(id),
    medicine_id UUID REFERENCES medicines(id),
    batch_number TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    status transfer_status NOT NULL DEFAULT 'DISPATCHED',
    notes TEXT,
    requested_by TEXT DEFAULT 'Branch Pharmacist',
    dispatched_at TIMESTAMPTZ DEFAULT NOW(),
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. INDEXES FOR HIGH-PERFORMANCE SEARCH & FEFO DATES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_branch_stock_fefo ON branch_stock (branch_id, medicine_id, expiry_date ASC);
CREATE INDEX IF NOT EXISTS idx_medicines_search ON medicines (brand_name, generic_name, category);
CREATE INDEX IF NOT EXISTS idx_sales_branch_timestamp ON sales (branch_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transfers_source_dest ON transfers (source_branch_id, dest_branch_id, status);

-- ------------------------------------------------------------------------------
-- 4. ATOMIC STOCK DEDUCTION STORED PROCEDURE (CONCURRENCY SAFE)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION process_sale_transaction(
  p_branch_id UUID,
  p_cashier_id UUID,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_doctor_name TEXT,
  p_payment_method TEXT,
  p_total_amount NUMERIC,
  p_items JSONB -- Array of { branch_stock_id, medicine_id, quantity, unit_price, discount }
) RETURNS JSONB AS $$
DECLARE
  v_sale_id UUID;
  v_invoice_no TEXT;
  v_item RECORD;
  v_subtotal NUMERIC := 0;
  v_calculated_total NUMERIC := 0;
BEGIN
  -- Generate unique Ghanaian Pharmacy Receipt Number (e.g. INV-2026-8942)
  v_invoice_no := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  -- Insert into sales table
  INSERT INTO sales (
    branch_id, 
    cashier_id, 
    invoice_number, 
    customer_name, 
    customer_phone, 
    doctor_name, 
    payment_method, 
    total_amount,
    subtotal
  )
  VALUES (
    p_branch_id, 
    p_cashier_id, 
    v_invoice_no, 
    p_customer_name, 
    p_customer_phone, 
    p_doctor_name, 
    p_payment_method, 
    p_total_amount,
    p_total_amount
  )
  RETURNING id INTO v_sale_id;

  -- Process and deduct each stock item atomically
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    branch_stock_id UUID, 
    medicine_id UUID,
    quantity INT, 
    unit_price NUMERIC,
    discount NUMERIC
  )
  LOOP
    -- Deduct stock atomically, verifying stock doesn't fall below 0
    UPDATE branch_stock
    SET quantity = quantity - v_item.quantity,
        updated_at = NOW()
    WHERE id = v_item.branch_stock_id AND quantity >= v_item.quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient stock for batch stock ID %', v_item.branch_stock_id;
    END IF;

    -- Record line item in sale_items
    INSERT INTO sale_items (
      sale_id, 
      branch_stock_id, 
      medicine_id, 
      quantity, 
      unit_price, 
      discount, 
      subtotal
    )
    VALUES (
      v_sale_id, 
      v_item.branch_stock_id, 
      v_item.medicine_id, 
      v_item.quantity, 
      v_item.unit_price, 
      COALESCE(v_item.discount, 0), 
      (v_item.quantity * v_item.unit_price) - COALESCE(v_item.discount, 0)
    );
  END LOOP;

  -- Create Audit Log
  INSERT INTO audit_logs (branch_id, user_id, action, details)
  VALUES (
    p_branch_id, 
    p_cashier_id, 
    'PROCESS_SALE', 
    jsonb_build_object('sale_id', v_sale_id, 'invoice_number', v_invoice_no, 'total', p_total_amount)
  );

  RETURN jsonb_build_object(
    'success', true, 
    'sale_id', v_sale_id, 
    'invoice_number', v_invoice_no,
    'total_amount', p_total_amount
  );
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 5. INITIAL SEED DATA FOR DEMO / SETUP
-- ------------------------------------------------------------------------------
INSERT INTO branches (id, name, code, location, phone, manager, is_main)
VALUES 
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Accra Central Main', 'ACCRA_MAIN', 'Makola Pharmacy Zone, Accra', '+233 24 411 2233', 'Dr. Kwame Mensah (PharmD)', true),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Osu Branch', 'OSU_BRANCH', 'Oxford Street, Osu Accra', '+233 20 882 1144', 'Abena Osei', false),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Spintex Branch', 'SPINTEX_BRANCH', 'Spintex Coastal Junction, Accra', '+233 55 993 4455', 'Kofi Boateng', false)
ON CONFLICT (code) DO NOTHING;
