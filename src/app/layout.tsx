import type { Metadata } from 'next';
import { ClientLayout } from './ClientLayout';
import './globals.css';
import '../../styles/themes.css';

export const metadata: Metadata = {
  title: 'Mission Control | OpenClaw Agent System',
  description: 'Dashboard for managing OpenClaw agents, tasks, and projects',
};

/**
 * No-flash theme script
 * Runs before React hydration to prevent theme flash
 */
const themeScript = `
  (function() {
    var DEFAULT_MODE = 'dark';
    var DEFAULT_ACCENT = 'purple';
    var STORAGE_KEY = 'mission-control-theme';

    function getTheme() {
      try {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          var parsed = JSON.parse(stored);
          return {
            mode: parsed.mode || DEFAULT_MODE,
            accent: parsed.accent || DEFAULT_ACCENT
          };
        }
      } catch (e) {}

      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return { mode: prefersDark ? 'dark' : 'light', accent: DEFAULT_ACCENT };
    }

    function apply(mode, accent) {
      var root = document.documentElement;
      if (mode === 'light') {
        root.setAttribute('data-theme', 'light');
      } else {
        root.removeAttribute('data-theme');
      }
      root.setAttribute('data-accent', accent);
    }

    var theme = getTheme();
    apply(theme.mode, theme.accent);
    window.__MISSION_CONTROL_THEME__ = theme;
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark light" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
