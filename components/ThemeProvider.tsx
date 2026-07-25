'use client';

import { useEffect } from 'react';
import type { CompanyTheme } from '@/lib/types';

const VAR_MAP: Record<keyof CompanyTheme, string> = {
  company_id: '',
  logo_url: '',
  favicon_url: '',
  primary_color: '--color-primary',
  secondary_color: '--color-secondary',
  accent_color: '--color-accent',
  background_color: '--color-background',
  surface_color: '--color-surface',
  text_color: '--color-text',
  muted_text_color: '--color-muted-text',
  border_color: '--color-border',
  success_color: '--color-success',
  warning_color: '--color-warning',
  danger_color: '--color-danger',
  sidebar_bg_color: '--color-sidebar-bg',
  sidebar_text_color: '--color-sidebar-text',
  font_family: '--font-family',
  radius: '--radius',
  density: '',
  timezone: '',
  custom_css: '',
};

export function ThemeProvider({ theme }: { theme: CompanyTheme | null }) {
  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    (Object.keys(VAR_MAP) as (keyof CompanyTheme)[]).forEach((key) => {
      const cssVar = VAR_MAP[key];
      const value = theme[key];
      if (cssVar && typeof value === 'string' && value) {
        root.style.setProperty(cssVar, value);
      }
    });
  }, [theme]);

  if (!theme?.custom_css) return null;
  // eslint-disable-next-line react/no-danger
  return <style dangerouslySetInnerHTML={{ __html: theme.custom_css }} />;
}
