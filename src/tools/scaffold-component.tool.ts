/**
 * @file scaffold-component.tool.ts
 * @description Tool untuk menghasilkan kode komponen React + TypeScript bergaya macOS native.
 */

import type { McpTool, ToolInputSchema } from "../types.ts";

export class ScaffoldComponentTool implements McpTool {
  public readonly name = "scaffold_macos_component";
  public readonly description =
    "Menghasilkan kode komponen React + TypeScript produksi bergaya Apple HIG macOS native (Traffic Lights, Titlebar, Zero-Shift Sidebar, Command Palette ⌘K, Toast Banner, Inspector Panel).";

  public readonly inputSchema: ToolInputSchema = {
    type: "object",
    properties: {
      component: {
        type: "string",
        enum: [
          "mac_traffic_lights",
          "adaptive_titlebar",
          "zero_shift_sidebar",
          "command_palette",
          "toast_banner",
          "inspector_panel",
          "context_menu_guard",
          "shortcut_formatter",
        ],
        description: "Jenis komponen yang ingin di-generate",
      },
    },
    required: ["component"],
  };

  public execute(args: Record<string, unknown>): string {
    const component = String(args.component || "").toLowerCase();

    switch (component) {
      case "mac_traffic_lights":
        return this.getTrafficLightsCode();
      case "adaptive_titlebar":
        return this.getAdaptiveTitlebarCode();
      case "zero_shift_sidebar":
        return this.getZeroShiftSidebarCode();
      case "command_palette":
        return this.getCommandPaletteCode();
      case "toast_banner":
        return this.getToastBannerCode();
      case "inspector_panel":
        return this.getInspectorPanelCode();
      case "context_menu_guard":
        return this.getContextMenuGuardCode();
      case "shortcut_formatter":
        return this.getShortcutFormatterCode();
      default:
        return `Pilihan komponen tidak valid: "${component}". Pilihan yang tersedia: mac_traffic_lights, adaptive_titlebar, zero_shift_sidebar, command_palette, toast_banner, inspector_panel, context_menu_guard, shortcut_formatter.`;
    }
  }

  private getTrafficLightsCode(): string {
    return `import React, { useState } from 'react';

interface MacTrafficLightsProps {
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
        className="traffic-light close"
        onClick={onClose}
        title="Tutup"
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
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
            <path d="M1 1L5 5M5 1L1 5" stroke="#4d0000" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        )}
      </button>

      <button
        type="button"
        className="traffic-light minimize"
        onClick={onMinimize}
        title="Minimalkan"
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
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
            <path d="M1 3H5" stroke="#995700" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        )}
      </button>

      <button
        type="button"
        className="traffic-light maximize"
        onClick={onMaximize}
        title="Maksimalkan"
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
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
            <path d="M1 1L5 5M5 1H2M5 1V4" stroke="#006500" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
};`;
  }

  private getAdaptiveTitlebarCode(): string {
    return `import React from 'react';
import { MacTrafficLights } from './MacTrafficLights';

interface AdaptiveTitlebarProps {
  title: string;
  theme: 'dark' | 'light';
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onToggleTheme: () => void;
  onOpenCommandPalette: () => void;
}

export const AdaptiveTitlebar: React.FC<AdaptiveTitlebarProps> = ({
  title,
  theme,
  onClose,
  onMinimize,
  onToggleMaximize,
  onToggleTheme,
  onOpenCommandPalette,
}) => {
  const handleMouseDown = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0 && !(e.target as HTMLElement).closest('.no-drag')) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('start_dragging_window');
      } catch {
        // fallback browser test
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
        userSelect: 'none',
        WebkitAppRegion: 'drag',
      }}
    >
      <div className="titlebar-left no-drag" style={{ WebkitAppRegion: 'no-drag' }}>
        <MacTrafficLights onClose={onClose} onMinimize={onMinimize} onMaximize={onToggleMaximize} />
      </div>

      <div className="titlebar-center" style={{ pointerEvents: 'none', fontWeight: 600, fontSize: 13 }}>
        {title}
      </div>

      <div className="titlebar-right no-drag" style={{ display: 'flex', alignItems: 'center', gap: 8, WebkitAppRegion: 'no-drag' }}>
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="titlebar-btn search-pill"
          style={{ height: 'var(--titlebar-btn-height, 26px)', fontSize: 11, padding: '0 8px', borderRadius: 6 }}
        >
          Cari <kbd style={{ marginLeft: 4 }}>⌘K</kbd>
        </button>
        <button
          type="button"
          onClick={onToggleTheme}
          className="titlebar-btn icon-btn"
          style={{ height: 'var(--titlebar-btn-height, 26px)', width: 'var(--titlebar-btn-height, 26px)', borderRadius: 6 }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
};`;
  }

