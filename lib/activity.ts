import { createClient } from '@/lib/supabase/server';

export async function logActivity({
  companyId,
  actorId,
  action,
  entityType,
  entityId,
  metadata,
}: {
  companyId: string | null;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createClient();
  await supabase.from('activity_log').insert({
    company_id: companyId,
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    metadata: metadata ?? {},
  });
}
