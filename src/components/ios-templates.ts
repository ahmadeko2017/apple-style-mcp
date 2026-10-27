/**
 * @file ios-templates.ts
 * @description Katalog template komponen React + TypeScript untuk iOS 26 (Apple HIG).
 *
 * Tanggung Jawab:
 * - Menyediakan kode produksi untuk Liquid Glass Floating Tab Bar (scroll auto-minimize),
 *   Large Title Navigation Bar, Detent Bottom Sheet, Inset Grouped List, dan Segmented Control.
 */

export const IOS_COMPONENT_TEMPLATES: Readonly<Record<string, string>> = {
  ios_tab_bar: `import React from 'react';

export interface IosTabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface IosTabBarProps {
  items: IosTabItem[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  isMinimizedOnScroll?: boolean;
}

export const IosFloatingTabBar: React.FC<IosTabBarProps> = ({
  items,
  activeTabId,
  onSelectTab,
  isMinimizedOnScroll = false,
}) => {
  const visibleTabs = items.slice(0, 5);

  return (
    <nav
      aria-label="Navigasi Utama iOS"
      className="ios-liquid-glass-tabbar"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 'calc(var(--safe-area-bottom, env(safe-area-inset-bottom, 0px)) + 12px)',
        transform: \`translateX(-50%) scale(\${isMinimizedOnScroll ? 0.88 : 1})\`,
        height: 'var(--ios-tabbar-height, 49px)',
        padding: '4px 10px',
        borderRadius: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-backdrop)',
        border: '0.5px solid var(--glass-border)',
        boxShadow: 'inset 0 1px 0 0 var(--border-specular)',
        transition: 'transform 0.24s cubic-bezier(0.32, 0.72, 0, 1)',
        zIndex: 1000,
      }}
    >
      {visibleTabs.map((tabEntry) => {
        const isSelected = tabEntry.id === activeTabId;
        return (
          <button
            key={tabEntry.id}
            type="button"
            aria-label={tabEntry.label}
            onClick={() => onSelectTab(tabEntry.id)}
            style={{
              minWidth: 'var(--min-hit-target, 44px)',
              minHeight: 'var(--min-hit-target, 44px)',
              padding: '0 12px',
              borderRadius: 9999,
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: isSelected ? 'var(--bg-surface-active)' : 'transparent',
              color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              cursor: 'pointer',
            }}
          >
            {tabEntry.icon}
            {!isMinimizedOnScroll && (
              <span style={{ fontSize: 10, fontWeight: 600, marginTop: 2 }}>{tabEntry.label}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
};`,

  ios_navigation_bar: `import React from 'react';

export interface IosNavigationBarProps {
  title: string;
  isScrolled?: boolean;
  leadingAction?: React.ReactNode;
  trailingAction?: React.ReactNode;
}

export const IosLargeTitleNavigationBar: React.FC<IosNavigationBarProps> = ({
  title,
  isScrolled = false,
  leadingAction,
  trailingAction,
}) => {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        paddingTop: 'var(--safe-area-top, env(safe-area-inset-top, 0px))',
        background: isScrolled ? 'var(--glass-bg)' : 'transparent',
        backdropFilter: isScrolled ? 'var(--glass-backdrop)' : 'none',
        borderBottom: isScrolled ? '0.5px solid var(--glass-border)' : 'none',
        transition: 'background 0.2s ease',
        zIndex: 950,
      }}
    >
      <div
        style={{
          height: 'var(--ios-navbar-height, 44px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}
      >
        <div style={{ minWidth: 44 }}>{leadingAction}</div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 600,
            opacity: isScrolled ? 1 : 0,
            transition: 'opacity 0.18s ease',
          }}
        >
          {title}
        </div>
        <div style={{ minWidth: 44, display: 'flex', justifyContent: 'flex-end' }}>
          {trailingAction}
        </div>
      </div>
      {!isScrolled && (
        <div style={{ padding: '4px 16px 12px' }}>
          <h1 style={{ margin: 0, fontSize: 'var(--font-size-large-title, 34px)', fontWeight: 700, letterSpacing: -0.4 }}>
            {title}
          </h1>
        </div>
      )}
    </header>
  );
};`,

  ios_bottom_sheet: `import React, { useState } from 'react';

export type SheetDetent = 'medium' | 'large';

export interface IosBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialDetent?: SheetDetent;
  title?: string;
  children: React.ReactNode;
}

export const IosBottomSheet: React.FC<IosBottomSheetProps> = ({
  isOpen,
  onClose,
  initialDetent = 'medium',
  title,
  children,
}) => {
  const [detent, setDetent] = useState<SheetDetent>(initialDetent);

  if (!isOpen) return null;

  const sheetHeight = detent === 'large' ? '92dvh' : '52dvh';

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100vw',
          height: sheetHeight,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-backdrop)',
          borderTop: '0.5px solid var(--glass-border)',
          paddingBottom: 'var(--safe-area-bottom, env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          flexDirection: 'column',
          transition: 'height 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <button
          type="button"
          aria-label="Ubah Ukuran Sheet"
          onClick={() => setDetent((prev) => (prev === 'medium' ? 'large' : 'medium'))}
          style={{
            alignSelf: 'center',
            marginTop: 8,
            marginBottom: 8,
            width: 36,
            height: 5,
            borderRadius: 9999,
            border: 'none',
            backgroundColor: 'var(--border-medium)',
            cursor: 'pointer',
          }}
        />
        {title && (
          <div style={{ padding: '4px 16px 12px', fontWeight: 600, fontSize: 17, textAlign: 'center' }}>
            {title}
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>{children}</div>
      </div>
    </div>
  );
};`,

  ios_inset_grouped_list: `import React from 'react';

export interface IosListRowItem {
  id: string;
  title: string;
  subtitle?: string;
  trailingText?: string;
  onPress?: () => void;
}

export interface IosInsetGroupedListProps {
  headerTitle?: string;
  footerNote?: string;
  rows: IosListRowItem[];
}

export const IosInsetGroupedList: React.FC<IosInsetGroupedListProps> = ({
  headerTitle,
  footerNote,
  rows,
}) => {
  return (
    <section style={{ margin: '16px', display: 'flex', flexDirection: 'column' }}>
      {headerTitle && (
        <div style={{ padding: '0 16px 6px', fontSize: 12, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          {headerTitle}
        </div>
      )}
      <div
        style={{
          borderRadius: 16,
          backgroundColor: 'var(--bg-surface-1)',
          overflow: 'hidden',
        }}
      >
        {rows.map((rowEntry, idx) => (
          <button
            key={rowEntry.id}
            type="button"
            onClick={rowEntry.onPress}
            style={{
              width: '100%',
              minHeight: 'var(--min-hit-target, 44px)',
              padding: '11px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'transparent',
              border: 'none',
              borderBottom: idx < rows.length - 1 ? '0.5px solid var(--border-subtle)' : 'none',
              fontSize: 17,
              color: 'var(--text-primary)',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <div>
              <div>{rowEntry.title}</div>
              {rowEntry.subtitle && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{rowEntry.subtitle}</div>
              )}
            </div>
            {rowEntry.trailingText && (
              <span style={{ color: 'var(--text-secondary)', fontSize: 17 }}>{rowEntry.trailingText}</span>
            )}
          </button>
        ))}
      </div>
      {footerNote && (
        <div style={{ padding: '6px 16px 0', fontSize: 12, color: 'var(--text-tertiary)' }}>
          {footerNote}
        </div>
      )}
    </section>
  );
};`,

  ios_segmented_control: `import React from 'react';

export interface SegmentedOption {
  id: string;
  label: string;
}

export interface IosSegmentedControlProps {
  options: SegmentedOption[];
  selectedId: string;
  onChange: (id: string) => void;
}

export const IosSegmentedControl: React.FC<IosSegmentedControlProps> = ({
  options,
  selectedId,
  onChange,
}) => {
  return (
    <div
      role="tablist"
      style={{
        display: 'inline-flex',
        padding: 3,
        borderRadius: 12,
        backgroundColor: 'var(--bg-surface-2)',
        gap: 2,
      }}
    >
      {options.map((optionEntry) => {
        const isSelected = optionEntry.id === selectedId;
        return (
          <button
            key={optionEntry.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(optionEntry.id)}
            style={{
              minHeight: 36,
              padding: '0 14px',
              borderRadius: 9,
              border: 'none',
              backgroundColor: isSelected ? 'var(--bg-surface-1)' : 'transparent',
              color: 'var(--text-primary)',
              fontWeight: isSelected ? 600 : 400,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'background-color 0.18s ease',
            }}
          >
            {optionEntry.label}
          </button>
        );
      })}
    </div>
  );
};`,
};
