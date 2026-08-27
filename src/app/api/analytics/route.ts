import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const safeNum = (val: any) => (isNaN(Number(val)) || val === null || val === undefined ? 0 : Number(val));

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');

    if (isSupabaseConfigured()) {
      let query = supabase.from('sales').select('*, sale_items(*)');
      if (branchId) query = query.eq('branch_id', branchId);

      const { data: salesData, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      // Fetch catalog cost prices for fallback resolution
      const { data: medsData } = await supabase.from('medicines').select('id, cost_price, retail_price');
      const medsCostMap = new Map((medsData || []).map(m => [m.id, safeNum(m.cost_price)]));

      let totalRevenue = 0;
      let totalCOGS = 0;
      const salesCount = (salesData || []).length;

      (salesData || []).forEach(s => {
        totalRevenue += safeNum(s.total_amount);
        (s.sale_items || []).forEach((item: any) => {
          const itemCost = safeNum(item.unit_cost_price) || safeNum(medsCostMap.get(item.medicine_id));
          totalCOGS += itemCost * safeNum(item.quantity);
        });
      });

      const grossProfit = Math.max(0, totalRevenue - totalCOGS);
      const grossMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
      const avgBasketValue = salesCount > 0 ? totalRevenue / salesCount : 0;

      return NextResponse.json({
        totalRevenue,
        totalCOGS,
        grossProfit,
        grossMarginPercent,
        avgBasketValue,
        salesCount,
        sales: salesData,
      });
    }

    // Fallback Mock Response
    return NextResponse.json({
      totalRevenue: 70.00,
      totalCOGS: 45.00,
      grossProfit: 25.00,
      grossMarginPercent: 35.71,
      avgBasketValue: 35.00,
      salesCount: 2,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
