import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const issueId = params.id
  if (!issueId) return NextResponse.json({ ok: false, error: 'Missing issue id' }, { status: 400 })

  // Transaction-like sequence (Supabase PostgREST does not support multi-step tx here; keep order)
  try {
    // Fetch issue to capture metadata and images for cleanup
    const { data: issue, error: fetchErr } = await supabaseAdmin
      .from('issues')
      .select('id, images, citizen_id')
      .eq('id', issueId)
      .maybeSingle()
    if (fetchErr) {
      return NextResponse.json({ ok: false, error: fetchErr.message }, { status: 500 })
    }

    // Delete dependents first (if no ON DELETE CASCADE)
    await supabaseAdmin.from('issue_comments').delete().eq('issue_id', issueId)
    await supabaseAdmin.from('issue_votes').delete().eq('issue_id', issueId)
    await supabaseAdmin.from('issue_updates').delete().eq('issue_id', issueId)

    // Delete issue
    const { error: delErr } = await supabaseAdmin.from('issues').delete().eq('id', issueId)
    if (delErr) {
      return NextResponse.json({ ok: false, error: delErr.message }, { status: 500 })
    }

    // Audit log
    try {
      const imgs = (issue as any)?.images ?? []
      await supabaseAdmin.from('activity_logs').insert({
        action: 'delete_issue',
        description: `Issue ${issueId} deleted`,
        user_id: 'system',
        entity_type: 'issue',
        entity_id: issueId,
        metadata: { issueId, images: imgs }
      } as any)
    } catch {}

    // TODO: delete images from storage if used; left as placeholder as buckets not defined here

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Delete failed' }, { status: 500 })
  }
}
