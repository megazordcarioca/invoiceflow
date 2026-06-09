import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*, invoice_line_items(*)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (error || !invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: existing } = await supabase
    .from('invoices')
    .select('status')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const { line_items, ...invoiceUpdates } = body;

  if (existing.status === 'sent' && (invoiceUpdates.client_name || invoiceUpdates.client_email || line_items)) {
    return NextResponse.json(
      { error: 'Cannot edit client info or line items on sent invoices' },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase
    .from('invoices')
    .update({ ...invoiceUpdates, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  if (line_items && existing.status !== 'sent') {
    await supabase.from('invoice_line_items').delete().eq('invoice_id', params.id);

    if (line_items.length > 0) {
      const items = line_items.map((item: { description: string; quantity: number; unit_price: number }) => ({
        invoice_id: params.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));
      await supabase.from('invoice_line_items').insert(items);
    }
  }

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, invoice_line_items(*)')
    .eq('id', params.id)
    .single();

  return NextResponse.json(invoice);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
