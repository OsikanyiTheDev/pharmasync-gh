import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const timeFrame = searchParams.get('timeFrame') || 'ALL';

    if (isSupabaseConfigured()) {
      let query = supabase.from('sales').select('*, sale_items(*)');
      if (branchId) query = query.eq('branch_id', branchId);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      const totalRevenue = (data || []).reduce((sum, s) => sum + (s.total_amount || 0), 0);
      return NextResponse.json({
        totalRevenue,
        salesCount: (data || []).length,
        sales: data,
      });
    }

    // Mock Real-Time Metrics Response
    return NextResponse.json({
      totalRevenue: 24850.50,
      cogs: 14200.00,
      grossProfit: 10650.50,
      profitMarginPercent: 42.86,
      branchBreakdown: {
        ACCRA_MAIN: 12450.00,
        OSU_BRANCH: 7400.50,
        SPINTEX_BRANCH: 5000.00,
      },
      paymentMethods: {
        CASH: 14000.00,
        MOMO_MTN: 8500.50,
        MOMO_TELECEL: 2350.00,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
