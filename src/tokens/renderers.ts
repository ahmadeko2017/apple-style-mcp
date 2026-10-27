/**
 * @file renderers.ts
 * @description Renderer untuk mengubah DesignTokenBundle menjadi CSS, JSON, TypeScript, dan SwiftUI.
 *
 * Tanggung Jawab:
 * - Menghasilkan output variabel CSS lengkap dengan safe-area insets dan Liquid Glass variables.
 * - Menghasilkan JSON terstruktur, konstanta TypeScript (`as const`), dan kode SwiftUI (`Color`/`Font`).
 */

import type { TokenOutputFormat } from "../core/platform/types.ts";
import type { DesignTokenBundle } from "./token-definitions.ts";

/**
 * Merender DesignTokenBundle sesuai format yang diminta.
 *
 * @param {DesignTokenBundle} bundle - Paket design token yang akan dirender
 * @param {TokenOutputFormat} format - Format target ('css' | 'json' | 'typescript' | 'swift')
 * @returns {string} Hasil serialisasi token dalam format string
 */
export function renderDesignTokens(bundle: DesignTokenBundle, format: TokenOutputFormat): string {
  switch (format) {
    case "json":
      return renderJsonTokens(bundle);
    case "typescript":
      return renderTypeScriptTokens(bundle);
    case "swift":
      return renderSwiftUiTokens(bundle);
    case "css":
    default:
      return renderCssTokens(bundle);
  }
}

/**
 * Merender DesignTokenBundle menjadi stylesheet CSS variables (Light/Dark + Safe Area + Liquid Glass).
 *
 * @param {DesignTokenBundle} bundle - Paket design token
 * @returns {string} Kode CSS lengkap
 */
export function renderCssTokens(bundle: DesignTokenBundle): string {
  const { meta, dark, light, typography, dimensions } = bundle;
  return `/* Apple HIG Design Tokens — Platform: ${meta.platform} (${meta.osVersionReference}) | Era: ${meta.designEra} */
:root {
  /* Typography (SF Pro & Dynamic Type Scale) */
  --font-sans: ${typography.fontFamilySans};
  --font-mono: ${typography.fontFamilyMono};
  --font-size-body: ${typography.baseBodySize};
  --font-size-large-title: ${typography.largeTitleSize};
  --font-size-title1: ${typography.title1Size};
  --font-size-headline: ${typography.headlineSize};
  --font-size-caption: ${typography.captionSize};

  /* Dark Mode Colors */
  --bg-app: ${dark.bgApp};
  --bg-surface-1: ${dark.bgSurface1};
  --bg-surface-2: ${dark.bgSurface2};
  --bg-surface-elevated: ${dark.bgSurfaceElevated};
  --bg-surface-hover: ${dark.bgSurfaceHover};
  --bg-surface-active: ${dark.bgSurfaceActive};

  --border-subtle: ${dark.borderSubtle};
  --border-medium: ${dark.borderMedium};
  --border-focus: ${dark.borderFocus};
  --border-specular: ${dark.borderSpecular};

  --text-primary: ${dark.textPrimary};
  --text-secondary: ${dark.textSecondary};
  --text-tertiary: ${dark.textTertiary};

  --accent-primary: ${dark.accentPrimary};
  --accent-primary-hover: ${dark.accentPrimary};
  --accent-success: ${dark.accentSuccess};
  --accent-warning: ${dark.accentWarning};
  --accent-danger: ${dark.accentDanger};

  /* Liquid Glass & Translucent Material (Navigation Layer Only) */
  --glass-bg: ${dark.glassBackground};
  --glass-border: ${dark.glassBorder};
  --glass-backdrop: ${dark.glassBackdropFilter};

  /* Zero-Shadow & Window / Chrome Geometry */
  --shadow-window: 0 12px 32px rgba(0, 0, 0, 0.5);
  --shadow-dropdown: ${dark.shadowDropdown};
  --min-hit-target: ${dimensions.minHitTarget};
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: ${dimensions.radiusControl};
  --radius-lg: ${dimensions.radiusCard};
  --radius-pill: ${dimensions.radiusPill};
  --radius-window: ${dimensions.radiusWindow};
  --titlebar-height: ${dimensions.titlebarHeight};
  --titlebar-btn-height: ${dimensions.titlebarBtnHeight};
  --ios-tabbar-height: ${dimensions.iosTabBarHeight};
  --ios-navbar-height: ${dimensions.iosNavBarHeight};
  --ipad-split-sidebar-width: ${dimensions.ipadSplitSidebarWidth};

  /* Safe Area Insets (iOS Dynamic Island / Home Indicator & iPadOS) */
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-right: env(safe-area-inset-right, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-left: env(safe-area-inset-left, 0px);
}

[data-theme="light"] {
  --bg-app: ${light.bgApp};
  --bg-surface-1: ${light.bgSurface1};
  --bg-surface-2: ${light.bgSurface2};
  --bg-surface-elevated: ${light.bgSurfaceElevated};
  --bg-surface-hover: ${light.bgSurfaceHover};
  --bg-surface-active: ${light.bgSurfaceActive};

  --border-subtle: ${light.borderSubtle};
  --border-medium: ${light.borderMedium};
  --border-focus: ${light.borderFocus};
  --border-specular: ${light.borderSpecular};

  --text-primary: ${light.textPrimary};
  --text-secondary: ${light.textSecondary};
  --text-tertiary: ${light.textTertiary};

  --accent-primary: ${light.accentPrimary};
  --accent-primary-hover: ${light.accentPrimary};
  --accent-success: ${light.accentSuccess};
  --accent-warning: ${light.accentWarning};
  --accent-danger: ${light.accentDanger};

  --glass-bg: ${light.glassBackground};
  --glass-border: ${light.glassBorder};
  --glass-backdrop: ${light.glassBackdropFilter};
  --shadow-dropdown: ${light.shadowDropdown};
}`;
}

