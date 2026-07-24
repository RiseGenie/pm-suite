'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { recordAttachment } from '@/app/dashboard/projects/[id]/actions';

export function AttachmentUploader({
  taskId,
  projectId,
  companyId,
}: {
  taskId: string;
  projectId: string;
  companyId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const path = `${companyId}/${taskId}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage.from('attachments').upload(path, file);
    if (!error) {
      await recordAttachment(taskId, projectId, path, file.name, file.size, file.type);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <input ref={inputRef} type="file" onChange={handleChange} disabled={uploading} className="text-xs" />
      {uploading && <p className="text-xs text-muted mt-1">Uploading…</p>}
    </div>
  );
}
