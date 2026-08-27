import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { branchId, cashierId, customerName, customerPhone, doctorName, paymentMethod, totalAmount, items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart items required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      // Execute stored procedure process_sale_transaction
      const { data, error } = await supabase.rpc('process_sale_transaction', {
        p_branch_id: branchId,
        p_cashier_id: cashierId || null,
        p_customer_name: customerName || 'Walk-in Patient',
        p_customer_phone: customerPhone || null,
        p_doctor_name: doctorName || null,
        p_payment_method: paymentMethod || 'CASH',
        p_total_amount: totalAmount,
        p_items: items,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json(data);
    }

    // Mock API Response when Supabase environment variables are not set
    const mockInvoiceNo = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    return NextResponse.json({
      success: true,
      sale_id: `sale-${Date.now()}`,
      invoice_number: mockInvoiceNo,
      total_amount: totalAmount,
      message: 'Atomic sale transaction processed successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
