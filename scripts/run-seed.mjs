import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yrwpoyqgdvcdfsvcucuc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyd3BveXFnZHZjZGZzdmN1Y3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MTkyNzMsImV4cCI6MjEwMzM5NTI3M30.g4gdDTWtJUgpUtsB1pUlQ4PaPBwqjwLmo8LBHAWZMBY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runSeed() {
  console.log('🌱 Triggering Live Supabase Seed...');

  // 1. Fetch Branches
  const { data: branchData, error: bErr } = await supabase.from('branches').select('*');
  if (bErr || !branchData || branchData.length === 0) {
    console.error('Branches error / none found:', bErr?.message);
    return;
  }
  console.log(`✅ Found ${branchData.length} live branches in Supabase:`, branchData.map(b => b.name).join(', '));

  const mainBranch = branchData.find(b => b.code === 'ACCRA_MAIN') || branchData[0];
  const osuBranch = branchData.find(b => b.code === 'OSU_BRANCH') || branchData[1] || branchData[0];
  const spintexBranch = branchData.find(b => b.code === 'SPINTEX_BRANCH') || branchData[2] || branchData[0];

  // 2. Ghanaian Medicines Catalog
  const medicines = [
    { brand_name: 'Lonart DS', generic_name: 'Artemether 80mg / Lumefantrine 480mg', category: 'Anti-Malarial', dosage_form: 'Tablets', strength: '80mg/480mg', pack_size: '6 Tablets', retail_price: 35.00, cost_price: 22.50, reorder_level: 15, requires_prescription: false, nafdac_fda_no: 'FDA/SD.22-8812' },
    { brand_name: 'Coartem', generic_name: 'Artemether 20mg / Lumefantrine 120mg', category: 'Anti-Malarial', dosage_form: 'Tablets', strength: '20mg/120mg', pack_size: '24 Tablets', retail_price: 45.00, cost_price: 30.00, reorder_level: 20, requires_prescription: false, nafdac_fda_no: 'FDA/SD.19-4401' },
    { brand_name: 'Artequick', generic_name: 'Artemisinin 62.5mg / Piperaquine 375mg', category: 'Anti-Malarial', dosage_form: 'Tablets', strength: '62.5mg/375mg', pack_size: '4 Tablets', retail_price: 30.00, cost_price: 18.00, reorder_level: 10, requires_prescription: false, nafdac_fda_no: 'FDA/SD.21-0982' },
    { brand_name: 'Letap Amoxicillin', generic_name: 'Amoxicillin Trihydrate', category: 'Antibiotic', dosage_form: 'Capsules', strength: '500mg', pack_size: '10x10 Blister', retail_price: 25.00, cost_price: 14.00, reorder_level: 25, requires_prescription: true, nafdac_fda_no: 'FDA/SD.18-5050' },
    { brand_name: 'Augmentin 625mg', generic_name: 'Amoxicillin-Clavulanate', category: 'Antibiotic', dosage_form: 'Tablets', strength: '625mg', pack_size: '14 Tablets', retail_price: 75.00, cost_price: 48.00, reorder_level: 15, requires_prescription: true, nafdac_fda_no: 'FDA/SD.20-1123' },
    { brand_name: 'Kinapharma Ciprofloxacin', generic_name: 'Ciprofloxacin Hydrochloride', category: 'Antibiotic', dosage_form: 'Tablets', strength: '500mg', pack_size: '10 Tablets', retail_price: 30.00, cost_price: 18.50, reorder_level: 12, requires_prescription: true, nafdac_fda_no: 'FDA/SD.17-2900' },
    { brand_name: 'Azithromycin 500mg', generic_name: 'Azithromycin Dihydrate', category: 'Antibiotic', dosage_form: 'Tablets', strength: '500mg', pack_size: '3 Tablets', retail_price: 35.00, cost_price: 20.00, reorder_level: 10, requires_prescription: true, nafdac_fda_no: 'FDA/SD.23-7741' },
    { brand_name: 'Emzor Paracetamol', generic_name: 'Paracetamol', category: 'Pain & Analgesics', dosage_form: 'Tablets', strength: '500mg', pack_size: '10x10 Blister', retail_price: 12.00, cost_price: 6.50, reorder_level: 50, requires_prescription: false, nafdac_fda_no: 'FDA/SD.16-0012' },
    { brand_name: 'Diclofenac Gel', generic_name: 'Diclofenac Sodium 1% w/w', category: 'Pain & Analgesics', dosage_form: 'Topical Gel', strength: '1% 50g', pack_size: '1 Tube', retail_price: 20.00, cost_price: 11.00, reorder_level: 10, requires_prescription: false, nafdac_fda_no: 'FDA/SD.21-3310' },
    { brand_name: 'Ibuprofen 400mg', generic_name: 'Ibuprofen BP', category: 'Pain & Analgesics', dosage_form: 'Tablets', strength: '400mg', pack_size: '10x10 Blister', retail_price: 18.00, cost_price: 9.50, reorder_level: 30, requires_prescription: false, nafdac_fda_no: 'FDA/SD.19-8821' },
    { brand_name: 'Amlodipine 10mg', generic_name: 'Amlodipine Besylate', category: 'Cardiovascular & Chronic', dosage_form: 'Tablets', strength: '10mg', pack_size: '30 Tablets', retail_price: 28.00, cost_price: 15.00, reorder_level: 20, requires_prescription: true, nafdac_fda_no: 'FDA/SD.22-4410' },
    { brand_name: 'Lisinopril 10mg', generic_name: 'Lisinopril Dihydrate', category: 'Cardiovascular & Chronic', dosage_form: 'Tablets', strength: '10mg', pack_size: '28 Tablets', retail_price: 32.00, cost_price: 18.00, reorder_level: 15, requires_prescription: true, nafdac_fda_no: 'FDA/SD.21-0099' },
    { brand_name: 'Metformin 500mg', generic_name: 'Metformin Hydrochloride', category: 'Cardiovascular & Chronic', dosage_form: 'Tablets', strength: '500mg', pack_size: '100 Tablets', retail_price: 40.00, cost_price: 24.00, reorder_level: 25, requires_prescription: true, nafdac_fda_no: 'FDA/SD.20-5541' },
    { brand_name: 'Benylin 4Flu', generic_name: 'Diphenhydramine / Paracetamol / Pseudoephedrine', category: 'Cough & Cold', dosage_form: 'Syrup', strength: '100ml Syrup', pack_size: '1 Bottle', retail_price: 38.00, cost_price: 24.00, reorder_level: 15, requires_prescription: false, nafdac_fda_no: 'FDA/SD.19-9012' },
    { brand_name: 'Feroglobin Syrup', generic_name: 'Liquid Iron + Vitamin B Complex + Zinc', category: 'Vitamins & Supplements', dosage_form: 'Syrup', strength: '200ml Syrup', pack_size: '1 Bottle', retail_price: 65.00, cost_price: 42.00, reorder_level: 12, requires_prescription: false, nafdac_fda_no: 'FDA/SD.23-1100' },
    { brand_name: 'Royal ORS Sachets', generic_name: 'Oral Rehydration Salts (WHO Formula)', category: 'OTC & General Wellness', dosage_form: 'Oral Powder Sachet', strength: '20.5g Sachet', pack_size: '10 Sachets', retail_price: 15.00, cost_price: 8.00, reorder_level: 40, requires_prescription: false, nafdac_fda_no: 'FDA/SD.18-2234' },
  ];

  // Insert medicines (filtering existing ones)
  const { data: existingMeds } = await supabase.from('medicines').select('*');
  let activeMeds = existingMeds || [];

  if (activeMeds.length === 0) {
    const { data: inserted, error: mErr } = await supabase.from('medicines').insert(medicines).select();
    if (mErr) {
      console.error('Insert Medicines Error:', mErr.message);
      return;
    }
    activeMeds = inserted || [];
  } else {
    // Check if any missing
    const existingNames = new Set(activeMeds.map(m => m.brand_name));
    const missing = medicines.filter(m => !existingNames.has(m.brand_name));
    if (missing.length > 0) {
      const { data: added } = await supabase.from('medicines').insert(missing).select();
      if (added) activeMeds = [...activeMeds, ...added];
    }
  }

  console.log(`✅ ${activeMeds.length} Ghanaian medicines active in database.`);

  // 3. Batches across Accra Main, Osu, Spintex
  const batchList = [];

  activeMeds.forEach((med) => {
    // Healthy Batch Accra Main (> 90 days)
    batchList.push({
      branch_id: mainBranch.id,
      medicine_id: med.id,
      batch_number: `BTH-${med.brand_name.substring(0, 3).toUpperCase()}-2027A`,
      expiry_date: '2027-11-30',
      quantity: 120,
      unit_cost_price: med.cost_price,
      unit_selling_price: med.retail_price,
      shelf_location: 'Shelf A1 (Main)',
    });

    // Near Expiry Batch Accra Main (<= 90 days)
    batchList.push({
      branch_id: mainBranch.id,
      medicine_id: med.id,
      batch_number: `BTH-${med.brand_name.substring(0, 3).toUpperCase()}-2026EXP`,
      expiry_date: '2026-10-15',
      quantity: 25,
      unit_cost_price: med.cost_price,
      unit_selling_price: Number((med.retail_price * 0.85).toFixed(2)),
      shelf_location: 'Shelf A-FEFO',
    });

    // Osu Branch Batch
    batchList.push({
      branch_id: osuBranch.id,
      medicine_id: med.id,
      batch_number: `BTH-${med.brand_name.substring(0, 3).toUpperCase()}-OSU01`,
      expiry_date: '2028-04-30',
      quantity: 65,
      unit_cost_price: med.cost_price,
      unit_selling_price: med.retail_price,
      shelf_location: 'Dispensary Bay 2',
    });

    // Spintex Branch Batch
    batchList.push({
      branch_id: spintexBranch.id,
      medicine_id: med.id,
      batch_number: `BTH-${med.brand_name.substring(0, 3).toUpperCase()}-SPX01`,
      expiry_date: '2027-08-20',
      quantity: 45,
      unit_cost_price: med.cost_price,
      unit_selling_price: med.retail_price,
      shelf_location: 'Spintex Store 1',
    });
  });

  // Specific Expired Batch to test FEFO red warning
  if (activeMeds[0]) {
    batchList.push({
      branch_id: mainBranch.id,
      medicine_id: activeMeds[0].id,
      batch_number: 'EXP-LON-2025',
      expiry_date: '2025-12-31',
      quantity: 8,
      unit_cost_price: 22.50,
      unit_selling_price: 35.00,
      shelf_location: 'Quarantine Rack',
    });
  }

  const { error: btErr } = await supabase
    .from('branch_stock')
    .upsert(batchList, { onConflict: 'branch_id,medicine_id,batch_number' });

  if (btErr) console.error('Batch Error:', btErr.message);
  else console.log(`✅ ${batchList.length} multi-branch FEFO stock batches inserted into live Supabase!`);

  console.log('✨ Live Database Seeding Successfully Completed!');
}

runSeed().catch((err) => console.error('Seed exception:', err));
