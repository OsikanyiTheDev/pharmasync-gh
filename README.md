# 💊 PharmaSync GH — Multi-Branch Pharmacy Management System

![Build Status](https://img.shields.io/badge/Deployment-Live%20on%20Vercel-0f766e?style=for-the-badge&logo=vercel)
![Database](https://img.shields.io/badge/Backend-PostgreSQL%20%2F%20Supabase-3ECF8E?style=for-the-badge&logo=supabase)
![Framework](https://img.shields.io/badge/Framework-Next.js%2015%20App%20Router-000000?style=for-the-badge&logo=next.js)

**Live Production App**: [https://pharmasyncgh.vercel.app/](https://pharmasyncgh.vercel.app/)

PharmaSync GH is a clinical-grade multi-branch Pharmacy Management System tailored for Ghanaian retail pharmacies (Accra Central Main, Osu Branch, Spintex Branch).

---

## 🌟 Key Features

- 🏥 **Clinical Crisp Healthcare Theme**: Crisp slate/white light mode with executive dark mode toggle.
- ⚡ **Ultra-Fast Keyboard Search POS**: Zero-barcode dependency fuzzy search by brand name, generic name, strength, and dosage form.
- ⏳ **FEFO Expiry Batch Selection**: Automatic First-Expiring, First-Out batch deduction protecting inventory from expiring stock loss.
- 🔒 **Atomic Concurrency Protection**: Stored PL/pgSQL function (`process_sale_transaction`) to atomically execute sales and prevent negative stock.
- 📊 **Multi-Branch Inventory & Transfer Ledger**: Real-time stock visibility across branches with inter-branch transfer audit tracking.
- 🛒 **Wholesale Market Restock Assistant**: Mobile-responsive purchasing checklist for Okaishie/Drug Lane market runs.
- 📥 **Bulk CSV / Excel Stock Importer**: Client-side parsing, error validation, and 1-click bulk inventory onboarding.

---

## 🗄️ Database Setup (Supabase)

1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Copy and run the migration script located at:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. This creates all core tables (`branches`, `medicines`, `branch_stock`, `sales`, `sale_items`, `transfers`, `audit_logs`, `user_profiles`) and the atomic stored procedure `process_sale_transaction`.

---

## 🚀 Environment Variables

Create `.env.local` or configure in Vercel settings:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS v4, Lucide Icons, PapaParse.
- **Backend & Database**: PostgreSQL / Supabase, Server API Routes.
- **Hosting**: Vercel.