/**
 * Merender DesignTokenBundle menjadi string JSON berformat rapi.
 *
 * @param {DesignTokenBundle} bundle - Paket design token
 * @returns {string} String JSON
 */
export function renderJsonTokens(bundle: DesignTokenBundle): string {
  return JSON.stringify(bundle, null, 2);
}

/**
 * Merender DesignTokenBundle menjadi konstanta TypeScript yang type-safe.
 *
 * @param {DesignTokenBundle} bundle - Paket design token
 * @returns {string} Kode modul TypeScript
 */
export function renderTypeScriptTokens(bundle: DesignTokenBundle): string {
  const { meta, dark, dimensions, typography } = bundle;
  return `export const APPLE_STYLE_TOKENS = {
  meta: {
    platform: '${meta.platform}',
    designEra: '${meta.designEra}',
    paletteMode: '${meta.paletteMode}',
  },
  colors: {
    accentPrimary: '${dark.accentPrimary}',
    accentSuccess: '${dark.accentSuccess}',
    accentWarning: '${dark.accentWarning}',
    accentDanger: '${dark.accentDanger}',
    macClose: '#ff5f56',
    macMinimize: '#ffbd2e',
    macMaximize: '#27c93f',
  },
  typography: {
    fontFamilySans: "${typography.fontFamilySans}",
    baseBodySize: '${typography.baseBodySize}',
    largeTitleSize: '${typography.largeTitleSize}',
  },
  geometry: {
    minHitTarget: ${Number.parseInt(dimensions.minHitTarget, 10)},
    windowRadius: ${Number.parseInt(dimensions.radiusWindow, 10)},
    titlebarHeight: 38,
    titlebarBtnHeight: 26,
    sidebarCollapsedWidth: 63,
    sidebarExpandedWidth: 220,
    sidebarPadding: 12,
    sidebarIconPaddingLeft: 9,
    iosTabBarHeight: 49,
    iosNavBarHeight: 44,
    ipadSplitSidebarWidth: 320,
  },
} as const;

export const DESKTOP_TOKENS = APPLE_STYLE_TOKENS;`;
}

/**
 * Merender DesignTokenBundle menjadi ekstensi SwiftUI (`Color` dan `Font` + metrik geometri).
 *
 * @param {DesignTokenBundle} bundle - Paket design token
 * @returns {string} Kode sumber Swift untuk SwiftUI
 */
export function renderSwiftUiTokens(bundle: DesignTokenBundle): string {
  const { meta, dark, dimensions } = bundle;
  const bodyPt = Number.parseInt(bundle.typography.baseBodySize, 10);
  const largeTitlePt = Number.parseInt(bundle.typography.largeTitleSize, 10);
  const minHitPt = Number.parseInt(dimensions.minHitTarget, 10);
  const cornerRadiusPt = Number.parseInt(dimensions.radiusWindow, 10);

  return `import SwiftUI

// Apple HIG Tokens — Platform: ${meta.platform} (${meta.osVersionReference}) | Era: ${meta.designEra}
public enum AppleStyleTokens {
    public enum Colors {
        public static let accentPrimaryHex = "${dark.accentPrimary}"
        public static let accentSuccessHex = "${dark.accentSuccess}"
        public static let accentWarningHex = "${dark.accentWarning}"
        public static let accentDangerHex = "${dark.accentDanger}"
    }

    public enum Typography {
        public static let bodyFont: Font = .system(size: ${bodyPt}, weight: .regular, design: .default)
        public static let headlineFont: Font = .system(size: ${bodyPt}, weight: .semibold, design: .default)
        public static let largeTitleFont: Font = .system(size: ${largeTitlePt}, weight: .bold, design: .default)
        public static let monoFont: Font = .system(size: ${bodyPt - 1}, weight: .regular, design: .monospaced)
    }

    public enum Layout {
        public static let minHitTarget: CGFloat = ${minHitPt}
        public static let defaultCornerRadius: CGFloat = ${cornerRadiusPt}
        public static let sidebarCollapsedWidth: CGFloat = 63
        public static let sidebarExpandedWidth: CGFloat = 220
    }
}`;
}
