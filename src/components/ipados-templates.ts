/**
 * @file ipados-templates.ts
 * @description Katalog template komponen React + TypeScript untuk iPadOS 26 (Apple HIG).
 *
 * Tanggung Jawab:
 * - Menyediakan kode produksi untuk Split View 2/3 Kolom, Adaptive Sidebar-to-TabBar Morphing,
 *   Contextual Zero-Shadow Popover, dan Trackpad Pointer Magnetic Hover Effect.
 */

export const IPADOS_COMPONENT_TEMPLATES: Readonly<Record<string, string>> = {
  ipad_split_view: `import React, { useState } from 'react';

export interface IpadSplitViewProps {
  sidebarContent: React.ReactNode;
  secondaryColumnContent?: React.ReactNode;
  detailContent: React.ReactNode;
  sidebarWidth?: number;
}

export const IpadSplitView: React.FC<IpadSplitViewProps> = ({
  sidebarContent,
  secondaryColumnContent,
  detailContent,
  sidebarWidth = 320,
}) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  return (
    <div
      className="ipad-split-view"
      style={{
        display: 'flex',
        width: '100vw',
        height: '100dvh',
        paddingTop: 'var(--safe-area-top, env(safe-area-inset-top, 0px))',
        paddingBottom: 'var(--safe-area-bottom, env(safe-area-inset-bottom, 0px))',
        backgroundColor: 'var(--bg-app)',
        overflow: 'hidden',
      }}
    >
      {isSidebarVisible && (
        <aside
          style={{
            width: \`var(--ipad-split-sidebar-width, \${sidebarWidth}px)\`,
            flexShrink: 0,
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-backdrop)',
            borderRight: '0.5px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {sidebarContent}
        </aside>
      )}
      {secondaryColumnContent && (
        <section
          style={{
            width: 340,
            flexShrink: 0,
            borderRight: '0.5px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-1)',
            overflowY: 'auto',
          }}
        >
          {secondaryColumnContent}
        </section>
      )}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <header style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', minHeight: 44 }}>
          <button
            type="button"
            aria-label="Toggle Sidebar Split View"
            onClick={() => setIsSidebarVisible((prev) => !prev)}
            style={{
              minWidth: 'var(--min-hit-target, 44px)',
              minHeight: 'var(--min-hit-target, 44px)',
              borderRadius: 10,
              border: 'none',
              background: 'transparent',
              color: 'var(--accent-primary)',
              cursor: 'pointer',
            }}
          >
            ☰
          </button>
        </header>
        <div style={{ flex: 1, padding: 20 }}>{detailContent}</div>
      </main>
    </div>
  );
};`,

  adaptive_sidebar_tabbar: `import React, { useState, useEffect } from 'react';

export interface AdaptiveNavEntry {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface AdaptiveSidebarTabBarProps {
  items: AdaptiveNavEntry[];
  activeId: string;
  onSelect: (id: string) => void;
  breakpointPx?: number;
  children: React.ReactNode;
}

export const IpadAdaptiveSidebarTabBar: React.FC<AdaptiveSidebarTabBarProps> = ({
  items,
  activeId,
  onSelect,
  breakpointPx = 768,
  children,
}) => {
  const [isCompactWidth, setIsCompactWidth] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(\`(max-width: \${breakpointPx - 1}px)\`);
    setIsCompactWidth(mediaQuery.matches);
    const listener = (event: MediaQueryListEvent) => setIsCompactWidth(event.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [breakpointPx]);

  return (
    <div style={{ display: 'flex', height: '100dvh', width: '100vw', position: 'relative' }}>
      {!isCompactWidth && (
        <aside
          style={{
            width: 'var(--ipad-split-sidebar-width, 280px)',
            padding: 16,
            paddingTop: 'calc(var(--safe-area-top, 0px) + 16px)',
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-backdrop)',
            borderRight: '0.5px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {items.map((navEntry) => (
            <button
              key={navEntry.id}
              type="button"
              onClick={() => onSelect(navEntry.id)}
              style={{
                minHeight: 'var(--min-hit-target, 44px)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 14px',
                borderRadius: 12,
                border: 'none',
                background: activeId === navEntry.id ? 'var(--accent-primary)' : 'transparent',
                color: activeId === navEntry.id ? '#ffffff' : 'var(--text-primary)',
                fontSize: 17,
                cursor: 'pointer',
              }}
            >
              {navEntry.icon}
              <span>{navEntry.label}</span>
            </button>
          ))}
        </aside>
      )}
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: isCompactWidth ? 88 : 0 }}>
        {children}
      </main>
      {isCompactWidth && (
        <nav
          aria-label="Tab Bar Adaptif"
          style={{
            position: 'fixed',
            bottom: 'calc(var(--safe-area-bottom, 0px) + 12px)',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 9999,
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-backdrop)',
            border: '0.5px solid var(--glass-border)',
          }}
        >
          {items.slice(0, 5).map((navEntry) => (
            <button
              key={navEntry.id}
              type="button"
              onClick={() => onSelect(navEntry.id)}
              style={{
                minWidth: 64,
                minHeight: 'var(--min-hit-target, 44px)',
                borderRadius: 9999,
                border: 'none',
                background: activeId === navEntry.id ? 'var(--bg-surface-active)' : 'transparent',
                color: activeId === navEntry.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontSize: 12,
              }}
            >
              {navEntry.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};`,

  ipad_popover: `import React from 'react';

export interface IpadPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchorPosition?: { top: number; left: number };
  children: React.ReactNode;
}

export const IpadPopover: React.FC<IpadPopoverProps> = ({
  isOpen,
  onClose,
  anchorPosition = { top: 64, left: 64 },
  children,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'transparent' }}
      />
      <div
        role="dialog"
        style={{
          position: 'fixed',
          top: anchorPosition.top,
          left: anchorPosition.left,
          minWidth: 280,
          maxWidth: 360,
          padding: 12,
          borderRadius: 18,
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-backdrop)',
          border: '0.5px solid var(--glass-border)',
          boxShadow: 'none',
          zIndex: 1150,
        }}
      >
        {children}
      </div>
    </>
  );
};`,

  pointer_hover_effect: `import React, { useState } from 'react';

export interface PointerHoverButtonProps {
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}

export const IpadPointerHoverButton: React.FC<PointerHoverButtonProps> = ({
  onClick,
  ariaLabel,
  children,
}) => {
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0, active: false });

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const deltaX = (event.clientX - (rect.left + rect.width / 2)) * 0.15;
    const deltaY = (event.clientY - (rect.top + rect.height / 2)) * 0.15;
    setPointerOffset({ x: deltaX, y: deltaY, active: true });
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setPointerOffset({ x: 0, y: 0, active: false })}
      style={{
        minWidth: 'var(--min-hit-target, 44px)',
        minHeight: 'var(--min-hit-target, 44px)',
        padding: '0 14px',
        borderRadius: 12,
        border: 'none',
        background: pointerOffset.active ? 'var(--bg-surface-hover)' : 'transparent',
        transform: \`translate3d(\${pointerOffset.x}px, \${pointerOffset.y}px, 0)\`,
        transition: pointerOffset.active ? 'none' : 'transform 0.2s ease, background 0.15s ease',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
};`,
};
