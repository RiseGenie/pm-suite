import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import {
  startHuddle,
  stopHuddle,
  attachToHuddle,
  removeFromHuddle,
  saveDiscussionNotes,
  createHuddleTodo,
} from './actions';
import { SubmitButton } from '@/components/SubmitButton';
import { HuddleTimer } from '@/components/HuddleTimer';
import type { HuddleItemType } from '@/lib/types';

const TYPE_LABEL: Record<HuddleItemType, string> = { issue: 'Issue', todo: 'Todo', goal: 'Goal' };

export default async function HuddlePage() {
  const { profile } = await getCurrentProfile();
  const supabase = createClient();

  const { data: activeHuddle } = await supabase
    .from('huddles')
    .select('*')
    .eq('company_id', profile!.company_id)
    .is('ended_at', null)
    .maybeSingle();

  if (!activeHuddle) {
    const { data: pastHuddles } = await supabase
      .from('huddles')
      .select('*, starter:profiles!huddles_started_by_fkey(full_name)')
      .eq('company_id', profile!.company_id)
      .not('ended_at', 'is', null)
      .order('started_at', { ascending: false })
      .limit(20);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Huddle</h1>
            <p className="text-sm text-muted mt-1">
              Start a huddle to bring issues, todos and goals into one live discussion. Everyone gets the recap by
              email when it ends.
            </p>
          </div>
          <form action={startHuddle}>
            <SubmitButton className="btn btn-primary" pendingText="Starting…">
              Start huddle
            </SubmitButton>
          </form>
        </div>

        <div>
          <h2 className="font-semibold mb-3">Past huddles</h2>
          <div className="space-y-2">
            {pastHuddles?.length ? (
              pastHuddles.map((h) => {
                const items = h.summary ? (JSON.parse(h.summary) as { type: string; title: string }[]) : [];
                return (
                  <div key={h.id} className="card p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {new Date(h.started_at).toLocaleString()} · started by {h.starter?.full_name ?? 'Someone'}
                      </p>
                      <span className={`badge ${h.email_sent_at ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {h.email_sent_at ? 'Recap emailed' : 'Not emailed'}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-1">{items.length} item(s) discussed</p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted">No huddles yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const [{ data: discussionItems }, { data: issues }, { data: todos }, { data: goals }, { data: members }, { data: huddleTodos }] =
    await Promise.all([
      supabase.from('huddle_discussion_items').select('*').eq('huddle_id', activeHuddle.id).order('created_at'),
      supabase.from('issues').select('id, title, status').eq('company_id', profile!.company_id).neq('status', 'resolved'),
      supabase
        .from('tasks')
        .select('id, title, status')
        .eq('company_id', profile!.company_id)
        .is('project_id', null)
        .neq('status', 'done'),
      supabase.from('goals').select('id, title, status').eq('company_id', profile!.company_id).neq('status', 'completed'),
      supabase.from('profiles').select('id, full_name').eq('company_id', profile!.company_id),
      supabase
        .from('tasks')
        .select('id, title, due_date, assignee:profiles!tasks_assignee_id_fkey(full_name)')
        .eq('huddle_id', activeHuddle.id),
    ]);

  const attachedIds = new Set((discussionItems ?? []).map((d) => `${d.item_type}:${d.item_id}`));
  const titleLookup: Record<string, string> = {};
  issues?.forEach((i) => (titleLookup[`issue:${i.id}`] = i.title));
  todos?.forEach((t) => (titleLookup[`todo:${t.id}`] = t.title));
  goals?.forEach((g) => (titleLookup[`goal:${g.id}`] = g.title));

  const stopAction = stopHuddle.bind(null, activeHuddle.id);
  const createTodoAction = createHuddleTodo.bind(null, activeHuddle.id);

  return (
    <div className="space-y-6">
      <div className="card p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">Huddle in progress</p>
          <HuddleTimer startedAt={activeHuddle.started_at} />
        </div>
        <form action={stopAction}>
          <SubmitButton className="btn btn-danger" pendingText="Stopping…">
            Stop huddle &amp; email recap
          </SubmitButton>
        </form>
      </div>

      <div>
        <h2 className="font-semibold mb-3">In this huddle ({discussionItems?.length ?? 0})</h2>
        <div className="space-y-2">
          {discussionItems?.length ? (
            discussionItems.map((d) => (
              <div key={d.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="badge bg-slate-100 text-slate-600 mb-2">{TYPE_LABEL[d.item_type as HuddleItemType]}</span>
                    <p className="font-medium">{titleLookup[`${d.item_type}:${d.item_id}`] ?? 'Untitled'}</p>
                    <form action={saveDiscussionNotes.bind(null, d.id)} className="flex gap-2 mt-2">
                      <textarea
                        name="notes"
                        defaultValue={d.notes ?? ''}
                        rows={2}
                        placeholder="Discussion notes…"
                        className="input text-xs"
                      />
                      <SubmitButton className="btn btn-secondary text-xs shrink-0" pendingText="Saving…">
                        Save
                      </SubmitButton>
                    </form>
                  </div>
                  <form action={removeFromHuddle.bind(null, d.id)}>
                    <SubmitButton className="text-xs text-muted hover:text-danger" pendingText="Removing…">
                      Remove
                    </SubmitButton>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">Nothing brought in yet — add issues, todos or goals below.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { type: 'issue' as HuddleItemType, label: 'Issues', items: issues },
          { type: 'todo' as HuddleItemType, label: 'Todos', items: todos },
          { type: 'goal' as HuddleItemType, label: 'Goals', items: goals },
        ].map((col) => (
          <div key={col.type} className="card p-4">
            <h3 className="text-sm font-semibold mb-2">{col.label}</h3>
            <div className="space-y-1">
              {col.items
                ?.filter((item) => !attachedIds.has(`${col.type}:${item.id}`))
                .map((item) => (
                  <form key={item.id} action={attachToHuddle.bind(null, activeHuddle.id, col.type, item.id)} className="flex items-center justify-between gap-2">
                    <span className="text-xs truncate">{item.title}</span>
                    <SubmitButton className="text-xs text-primary shrink-0" pendingText="Adding…">
                      + Discuss
                    </SubmitButton>
                  </form>
                ))}
              {!col.items?.filter((item) => !attachedIds.has(`${col.type}:${item.id}`)).length && (
                <p className="text-xs text-muted">Nothing left to add.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-3">Assign a new todo</h3>
          <form action={createTodoAction} className="space-y-2">
            <input name="title" required placeholder="Todo title" className="input" />
            <div className="grid grid-cols-2 gap-2">
              <select name="assignee_id" defaultValue="" className="input">
                <option value="">Unassigned</option>
                {members?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name ?? m.id}
                  </option>
                ))}
              </select>
              <input name="deadline" type="date" className="input" />
            </div>
            <SubmitButton className="btn btn-primary w-full" pendingText="Adding…">
              Assign todo
            </SubmitButton>
          </form>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-3">New todos this huddle ({huddleTodos?.length ?? 0})</h3>
          <div className="space-y-1">
            {huddleTodos?.map((t) => (
              <div key={t.id} className="text-sm flex items-center justify-between">
                <span>{t.title}</span>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <span className="text-xs text-muted">{(t as any).assignee?.full_name ?? 'Unassigned'}</span>
              </div>
            ))}
            {!huddleTodos?.length && <p className="text-xs text-muted">None yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
