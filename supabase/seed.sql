-- ==============================================================================
-- PharmaSync GH — Full Seed Data & Public RLS Policies
-- File: supabase/seed.sql
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Enable RLS and create public access policies for client app sync
DO $$ BEGIN
  ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
  ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
  ALTER TABLE branch_stock ENABLE ROW LEVEL SECURITY;
  ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
  ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
  ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
  ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DROP POLICY IF EXISTS "Public select branches" ON branches;
CREATE POLICY "Public select branches" ON branches FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert branches" ON branches;
CREATE POLICY "Public insert branches" ON branches FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public select medicines" ON medicines;
CREATE POLICY "Public select medicines" ON medicines FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert medicines" ON medicines;
CREATE POLICY "Public insert medicines" ON medicines FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update medicines" ON medicines;
CREATE POLICY "Public update medicines" ON medicines FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public select branch_stock" ON branch_stock;
CREATE POLICY "Public select branch_stock" ON branch_stock FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert branch_stock" ON branch_stock;
CREATE POLICY "Public insert branch_stock" ON branch_stock FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update branch_stock" ON branch_stock;
CREATE POLICY "Public update branch_stock" ON branch_stock FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public select sales" ON sales;
CREATE POLICY "Public select sales" ON sales FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert sales" ON sales;
CREATE POLICY "Public insert sales" ON sales FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public select sale_items" ON sale_items;
CREATE POLICY "Public select sale_items" ON sale_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert sale_items" ON sale_items;
CREATE POLICY "Public insert sale_items" ON sale_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public select transfers" ON transfers;
CREATE POLICY "Public select transfers" ON transfers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert transfers" ON transfers;
CREATE POLICY "Public insert transfers" ON transfers FOR INSERT WITH CHECK (true);

-- 2. Seed 3 Core Ghanaian Pharmacy Branches
INSERT INTO branches (id, name, code, location, phone, manager, is_main)
VALUES 
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Accra Central Main', 'ACCRA_MAIN', 'Makola Pharmacy Zone, Accra', '+233 24 411 2233', 'Dr. Kwame Mensah (PharmD)', true),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Osu Branch', 'OSU_BRANCH', 'Oxford Street, Osu Accra', '+233 20 882 1144', 'Abena Osei', false),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Spintex Branch', 'SPINTEX_BRANCH', 'Spintex Coastal Junction, Accra', '+233 55 993 4455', 'Kofi Boateng', false)
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name, 
  location = EXCLUDED.location, 
  phone = EXCLUDED.phone, 
  manager = EXCLUDED.manager;

-- 3. Seed Master Ghanaian Medicine Catalog
INSERT INTO medicines (id, brand_name, generic_name, category, dosage_form, strength, pack_size, retail_price, cost_price, reorder_level, requires_prescription, nafdac_fda_no)
VALUES
  ('m0000000-0001-4000-8000-000000000001', 'Lonart DS', 'Artemether 80mg / Lumefantrine 480mg', 'Anti-Malarial', 'Tablets', '80mg/480mg', '6 Tablets', 35.00, 22.50, 15, false, 'FDA/SD.22-8812'),
  ('m0000000-0002-4000-8000-000000000002', 'Coartem', 'Artemether 20mg / Lumefantrine 120mg', 'Anti-Malarial', 'Tablets', '20mg/120mg', '24 Tablets', 45.00, 30.00, 20, false, 'FDA/SD.19-4401'),
  ('m0000000-0003-4000-8000-000000000003', 'Artequick', 'Artemisinin 62.5mg / Piperaquine 375mg', 'Anti-Malarial', 'Tablets', '62.5mg/375mg', '4 Tablets', 30.00, 18.00, 10, false, 'FDA/SD.21-0982'),
  ('m0000000-0004-4000-8000-000000000004', 'Letap Amoxicillin', 'Amoxicillin Trihydrate', 'Antibiotic', 'Capsules', '500mg', '10x10 Blister', 25.00, 14.00, 25, true, 'FDA/SD.18-5050'),
  ('m0000000-0005-4000-8000-000000000005', 'Augmentin 625mg', 'Amoxicillin-Clavulanate', 'Antibiotic', 'Tablets', '625mg', '14 Tablets', 75.00, 48.00, 15, true, 'FDA/SD.20-1123'),
  ('m0000000-0006-4000-8000-000000000006', 'Kinapharma Ciprofloxacin', 'Ciprofloxacin Hydrochloride', 'Antibiotic', 'Tablets', '500mg', '10 Tablets', 30.00, 18.50, 12, true, 'FDA/SD.17-2900'),
  ('m0000000-0007-4000-8000-000000000007', 'Azithromycin 500mg', 'Azithromycin Dihydrate', 'Antibiotic', 'Tablets', '500mg', '3 Tablets', 35.00, 20.00, 10, true, 'FDA/SD.23-7741'),
  ('m0000000-0008-4000-8000-000000000008', 'Emzor Paracetamol', 'Paracetamol', 'Pain & Analgesics', 'Tablets', '500mg', '10x10 Blister', 12.00, 6.50, 50, false, 'FDA/SD.16-0012'),
  ('m0000000-0009-4000-8000-000000000009', 'Diclofenac Gel', 'Diclofenac Sodium 1% w/w', 'Pain & Analgesics', 'Topical Gel', '1% 50g', '1 Tube', 20.00, 11.00, 10, false, 'FDA/SD.21-3310'),
  ('m0000000-0010-4000-8000-000000000010', 'Ibuprofen 400mg', 'Ibuprofen BP', 'Pain & Analgesics', 'Tablets', '400mg', '10x10 Blister', 18.00, 9.50, 30, false, 'FDA/SD.19-8821'),
  ('m0000000-0011-4000-8000-000000000011', 'Amlodipine 10mg', 'Amlodipine Besylate', 'Cardiovascular & Chronic', 'Tablets', '10mg', '30 Tablets', 28.00, 15.00, 20, true, 'FDA/SD.22-4410'),
  ('m0000000-0012-4000-8000-000000000012', 'Lisinopril 10mg', 'Lisinopril Dihydrate', 'Cardiovascular & Chronic', 'Tablets', '10mg', '28 Tablets', 32.00, 18.00, 15, true, 'FDA/SD.21-0099'),
  ('m0000000-0013-4000-8000-000000000013', 'Metformin 500mg', 'Metformin Hydrochloride', 'Cardiovascular & Chronic', 'Tablets', '500mg', '100 Tablets', 40.00, 24.00, 25, true, 'FDA/SD.20-5541'),
  ('m0000000-0014-4000-8000-000000000014', 'Benylin 4Flu', 'Diphenhydramine / Paracetamol / Pseudoephedrine', 'Cough & Cold', 'Syrup', '100ml Syrup', '1 Bottle', 38.00, 24.00, 15, false, 'FDA/SD.19-9012'),
  ('m0000000-0015-4000-8000-000000000015', 'Feroglobin Syrup', 'Liquid Iron + Vitamin B Complex + Zinc', 'Vitamins & Supplements', 'Syrup', '200ml Syrup', '1 Bottle', 65.00, 42.00, 12, false, 'FDA/SD.23-1100'),
  ('m0000000-0016-4000-8000-000000000016', 'Royal ORS Sachets', 'Oral Rehydration Salts (WHO Formula)', 'OTC & General Wellness', 'Oral Powder Sachet', '20.5g Sachet', '10 Sachets', 15.00, 8.00, 40, false, 'FDA/SD.18-2234')