  private getZeroShiftSidebarCode(): string {
    return `import React from 'react';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface ZeroShiftSidebarProps {
  activeTab: string;
  onSelectTab: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  items: MenuItem[];
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
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingLeft: 9, // Terkunci konstan di kedua mode
                height: 38,
                width: isCollapsed ? 38 : '100%',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div style={{ width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} />
              </div>
              {!isCollapsed && (
                <span style={{ marginLeft: 10, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {item.label}
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
};`;
  }

  private getCommandPaletteCode(): string {
    return `import React, { useState, useEffect } from 'react';

export interface PaletteItem {
  id: string;
  title: string;
  category: string;
  onExecute: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items: PaletteItem[];
}

export const MacCommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, items }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
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
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 620,
          borderRadius: 16,
          backdropFilter: 'saturate(190%) blur(36px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 0 0 0.5px var(--border-subtle), 0 28px 64px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface-1)',
        }}
      >
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
          <input
            autoFocus
            type="text"
            placeholder="Cari aksi atau ketik perintah..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 17 }}
          />
        </div>
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: 8 }}>
          {filtered.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => {
                item.onExecute();
                onClose();
              }}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                backgroundColor: idx === selectedIndex ? 'rgba(99,102,241,0.15)' : 'transparent',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{item.category}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};`;
  }

  private getToastBannerCode(): string {
    return `import React from 'react';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const MacToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      style={{
        position: 'absolute',
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
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '12px 14px',
            borderRadius: 14,
            border: '1px solid var(--border-subtle)',
            backdropFilter: 'saturate(190%) blur(24px)',
            backgroundColor: 'var(--bg-surface-1)',
            boxShadow: 'none', // Zero-shadow rule
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{toast.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{toast.message}</div>
          </div>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
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
};`;
  }

  private getInspectorPanelCode(): string {
    return `import React from 'react';

interface InspectorPanelProps {
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
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.25)',
          zIndex: 1100,
        }}
      />
      <aside
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 380,
          maxWidth: '85vw',
          height: '100%',
          backgroundColor: 'var(--bg-surface-1)',
          borderLeft: '1px solid var(--border-subtle)',
          zIndex: 1150,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header style={{ padding: 16, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{title}</h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            ✕
          </button>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 80 }}>
          {children}
        </div>
      </aside>
    </>
  );
};`;
  }

  private getContextMenuGuardCode(): string {
    return `/**
 * @file disableContextMenu.ts
 * @description Menonaktifkan klik kanan bawaan browser pada elemen non-input
 * untuk memberikan pengalaman software native desktop profesional.
 */

export function setupContextMenuGuard(): () => void {
  const handleContextMenu = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    const isInput =
      target?.tagName === 'INPUT' ||
      target?.tagName === 'TEXTAREA' ||
      target?.isContentEditable;

    if (!isInput) {
      e.preventDefault();
    }
  };

  window.addEventListener('contextmenu', handleContextMenu);
  return () => window.removeEventListener('contextmenu', handleContextMenu);
}`;
  }

  private getShortcutFormatterCode(): string {
    return `/**
 * @file shortcutFormatter.ts
 * @description Format shortcut keyboard lintas platform (macOS '⌘' vs Windows 'Ctrl').
 */

export function formatShortcut(shortcut: string, platform: 'macos' | 'windows' | 'linux'): string {
  if (platform === 'macos') {
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
}`;
  }
}

export const scaffoldComponentTool = new ScaffoldComponentTool();
