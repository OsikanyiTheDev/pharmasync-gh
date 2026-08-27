import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, transferId, sourceBranchId, destBranchId, items, notes, requestedBy } = body;

    if (action === 'RECEIVE') {
      if (!transferId) {
        return NextResponse.json({ error: 'Transfer ID required' }, { status: 400 });
      }

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('transfers')
          .update({ status: 'RECEIVED', received_at: new Date().toISOString() })
          .eq('id', transferId)
          .select();

        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true, transfer: data[0] });
      }

      return NextResponse.json({ success: true, message: 'Transfer confirmed as received' });
    }

    // Default Dispatch Transfer Action
    if (!sourceBranchId || !destBranchId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Source branch, destination branch, and items required' }, { status: 400 });
    }

    const transferNo = `TRF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('transfers')
        .insert({
          transfer_no: transferNo,
          source_branch_id: sourceBranchId,
          dest_branch_id: destBranchId,
          batch_number: items[0].batchNumber || 'BATCH-001',
          quantity: items[0].quantity || 1,
          status: 'DISPATCHED',
          notes: notes || null,
          requested_by: requestedBy || 'Pharmacist',
        })
        .select();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, transfer: data[0] });
    }

    return NextResponse.json({
      success: true,
      transferNo,
      message: 'Inter-branch stock transfer dispatched successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