ON CONFLICT (id) DO UPDATE SET
  brand_name = EXCLUDED.brand_name,
  retail_price = EXCLUDED.retail_price,
  cost_price = EXCLUDED.cost_price;

-- 4. Seed FEFO Batches across Accra Central, Osu, and Spintex
INSERT INTO branch_stock (branch_id, medicine_id, batch_number, expiry_date, quantity, unit_cost_price, unit_selling_price, shelf_location)
VALUES
  -- Accra Central Main (Healthy >90d)
  ('a1b2c3d4-0001-4000-8000-000000000001', 'm0000000-0001-4000-8000-000000000001', 'BTH-LON-2027A', '2027-11-30', 120, 22.50, 35.00, 'Shelf A1 (Main)'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'm0000000-0002-4000-8000-000000000002', 'BTH-COA-2027A', '2027-10-15', 90, 30.00, 45.00, 'Shelf A2 (Main)'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'm0000000-0005-4000-8000-000000000005', 'BTH-AUG-2028A', '2028-06-30', 60, 48.00, 75.00, 'Shelf B1 (Antibiotics)'),

  -- Accra Central Main (Near Expiry <=90d)
  ('a1b2c3d4-0001-4000-8000-000000000001', 'm0000000-0001-4000-8000-000000000001', 'BTH-LON-2026EXP', '2026-10-15', 25, 22.50, 29.75, 'Shelf A-FEFO'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'm0000000-0008-4000-8000-000000000008', 'BTH-EMZ-2026EXP', '2026-09-30', 40, 6.50, 10.00, 'Counter Front'),

  -- Accra Central Main (Expired)
  ('a1b2c3d4-0001-4000-8000-000000000001', 'm0000000-0004-4000-8000-000000000004', 'EXP-LET-2025', '2025-12-31', 8, 14.00, 25.00, 'Quarantine Rack'),

  -- Osu Branch Batches
  ('a1b2c3d4-0002-4000-8000-000000000002', 'm0000000-0001-4000-8000-000000000001', 'BTH-LON-OSU01', '2028-04-30', 85, 22.50, 35.00, 'Dispensary Bay 1'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'm0000000-0008-4000-8000-000000000008', 'BTH-EMZ-OSU01', '2027-12-31', 150, 6.50, 12.00, 'Front Counter'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'm0000000-0011-4000-8000-000000000011', 'BTH-AML-OSU01', '2027-09-20', 40, 15.00, 28.00, 'Shelf C2'),

  -- Spintex Branch Batches
  ('a1b2c3d4-0003-4000-8000-000000000003', 'm0000000-0001-4000-8000-000000000001', 'BTH-LON-SPX01', '2027-08-20', 70, 22.50, 35.00, 'Spintex Store 1'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'm0000000-0014-4000-8000-000000000014', 'BTH-BEN-SPX01', '2026-11-30', 35, 24.00, 38.00, 'Syrup Rack'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'm0000000-0016-4000-8000-000000000016', 'BTH-ORS-SPX01', '2028-01-31', 200, 8.00, 15.00, 'Rehydration Shelf')
ON CONFLICT (branch_id, medicine_id, batch_number) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  unit_selling_price = EXCLUDED.unit_selling_price,
  expiry_date = EXCLUDED.expiry_date;
