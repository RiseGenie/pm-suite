'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function LogoUploader({
  scopeFolder,
  currentUrl,
  action,
  label = 'Logo',
}: {
  scopeFolder: string;
  currentUrl: string | null;
  action: (url: string) => Promise<void> | void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const path = `${scopeFolder}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage.from('branding').upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from('branding').getPublicUrl(path);
      await action(data.publicUrl);
      setPreview(data.publicUrl);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <label className="text-xs font-medium text-muted">{label}</label>
      <div className="flex items-center gap-3 mt-1">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={label} className="h-10 w-10 object-contain rounded border" style={{ borderColor: 'var(--color-border)' }} />
        ) : (
          <div className="h-10 w-10 rounded border flex items-center justify-center text-xs text-muted" style={{ borderColor: 'var(--color-border)' }}>
            None
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} disabled={uploading} className="text-xs" />
      </div>
      {uploading && <p className="text-xs text-muted mt-1">Uploading…</p>}
    </div>
  );
}
