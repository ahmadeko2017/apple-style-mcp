/**
 * @file shared-templates.ts
 * @description Katalog template komponen universal/shared Apple HIG lintas macOS, iPadOS, dan iOS.
 *
 * Tanggung Jawab:
 * - Menyediakan kode produksi untuk AdaptiveAppShell, PlatformDetector (termasuk deteksi iPadOS
 *   via maxTouchPoints), SafeAreaProvider, dan LiquidGlassSurface.
 */

export const SHARED_COMPONENT_TEMPLATES: Readonly<Record<string, string>> = {
  platform_detector: `/**
 * @file platformDetector.ts
 * @description Utilitas pendeteksi platform Apple (macOS, iPadOS, iOS) dan Size Class viewport.
 */

export type DetectedApplePlatform = 'macos' | 'ipados' | 'ios';
export type ViewportSizeClass = 'compact' | 'regular';

export interface AppleEnvironmentInfo {
  platform: DetectedApplePlatform;
  horizontalSizeClass: ViewportSizeClass;
  isTouchPrimary: boolean;
}

export function detectAppleEnvironment(): AppleEnvironmentInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { platform: 'macos', horizontalSizeClass: 'regular', isTouchPrimary: false };
  }

  const userAgent = navigator.userAgent || '';
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const viewportWidth = window.innerWidth;
  const horizontalSizeClass: ViewportSizeClass = viewportWidth < 768 ? 'compact' : 'regular';

  const isIpad =
    /iPad/i.test(userAgent) || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1);
  if (isIpad) {
    return { platform: 'ipados', horizontalSizeClass, isTouchPrimary: true };
  }

  if (/iPhone|iPod/i.test(userAgent)) {
    return { platform: 'ios', horizontalSizeClass: 'compact', isTouchPrimary: true };
  }

  return { platform: 'macos', horizontalSizeClass, isTouchPrimary: false };
}`,

  safe_area_provider: `import React from 'react';

export interface SafeAreaProviderProps {
  applyTopInset?: boolean;
  applyBottomInset?: boolean;
  children: React.ReactNode;
}

export const SafeAreaProvider: React.FC<SafeAreaProviderProps> = ({
  applyTopInset = true,
  applyBottomInset = true,
  children,
}) => {
  return (
    <div
      className="apple-safe-area-container"
      style={{
        width: '100vw',
        minHeight: '100dvh',
        boxSizing: 'border-box',
        paddingTop: applyTopInset ? 'var(--safe-area-top, env(safe-area-inset-top, 0px))' : 0,
        paddingBottom: applyBottomInset ? 'var(--safe-area-bottom, env(safe-area-inset-bottom, 0px))' : 0,
        paddingLeft: 'var(--safe-area-left, env(safe-area-inset-left, 0px))',
        paddingRight: 'var(--safe-area-right, env(safe-area-inset-right, 0px))',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {children}
    </div>
  );
};`,

  liquid_glass_surface: `import React from 'react';

export interface LiquidGlassSurfaceProps {
  borderRadius?: number;
  padding?: number | string;
  ariaLabel?: string;
  children: React.ReactNode;
}

/**
 * Komponen permukaan Liquid Glass khusus untuk layer navigasi dan kontrol melayang.
 * Sesuai Apple HIG OS 26 / macOS Tahoe, jangan gunakan komponen ini untuk kartu konten utama.
 */
export const LiquidGlassSurface: React.FC<LiquidGlassSurfaceProps> = ({
  borderRadius = 16,
  padding = 12,
  ariaLabel,
  children,
}) => {
  return (
    <div
      aria-label={ariaLabel}
      className="apple-liquid-glass-surface"
      style={{
        borderRadius,
        padding,
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-backdrop)',
        WebkitBackdropFilter: 'var(--glass-backdrop)',
        border: '0.5px solid var(--glass-border)',
        boxShadow: 'inset 0 1px 0 0 var(--border-specular)',
      }}
    >
      {children}
    </div>
  );
};`,

  adaptive_app_shell: `import React from 'react';

export interface AdaptiveShellNavItem {
  id: string;
  label: string;
}

export interface AdaptiveAppShellProps {
  platform: 'macos' | 'ipados' | 'ios';
  appTitle: string;
  navItems: AdaptiveShellNavItem[];
  activeNavId: string;
  onSelectNav: (id: string) => void;
  children: React.ReactNode;
}

export const AdaptiveAppShell: React.FC<AdaptiveAppShellProps> = ({
  platform,
  appTitle,
  navItems,
  activeNavId,
  onSelectNav,
  children,
}) => {
  const isMobile = platform === 'ios';

  return (
    <div
      className={\`apple-adaptive-shell platform-\${platform}\`}
      style={{
        width: '100vw',
        height: '100dvh',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        borderRadius: platform === 'macos' ? 'var(--radius-window, 12px)' : 0,
        overflow: 'hidden',
      }}
    >
      {!isMobile && (
        <aside
          style={{
            width: platform === 'ipados' ? 280 : 220,
            padding: 12,
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-backdrop)',
            borderRight: '0.5px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ padding: '8px 10px', fontWeight: 600, fontSize: 13 }}>{appTitle}</div>
          {navItems.map((navEntry) => (
            <button
              key={navEntry.id}
              type="button"
              onClick={() => onSelectNav(navEntry.id)}
              style={{
                minHeight: platform === 'ipados' ? 44 : 36,
                padding: '0 10px',
                borderRadius: 8,
                border: 'none',
                textAlign: 'left',
                background: activeNavId === navEntry.id ? 'var(--accent-primary)' : 'transparent',
                color: activeNavId === navEntry.id ? '#ffffff' : 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              {navEntry.label}
            </button>
          ))}
        </aside>
      )}
      <main style={{ flex: 1, overflowY: 'auto', padding: 16, paddingBottom: isMobile ? 84 : 16 }}>
        {children}
      </main>
      {isMobile && (
        <nav
          style={{
            position: 'fixed',
            bottom: 'calc(var(--safe-area-bottom, 0px) + 10px)',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 9999,
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-backdrop)',
            border: '0.5px solid var(--glass-border)',
          }}
        >
          {navItems.slice(0, 5).map((navEntry) => (
            <button
              key={navEntry.id}
              type="button"
              onClick={() => onSelectNav(navEntry.id)}
              style={{
                minHeight: 44,
                padding: '0 12px',
                borderRadius: 9999,
                border: 'none',
                background: activeNavId === navEntry.id ? 'var(--bg-surface-active)' : 'transparent',
                color: activeNavId === navEntry.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
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
};
