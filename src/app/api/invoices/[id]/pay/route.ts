import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: invoice } = await supabase
    .from('invoices')
    .select('id, status')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { error } = await supabase
    .from('invoices')
    .update({ status: 'paid', updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
