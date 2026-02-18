'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from '@/hooks/useTheme';

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const initialTheme = { mode: 'dark', accent: 'purple' };
  
  return (
    <ThemeProvider initialTheme={initialTheme}>
      {children}
    </ThemeProvider>
  );
}
