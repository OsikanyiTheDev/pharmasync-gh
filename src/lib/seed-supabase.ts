import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yrwpoyqgdvcdfsvcucuc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyd3BveXFnZHZjZGZzdmN1Y3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MTkyNzMsImV4cCI6MjEwMzM5NTI3M30.g4gdDTWtJUgpUtsB1pUlQ4PaPBwqjwLmo8LBHAWZMBY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function seedLiveSupabaseDatabase() {
  console.log('🌱 Starting Supabase Live Database Seed for PharmaSync GH...');

  // 1. Ensure Branches Exist
  const branches = [
    {
      id: 'a1b2c3d4-0001-4000-8000-000000000001',
      name: 'Accra Central Main',
      code: 'ACCRA_MAIN',
      location: 'Makola Pharmacy Zone, Accra',
      phone: '+233 24 411 2233',
      manager: 'Dr. Kwame Mensah (PharmD)',
      is_main: true,
    },
    {
      id: 'a1b2c3d4-0002-4000-8000-000000000002',
      name: 'Osu Branch',
      code: 'OSU_BRANCH',
      location: 'Oxford Street, Osu Accra',
      phone: '+233 20 882 1144',
      manager: 'Abena Osei',
      is_main: false,
    },
    {
      id: 'a1b2c3d4-0003-4000-8000-000000000003',
      name: 'Spintex Branch',
      code: 'SPINTEX_BRANCH',
      location: 'Spintex Coastal Junction, Accra',
      phone: '+233 55 993 4455',
      manager: 'Kofi Boateng',
      is_main: false,
    },
  ];

  const { error: branchErr } = await supabase.from('branches').upsert(branches, { onConflict: 'code' });
  if (branchErr) {
    console.error('Error seeding branches:', branchErr.message);
  } else {
    console.log('✅ Branches verified / created.');
  }

  // 2. Ghanaian Medicines Catalog
  const medicines = [
    // Anti-Malarials
    {
      brand_name: 'Lonart DS',
      generic_name: 'Artemether 80mg / Lumefantrine 480mg',
      category: 'Anti-Malarial',
      dosage_form: 'Tablets',
      strength: '80mg/480mg',
      pack_size: '6 Tablets',
      retail_price: 35.00,
      cost_price: 22.50,
      reorder_level: 15,
      requires_prescription: false,
      nafdac_fda_no: 'FDA/SD.22-8812',
    },
    {
      brand_name: 'Coartem',
      generic_name: 'Artemether 20mg / Lumefantrine 120mg',
      category: 'Anti-Malarial',
      dosage_form: 'Tablets',
      strength: '20mg/120mg',
      pack_size: '24 Tablets',
      retail_price: 45.00,
      cost_price: 30.00,
      reorder_level: 20,
      requires_prescription: false,
      nafdac_fda_no: 'FDA/SD.19-4401',
    },
    {
      brand_name: 'Artequick',
      generic_name: 'Artemisinin 62.5mg / Piperaquine 375mg',
      category: 'Anti-Malarial',
      dosage_form: 'Tablets',
      strength: '62.5mg/375mg',
      pack_size: '4 Tablets',
      retail_price: 30.00,
      cost_price: 18.00,
      reorder_level: 10,
      requires_prescription: false,
      nafdac_fda_no: 'FDA/SD.21-0982',
    },
    // Antibiotics
    {
      brand_name: 'Letap Amoxicillin',
      generic_name: 'Amoxicillin Trihydrate',
      category: 'Antibiotic',
      dosage_form: 'Capsules',
      strength: '500mg',
      pack_size: '10x10 Blister',
      retail_price: 25.00,
      cost_price: 14.00,
      reorder_level: 25,
      requires_prescription: true,
      nafdac_fda_no: 'FDA/SD.18-5050',
    },
    {
      brand_name: 'Augmentin 625mg',
      generic_name: 'Amoxicillin-Clavulanate',
      category: 'Antibiotic',
      dosage_form: 'Tablets',
      strength: '625mg',
      pack_size: '14 Tablets',
      retail_price: 75.00,
      cost_price: 48.00,
      reorder_level: 15,
      requires_prescription: true,
      nafdac_fda_no: 'FDA/SD.20-1123',
    },
    {
      brand_name: 'Kinapharma Ciprofloxacin',
      generic_name: 'Ciprofloxacin Hydrochloride',
      category: 'Antibiotic',
      dosage_form: 'Tablets',
      strength: '500mg',
      pack_size: '10 Tablets',
      retail_price: 30.00,
      cost_price: 18.50,
      reorder_level: 12,
      requires_prescription: true,
      nafdac_fda_no: 'FDA/SD.17-2900',
    },
    {
      brand_name: 'Azithromycin 500mg',
      generic_name: 'Azithromycin Dihydrate',
      category: 'Antibiotic',
      dosage_form: 'Tablets',
      strength: '500mg',
      pack_size: '3 Tablets',
      retail_price: 35.00,
      cost_price: 20.00,
      reorder_level: 10,
      requires_prescription: true,
      nafdac_fda_no: 'FDA/SD.23-7741',
    },
    // Pain & Analgesics
    {
      brand_name: 'Emzor Paracetamol',
      generic_name: 'Paracetamol',
      category: 'Pain & Analgesics',
      dosage_form: 'Tablets',
      strength: '500mg',
      pack_size: '10x10 Blister',
      retail_price: 12.00,
      cost_price: 6.50,
      reorder_level: 50,
      requires_prescription: false,
      nafdac_fda_no: 'FDA/SD.16-0012',
    },
    {
      brand_name: 'Diclofenac Gel',
      generic_name: 'Diclofenac Sodium 1% w/w',
      category: 'Pain & Analgesics',
      dosage_form: 'Topical Gel',
      strength: '1% 50g',
      pack_size: '1 Tube',
      retail_price: 20.00,
      cost_price: 11.00,
      reorder_level: 10,
      requires_prescription: false,
      nafdac_fda_no: 'FDA/SD.21-3310',
    },
    {
      brand_name: 'Ibuprofen 400mg',
      generic_name: 'Ibuprofen BP',
      category: 'Pain & Analgesics',
      dosage_form: 'Tablets',
      strength: '400mg',
      pack_size: '10x10 Blister',
      retail_price: 18.00,
      cost_price: 9.50,
      reorder_level: 30,
      requires_prescription: false,
      nafdac_fda_no: 'FDA/SD.19-8821',
    },
    // Hypertension & Chronic
    {
      brand_name: 'Amlodipine 10mg',
      generic_name: 'Amlodipine Besylate',
      category: 'Cardiovascular & Chronic',
      dosage_form: 'Tablets',
      strength: '10mg',
      pack_size: '30 Tablets',
      retail_price: 28.00,
      cost_price: 15.00,
      reorder_level: 20,
      requires_prescription: true,
      nafdac_fda_no: 'FDA/SD.22-4410',
    },
    {
      brand_name: 'Lisinopril 10mg',
      generic_name: 'Lisinopril Dihydrate',
      category: 'Cardiovascular & Chronic',
      dosage_form: 'Tablets',
      strength: '10mg',
      pack_size: '28 Tablets',
      retail_price: 32.00,
      cost_price: 18.00,
      reorder_level: 15,
      requires_prescription: true,
      nafdac_fda_no: 'FDA/SD.21-0099',
    },
    {
      brand_name: 'Metformin 500mg',
      generic_name: 'Metformin Hydrochloride',
      category: 'Cardiovascular & Chronic',
      dosage_form: 'Tablets',
      strength: '500mg',
      pack_size: '100 Tablets',
      retail_price: 40.00,
      cost_price: 24.00,
      reorder_level: 25,
      requires_prescription: true,
      nafdac_fda_no: 'FDA/SD.20-5541',
    },
    // Syrups & Rehydration
    {
      brand_name: 'Benylin 4Flu',
      generic_name: 'Diphenhydramine / Paracetamol / Pseudoephedrine',
      category: 'Cough & Cold',
      dosage_form: 'Syrup',
      strength: '100ml Syrup',
      pack_size: '1 Bottle',
      retail_price: 38.00,
      cost_price: 24.00,
      reorder_level: 15,
      requires_prescription: false,
      nafdac_fda_no: 'FDA/SD.19-9012',
    },
    {
      brand_name: 'Feroglobin Syrup',
      generic_name: 'Liquid Iron + Vitamin B Complex + Zinc',
      category: 'Vitamins & Supplements',
      dosage_form: 'Syrup',
      strength: '200ml Syrup',
      pack_size: '1 Bottle',
      retail_price: 65.00,
      cost_price: 42.00,
      reorder_level: 12,
      requires_prescription: false,
      nafdac_fda_no: 'FDA/SD.23-1100',
    },
    {
      brand_name: 'Royal ORS Sachets',
      generic_name: 'Oral Rehydration Salts (WHO Formula)',
      category: 'OTC & General Wellness',
      dosage_form: 'Oral Powder Sachet',
      strength: '20.5g Sachet',
      pack_size: '10 Sachets',
      retail_price: 15.00,
      cost_price: 8.00,
      reorder_level: 40,
      requires_prescription: false,
      nafdac_fda_no: 'FDA/SD.18-2234',
    },
  ];

  const { data: seededMeds, error: medErr } = await supabase
    .from('medicines')
    .upsert(medicines, { onConflict: 'brand_name' })
    .select();

  if (medErr || !seededMeds) {
    console.error('Error seeding medicines:', medErr?.message);
    return;
  }
  console.log(`✅ ${seededMeds.length} Ghanaian Medicines inserted / updated.`);

  // 3. Populate FEFO Batches across 3 Branches (Accra Central, Osu, Spintex)
  const mainBranchId = 'a1b2c3d4-0001-4000-8000-000000000001';
  const osuBranchId = 'a1b2c3d4-0002-4000-8000-000000000002';
  const spintexBranchId = 'a1b2c3d4-0003-4000-8000-000000000003';

  const batchList: any[] = [];

  seededMeds.forEach((med) => {
    // Healthy Batch for Main Branch
    batchList.push({
      branch_id: mainBranchId,
      medicine_id: med.id,
      batch_number: `BTH-${med.brand_name.substring(0, 3).toUpperCase()}-2027A`,
      expiry_date: '2027-11-30',
      quantity: 120,
      unit_cost_price: med.cost_price,
      unit_selling_price: med.retail_price,
      shelf_location: 'Shelf A1 (Main)',
    });

    // Near Expiry Batch for Main Branch (<= 90 days: e.g. Oct 2026)
    batchList.push({
      branch_id: mainBranchId,
      medicine_id: med.id,
      batch_number: `BTH-${med.brand_name.substring(0, 3).toUpperCase()}-2026EXP`,
      expiry_date: '2026-10-15',
      quantity: 25,
      unit_cost_price: med.cost_price,
      unit_selling_price: med.retail_price * 0.8, // discounted near expiry
      shelf_location: 'Shelf A-FEFO',
    });

    // Osu Branch Batches
    batchList.push({
      branch_id: osuBranchId,
      medicine_id: med.id,
      batch_number: `BTH-${med.brand_name.substring(0, 3).toUpperCase()}-OSU01`,
      expiry_date: '2028-04-30',
      quantity: 65,
      unit_cost_price: med.cost_price,
      unit_selling_price: med.retail_price,
      shelf_location: 'Dispensary Bay 2',
    });

    // Spintex Branch Batches (Some expired or near expiry)
    batchList.push({
      branch_id: spintexBranchId,
      medicine_id: med.id,
      batch_number: `BTH-${med.brand_name.substring(0, 3).toUpperCase()}-SPX01`,
      expiry_date: '2027-08-20',
      quantity: 45,
      unit_cost_price: med.cost_price,
      unit_selling_price: med.retail_price,
      shelf_location: 'Spintex Store 1',
    });
  });

  // Add a few expired batches specifically to demonstrate FEFO alert pills
  if (seededMeds[0]) {
    batchList.push({
      branch_id: mainBranchId,
      medicine_id: seededMeds[0].id,
      batch_number: 'EXP-LON-2025',
      expiry_date: '2025-12-31',
      quantity: 8,
      unit_cost_price: 22.50,
      unit_selling_price: 35.00,
      shelf_location: 'Quarantine Rack',
    });
  }

  const { error: batchErr } = await supabase.from('branch_stock').upsert(batchList, {
    onConflict: 'branch_id,medicine_id,batch_number',
  });

  if (batchErr) {
    console.error('Error seeding branch stock batches:', batchErr.message);
  } else {
    console.log(`✅ ${batchList.length} multi-branch FEFO stock batches inserted / updated.`);
  }

  console.log('🎉 Live Supabase Database Seed Complete!');
}
