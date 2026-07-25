'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const COLOR_FIELDS = [
  'primary_color',
  'secondary_color',
  'accent_color',
  'background_color',
  'surface_color',
  'text_color',
  'muted_text_color',
  'border_color',
  'success_color',
  'warning_color',
  'danger_color',
  'sidebar_bg_color',
  'sidebar_text_color',
] as const;

export async function updateCompanyTheme(companyId: string, formData: FormData) {
  const supabase = createClient();

  const update: Record<string, string> = {};
  for (const field of COLOR_FIELDS) {
    const value = formData.get(field);
    if (value) update[field] = String(value);
  }
  const fontFamily = formData.get('font_family');
  if (fontFamily) update.font_family = String(fontFamily);
  const radius = formData.get('radius');
  if (radius) update.radius = String(radius);
  const density = formData.get('density');
  if (density) update.density = String(density);
  const timezone = formData.get('timezone');
  if (timezone) update.timezone = String(timezone);
  const customCss = formData.get('custom_css');
  update.custom_css = customCss ? String(customCss) : '';

  await supabase.from('company_themes').update(update).eq('company_id', companyId);

  revalidatePath('/admin/theme');
  revalidatePath('/dashboard/projects');
  revalidatePath(`/super-admin/companies/${companyId}`);
}

export async function updateCompanyLogo(companyId: string, logoUrl: string) {
  'use server';
  const supabase = createClient();
  await supabase.from('company_themes').update({ logo_url: logoUrl }).eq('company_id', companyId);
  revalidatePath('/admin/theme');
  revalidatePath('/dashboard/projects');
  revalidatePath(`/super-admin/companies/${companyId}`);
}

export async function resetCompanyTheme(companyId: string) {
  const supabase = createClient();
  await supabase
    .from('company_themes')
    .update({
      primary_color: '#4f46e5',
      secondary_color: '#7c3aed',
      accent_color: '#06b6d4',
      background_color: '#f8fafc',
      surface_color: '#ffffff',
      text_color: '#0f172a',
      muted_text_color: '#64748b',
      border_color: '#e2e8f0',
      success_color: '#16a34a',
      warning_color: '#d97706',
      danger_color: '#dc2626',
      sidebar_bg_color: '#111827',
      sidebar_text_color: '#f9fafb',
      font_family: 'Inter, system-ui, sans-serif',
      radius: '0.5rem',
      density: 'comfortable',
      custom_css: null,
    })
    .eq('company_id', companyId);

  revalidatePath('/admin/theme');
  revalidatePath(`/super-admin/companies/${companyId}`);
}
