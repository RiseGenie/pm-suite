'use client';

import { useState } from 'react';
import type { CompanyTheme } from '@/lib/types';
import { SubmitButton } from '@/components/SubmitButton';

const COLOR_GROUPS: { label: string; fields: { key: keyof CompanyTheme; label: string }[] }[] = [
  {
    label: 'Brand',
    fields: [
      { key: 'primary_color', label: 'Primary' },
      { key: 'secondary_color', label: 'Secondary' },
      { key: 'accent_color', label: 'Accent' },
    ],
  },
  {
    label: 'Surfaces',
    fields: [
      { key: 'background_color', label: 'Page background' },
      { key: 'surface_color', label: 'Card / surface' },
      { key: 'border_color', label: 'Borders' },
    ],
  },
  {
    label: 'Text',
    fields: [
      { key: 'text_color', label: 'Primary text' },
      { key: 'muted_text_color', label: 'Muted text' },
    ],
  },
  {
    label: 'Status colors',
    fields: [
      { key: 'success_color', label: 'Success' },
      { key: 'warning_color', label: 'Warning' },
      { key: 'danger_color', label: 'Danger' },
    ],
  },
  {
    label: 'Sidebar',
    fields: [
      { key: 'sidebar_bg_color', label: 'Sidebar background' },
      { key: 'sidebar_text_color', label: 'Sidebar text' },
    ],
  },
];

export function ThemeCustomizerForm({
  theme,
  action,
}: {
  theme: CompanyTheme;
  action: (formData: FormData) => void;
}) {
  const [preview, setPreview] = useState<CompanyTheme>(theme);

  function set<K extends keyof CompanyTheme>(key: K, value: CompanyTheme[K]) {
    setPreview((p) => ({ ...p, [key]: value }));
  }

  return (
    <form action={action} className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        {COLOR_GROUPS.map((group) => (
          <div key={group.label} className="card p-5">
            <h3 className="font-semibold mb-3">{group.label}</h3>
            <div className="grid grid-cols-3 gap-4">
              {group.fields.map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-muted">{f.label}</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      name={f.key}
                      defaultValue={preview[f.key] as string}
                      onChange={(e) => set(f.key, e.target.value as never)}
                      className="h-9 w-9 rounded border border-slate-200 cursor-pointer"
                    />
                    <input
                      value={preview[f.key] as string}
                      onChange={(e) => set(f.key, e.target.value as never)}
                      className="input text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="card p-5">
          <h3 className="font-semibold mb-3">Typography &amp; shape</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted">Font family</label>
              <select
                name="font_family"
                defaultValue={theme.font_family}
                onChange={(e) => set('font_family', e.target.value)}
                className="input mt-1"
              >
                <option value="Inter, system-ui, sans-serif">Inter</option>
                <option value="'Segoe UI', system-ui, sans-serif">Segoe UI</option>
                <option value="Georgia, serif">Georgia (serif)</option>
                <option value="'Courier New', monospace">Courier New (mono)</option>
                <option value="Poppins, system-ui, sans-serif">Poppins</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Corner radius</label>
              <select
                name="radius"
                defaultValue={theme.radius}
                onChange={(e) => set('radius', e.target.value)}
                className="input mt-1"
              >
                <option value="0px">Square</option>
                <option value="0.25rem">Subtle</option>
                <option value="0.5rem">Rounded</option>
                <option value="1rem">Very rounded</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Density</label>
              <select name="density" defaultValue={theme.density} className="input mt-1">
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-3">Custom CSS (advanced)</h3>
          <textarea
            name="custom_css"
            defaultValue={theme.custom_css ?? ''}
            rows={6}
            placeholder=".btn-primary { text-transform: uppercase; }"
            className="input font-mono text-xs"
          />
        </div>

        <SubmitButton pendingText="Saving theme…">Save theme</SubmitButton>
      </div>

      <div>
        <div className="sticky top-6">
          <h3 className="text-sm font-medium text-muted mb-2">Live preview</h3>
          <div
            style={
              {
                '--color-primary': preview.primary_color,
                '--color-secondary': preview.secondary_color,
                '--color-accent': preview.accent_color,
                '--color-background': preview.background_color,
                '--color-surface': preview.surface_color,
                '--color-text': preview.text_color,
                '--color-muted-text': preview.muted_text_color,
                '--color-border': preview.border_color,
                '--color-success': preview.success_color,
                '--color-warning': preview.warning_color,
                '--color-danger': preview.danger_color,
                '--color-sidebar-bg': preview.sidebar_bg_color,
                '--color-sidebar-text': preview.sidebar_text_color,
                '--font-family': preview.font_family,
                '--radius': preview.radius,
                backgroundColor: 'var(--color-background)',
                fontFamily: 'var(--font-family)',
              } as React.CSSProperties
            }
            className="rounded-lg border overflow-hidden"
          >
            <div className="p-3 text-sm font-semibold" style={{ backgroundColor: 'var(--color-sidebar-bg)', color: 'var(--color-sidebar-text)' }}>
              Sidebar
            </div>
            <div className="p-4 space-y-3">
              <div className="card p-3">
                <p className="text-sm font-medium">Sample card</p>
                <p className="text-xs text-muted">Muted supporting text</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-primary text-xs">
                  Primary
                </button>
                <button type="button" className="btn btn-secondary text-xs">
                  Secondary
                </button>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="badge" style={{ backgroundColor: 'var(--color-success)', color: '#fff' }}>
                  Done
                </span>
                <span className="badge" style={{ backgroundColor: 'var(--color-warning)', color: '#fff' }}>
                  Pending
                </span>
                <span className="badge" style={{ backgroundColor: 'var(--color-danger)', color: '#fff' }}>
                  Blocked
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
