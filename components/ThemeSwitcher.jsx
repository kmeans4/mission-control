'use client';

import React from 'react';
import { useTheme, ACCENT_COLORS } from '../hooks/useTheme';

/**
 * ThemeSwitcher Component
 * Provides UI controls for toggling between light/dark modes
 * and selecting accent colors
 */
export function ThemeSwitcher({ 
  showModeToggle = true, 
  showAccentPicker = true,
  compact = false,
  className = '' 
}) {
  const { 
    mode, 
    accent, 
    toggleMode, 
    setMode, 
    setAccent, 
    isDark,
    mounted 
  } = useTheme();

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className={`theme-switcher-placeholder ${className}`}>
        <div className="animate-pulse bg-secondary rounded-lg" 
             style={{ width: compact ? '100px' : '200px', height: compact ? '32px' : '40px' }} />
      </div>
    );
  }

  return (
    <div className={`theme-switcher ${className}`}>
      {/* Mode Toggle */}
      {showModeToggle && (
        <div className="mode-toggle">
          {compact ? (
            <button
              onClick={toggleMode}
              className="mode-btn mode-btn-compact"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="mode-icon">
                {isDark ? '🌙' : '☀️'}
              </span>
            </button>
          ) : (
            <div className="mode-segmented">
              <button
                onClick={() => setMode('light')}
                className={`mode-option ${mode === 'light' ? 'active' : ''}`}
                aria-pressed={mode === 'light'}
              >
                <span className="mode-option-icon">☀️</span>
                <span className="mode-option-label">Light</span>
              </button>
              <button
                onClick={() => setMode('dark')}
                className={`mode-option ${mode === 'dark' ? 'active' : ''}`}
                aria-pressed={mode === 'dark'}
              >
                <span className="mode-option-icon">🌙</span>
                <span className="mode-option-label">Dark</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Accent Color Picker */}
      {showAccentPicker && (
        <div className="accent-picker">
          {!compact && <span className="accent-label">Accent</span>}
          <div className="accent-options">
            {Object.entries(ACCENT_COLORS).map(([key, { name, value }]) => (
              <button
                key={key}
                onClick={() => setAccent(key)}
                className={`accent-btn ${accent === key ? 'active' : ''}`}
                style={{ 
                  '--accent-color': value,
                  backgroundColor: value 
                }}
                aria-label={`Set accent color to ${name}`}
                aria-pressed={accent === key}
                title={name}
              >
                {accent === key && (
                  <span className="accent-check">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .theme-switcher {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .mode-toggle {
          display: flex;
          align-items: center;
        }

        .mode-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-default);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .mode-btn:hover {
          background: var(--bg-elevated);
          border-color: var(--accent);
        }

        .mode-btn-compact {
          width: 40px;
          height: 40px;
          padding: 0;
          border-radius: var(--radius-full);
        }

        .mode-icon {
          font-size: 1.25rem;
          line-height: 1;
        }

        .mode-segmented {
          display: flex;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          padding: 4px;
          border: 1px solid var(--border-default);
        }

        .mode-option {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-base);
          font-size: 0.875rem;
        }

        .mode-option:hover {
          color: var(--text-primary);
        }

        .mode-option.active {
          background: var(--accent);
          color: var(--text-inverse);
        }

        .mode-option-icon {
          font-size: 0.875rem;
          line-height: 1;
        }

        .mode-option-label {
          font-weight: 500;
        }

        .accent-picker {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .accent-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .accent-options {
          display: flex;
          gap: 0.5rem;
        }

        .accent-btn {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          border: 2px solid transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-base);
          box-shadow: var(--shadow-sm);
        }

        .accent-btn:hover {
          transform: scale(1.1);
          box-shadow: var(--shadow-md);
        }

        .accent-btn.active {
          border-color: var(--text-primary);
          box-shadow: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--accent);
        }

        .accent-check {
          color: white;
          font-size: 0.75rem;
          font-weight: bold;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        /* Compact mode adjustments */
        .theme-switcher:has(.mode-btn-compact) {
          gap: 0.75rem;
        }

        .theme-switcher:has(.mode-btn-compact) .accent-options {
          gap: 0.375rem;
        }

        .theme-switcher:has(.mode-btn-compact) .accent-btn {
          width: 24px;
          height: 24px;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .mode-btn,
          .mode-option,
          .accent-btn {
            transition: none;
          }

          .accent-btn:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Standalone Mode Toggle Button (simpler alternative)
 */
export function ModeToggle({ className = '' }) {
  const { toggleMode, isDark, mounted } = useTheme();

  if (!mounted) {
    return (
      <div 
        className={`mode-toggle-skeleton ${className}`}
        style={{ width: 40, height: 40, borderRadius: '50%' }}
      />
    );
  }

  return (
    <button
      onClick={toggleMode}
      className={`mode-toggle-btn ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="mode-toggle-icon">
        {isDark ? '🌙' : '☀️'}
      </span>

      <style jsx>{`
        .mode-toggle-btn {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-default);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-base);
        }

        .mode-toggle-btn:hover {
          background: var(--bg-elevated);
          border-color: var(--accent);
          transform: scale(1.05);
        }

        .mode-toggle-icon {
          font-size: 1.25rem;
          line-height: 1;
        }

        @media (prefers-reduced-motion: reduce) {
          .mode-toggle-btn {
            transition: none;
          }
          .mode-toggle-btn:hover {
            transform: none;
          }
        }
      `}</style>
    </button>
  );
}

/**
 * Accent Color Picker (standalone)
 */
export function AccentPicker({ compact = false, className = '' }) {
  const { accent, setAccent, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className={`accent-picker-skeleton ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div 
            key={i}
            style={{ 
              width: compact ? 24 : 28, 
              height: compact ? 24 : 28, 
              borderRadius: '50%',
              display: 'inline-block',
              marginRight: 8
            }} 
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`accent-picker-standalone ${className}`}>
      {Object.entries(ACCENT_COLORS).map(([key, { name, value }]) => (
        <button
          key={key}
          onClick={() => setAccent(key)}
          className={accent === key ? 'active' : ''}
          style={{ backgroundColor: value }}
          aria-label={`Set accent color to ${name}`}
          aria-pressed={accent === key}
          title={name}
        >
          {accent === key && <span>✓</span>}
        </button>
      ))}

      <style jsx>{`
        .accent-picker-standalone {
          display: flex;
          gap: ${compact ? '0.375rem' : '0.5rem'};
        }

        .accent-picker-standalone button {
          width: ${compact ? '24px' : '28px'};
          height: ${compact ? '24px' : '28px'};
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-base);
          box-shadow: var(--shadow-sm);
        }

        .accent-picker-standalone button:hover {
          transform: scale(1.1);
          box-shadow: var(--shadow-md);
        }

        .accent-picker-standalone button.active {
          border-color: var(--text-primary);
          box-shadow: 0 0 0 2px var(--bg-primary), 0 0 0 4px currentColor;
        }

        .accent-picker-standalone button span {
          color: white;
          font-size: 0.75rem;
          font-weight: bold;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        @media (prefers-reduced-motion: reduce) {
          .accent-picker-standalone button {
            transition: none;
          }
          .accent-picker-standalone button:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}

export default ThemeSwitcher;
