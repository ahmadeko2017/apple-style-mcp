/**
 * @file macos-templates.ts
 * @description Katalog template komponen React + TypeScript untuk macOS Desktop (Apple HIG).
 *
 * Tanggung Jawab:
 * - Menyediakan kode produksi untuk Traffic Lights, Adaptive Titlebar, Zero-Shift Sidebar,
 *   Command Palette (dengan navigasi keyboard penuh), Toast Banner, Inspector Panel,
 *   Context Menu Guard, dan Shortcut Formatter.
 */

export const MACOS_COMPONENT_TEMPLATES: Readonly<Record<string, string>> = {
  mac_traffic_lights: `import React, { useState } from 'react';

export interface MacTrafficLightsProps {
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
}

export const MacTrafficLights: React.FC<MacTrafficLightsProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="traffic-lights-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 8px' }}
    >
      <button
        type="button"
        aria-label="Tutup Jendela"
        className="traffic-light close"
        onClick={onClose}
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#ff5f56',
          border: '0.5px solid rgba(0,0,0,0.14)',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isHovered && (
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none" aria-hidden="true">
            <path d="M1 1L5 5M5 1L1 5" stroke="#4d0000" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        )}
      </button>
      <button
        type="button"
        aria-label="Minimalkan Jendela"
        className="traffic-light minimize"
        onClick={onMinimize}
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#ffbd2e',
          border: '0.5px solid rgba(0,0,0,0.14)',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isHovered && (
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none" aria-hidden="true">
            <path d="M1 3H5" stroke="#995700" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        )}
      </button>
      <button
        type="button"
        aria-label="Maksimalkan Jendela"
        className="traffic-light maximize"
        onClick={onMaximize}
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#27c93f',
          border: '0.5px solid rgba(0,0,0,0.14)',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isHovered && (
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none" aria-hidden="true">
            <path d="M1 1L5 5M5 1H2M5 1V4" stroke="#006500" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
};`,

  adaptive_titlebar: `import React from 'react';
import { MacTrafficLights } from './MacTrafficLights';

export interface AdaptiveTitlebarProps {
  title: string;
  theme: 'dark' | 'light';
  shortcutLabel?: string;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onToggleTheme: () => void;
  onOpenCommandPalette: () => void;
}

export const AdaptiveTitlebar: React.FC<AdaptiveTitlebarProps> = ({
  title,
  theme,
  shortcutLabel = '⌘K',
  onClose,
  onMinimize,
  onToggleMaximize,
  onToggleTheme,
  onOpenCommandPalette,
}) => {
  const handleMouseDown = async (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button === 0 && !(event.target as HTMLElement).closest('.no-drag')) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('start_dragging_window');
      } catch {
        // Fallback aman saat dijalankan pada browser non-Tauri
      }
    }
  };

  return (
    <header
      className="adaptive-titlebar"
      onMouseDown={handleMouseDown}
      onDoubleClick={onToggleMaximize}
      data-tauri-drag-region
      style={{
        height: 'var(--titlebar-height, 38px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-backdrop)',
        userSelect: 'none',
      }}
    >
      <div className="titlebar-left no-drag">
        <MacTrafficLights onClose={onClose} onMinimize={onMinimize} onMaximize={onToggleMaximize} />
      </div>
      <div className="titlebar-center" style={{ pointerEvents: 'none', fontWeight: 600, fontSize: 13 }}>
        {title}
      </div>
      <div className="titlebar-right no-drag" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="titlebar-btn search-pill"
          style={{ height: 'var(--titlebar-btn-height, 26px)', fontSize: 11, padding: '0 8px', borderRadius: 6 }}
        >
          Cari <kbd style={{ marginLeft: 4 }}>{shortcutLabel}</kbd>
        </button>
        <button
          type="button"
          aria-label="Ganti Tema"
          onClick={onToggleTheme}
          className="titlebar-btn icon-btn"
          style={{ height: 'var(--titlebar-btn-height, 26px)', width: 'var(--titlebar-btn-height, 26px)', borderRadius: 6 }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
};`,

  zero_shift_sidebar: `import React from 'react';

export interface SidebarNavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

export interface ZeroShiftSidebarProps {
  activeTab: string;
  onSelectTab: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  items: SidebarNavigationItem[];
}

export const ZeroShiftSidebar: React.FC<ZeroShiftSidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  items,
}) => {
  return (
    <aside
      className={\`sidebar-container \${isCollapsed ? 'is-collapsed' : ''}\`}
      style={{
        width: isCollapsed ? 63 : 220,
        padding: 12,
        transition: 'width 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-backdrop)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {items.map((navEntry) => {
          const IconComponent = navEntry.icon;
          const isActive = activeTab === navEntry.id;
          return (
            <button
              key={navEntry.id}
              type="button"
              aria-label={navEntry.label}
              onClick={() => onSelectTab(navEntry.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingLeft: 9,
                height: 38,
                width: isCollapsed ? 38 : '100%',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div style={{ width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconComponent size={18} />
              </div>
              {!isCollapsed && (
                <span style={{ marginLeft: 10, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {navEntry.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={onToggleCollapse}
        style={{
          height: 32,
          borderRadius: 6,
          border: '1px solid var(--border-subtle)',
          background: 'transparent',
          cursor: 'pointer',
          color: 'var(--text-tertiary)',
        }}
      >
        {isCollapsed ? '→' : '← Ciutkan'}
      </button>
    </aside>
  );
};`,

  command_palette: `import React, { useState, useEffect } from 'react';

export interface CommandPaletteAction {
  id: string;
  title: string;
  category: string;
  onExecute: () => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items: CommandPaletteAction[];
}

export const MacCommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, items }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredActions = items.filter(
    (actionItem) =>
      actionItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      actionItem.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      onClose();
      return;
    }
    if (event.key === 'ArrowDown' && filteredActions.length > 0) {
      event.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
    } else if (event.key === 'ArrowUp' && filteredActions.length > 0) {
      event.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (event.key === 'Enter' && filteredActions[selectedIndex]) {
      event.preventDefault();
      filteredActions[selectedIndex].onExecute();
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="macos-command-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(8px)',
        zIndex: 1200,
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
    >
      <div
        className="macos-command-modal"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 620,
          borderRadius: 16,
          backdropFilter: 'var(--glass-backdrop, saturate(200%) blur(36px))',
          border: '0.5px solid var(--glass-border, rgba(255,255,255,0.22))',
          backgroundColor: 'var(--glass-bg, var(--bg-surface-1))',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
          <input
            autoFocus
            type="text"
            placeholder="Cari aksi atau ketik perintah..."
            value={searchQuery}
            onKeyDown={handleKeyDown}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setSelectedIndex(0);
            }}
            style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 17, color: 'var(--text-primary)' }}
          />
        </div>
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: 8 }}>
          {filteredActions.map((actionItem, idx) => (
            <div
              key={actionItem.id}
              onClick={() => {
                actionItem.onExecute();
                onClose();
              }}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                backgroundColor: idx === selectedIndex ? 'var(--bg-surface-active)' : 'transparent',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500 }}>{actionItem.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{actionItem.category}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};`,

  toast_banner: `import React from 'react';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const MacToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 48,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 1250,
        maxWidth: 360,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toastEntry) => (
        <div
          key={toastEntry.id}
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '12px 14px',
            borderRadius: 14,
            border: '1px solid var(--border-subtle)',
            backdropFilter: 'var(--glass-backdrop, saturate(190%) blur(24px))',
            backgroundColor: 'var(--glass-bg, var(--bg-surface-1))',
            boxShadow: 'none',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{toastEntry.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{toastEntry.message}</div>
          </div>
          <button
            type="button"
            aria-label="Tutup Notifikasi"
            onClick={() => onDismiss(toastEntry.id)}
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(128,128,128,0.15)',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};`,

  inspector_panel: `import React from 'react';

export interface InspectorPanelProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const MacDetailPanel: React.FC<InspectorPanelProps> = ({
  isOpen,
  title,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.25)',
          zIndex: 1100,
        }}
      />
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 380,
          maxWidth: '85vw',
          height: '100%',
          backgroundColor: 'var(--glass-bg, var(--bg-surface-1))',
          backdropFilter: 'var(--glass-backdrop)',
          borderLeft: '1px solid var(--border-subtle)',
          zIndex: 1150,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header style={{ padding: 16, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{title}</h3>
          <button type="button" aria-label="Tutup Panel" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            ✕
          </button>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 80 }}>
          {children}
        </div>
      </aside>
    </>
  );
};`,

  context_menu_guard: `/**
 * @file disableContextMenu.ts
 * @description Menonaktifkan klik kanan bawaan browser pada elemen non-input
 * untuk memberikan pengalaman software native desktop profesional.
 */

export function setupContextMenuGuard(): () => void {
  const handleContextMenu = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    const isEditableInput =
      target?.tagName === 'INPUT' ||
      target?.tagName === 'TEXTAREA' ||
      target?.isContentEditable;

    if (!isEditableInput) {
      event.preventDefault();
    }
  };

  window.addEventListener('contextmenu', handleContextMenu);
  return () => window.removeEventListener('contextmenu', handleContextMenu);
}`,

  shortcut_formatter: `/**
 * @file shortcutFormatter.ts
 * @description Format shortcut keyboard lintas platform (macOS/iPadOS '⌘' vs Windows/Linux 'Ctrl').
 */

export type ShortcutPlatform = 'macos' | 'ipados' | 'ios' | 'windows' | 'linux';

export function formatShortcut(shortcut: string, platform: ShortcutPlatform): string {
  if (platform === 'macos' || platform === 'ipados' || platform === 'ios') {
    return shortcut
      .replace(/Mod\\+/g, '⌘')
      .replace(/Shift\\+/g, '⇧')
      .replace(/Alt\\+/g, '⌥')
      .replace(/Ctrl\\+/g, '⌃');
  }

  return shortcut
    .replace(/Mod\\+/g, 'Ctrl + ')
    .replace(/Shift\\+/g, 'Shift + ')
    .replace(/Alt\\+/g, 'Alt + ');
}`,
};
