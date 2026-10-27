/**
 * @file token-definitions.ts
 * @description Single source of truth untuk Design Tokens Apple HIG (macOS, iPadOS, iOS)
 *   mendukung era Liquid Glass & Classic Vibrancy, serta palet Apple System & Brand Custom.
 *
 * Tanggung Jawab:
 * - Membangun paket token lengkap (warna, tipografi SF Pro, dimensi ergonomi, material kaca,
 *   dan metrik window/safe-area) tanpa duplikasi antar-tool.
 */

import { InvalidArgumentError } from "../core/errors.ts";
import { getPlatformProfile } from "../core/platform/profiles.ts";
import {
  DESIGN_ERAS,
  PALETTE_MODES,
  TOKEN_OUTPUT_FORMATS,
  type ApplePlatform,
  type DesignEra,
  type PaletteMode,
  type TokenOutputFormat,
} from "../core/platform/types.ts";

export interface ThemeColorTokens {
  readonly bgApp: string;
  readonly bgSurface1: string;
  readonly bgSurface2: string;
  readonly bgSurfaceElevated: string;
  readonly bgSurfaceHover: string;
  readonly bgSurfaceActive: string;
  readonly borderSubtle: string;
  readonly borderMedium: string;
  readonly borderFocus: string;
  readonly borderSpecular: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textTertiary: string;
  readonly accentPrimary: string;
  readonly accentSuccess: string;
  readonly accentWarning: string;
  readonly accentDanger: string;
  readonly glassBackground: string;
  readonly glassBorder: string;
  readonly glassBackdropFilter: string;
  readonly shadowDropdown: string;
}

export interface TypographyTokens {
  readonly fontFamilySans: string;
  readonly fontFamilyMono: string;
  readonly baseBodySize: string;
  readonly largeTitleSize: string;
  readonly title1Size: string;
  readonly headlineSize: string;
  readonly captionSize: string;
}

export interface DimensionTokens {
  readonly minHitTarget: string;
  readonly radiusWindow: string;
  readonly radiusCard: string;
  readonly radiusControl: string;
  readonly radiusPill: string;
  readonly titlebarHeight: string;
  readonly titlebarBtnHeight: string;
  readonly sidebarCollapsedWidth: string;
  readonly sidebarExpandedWidth: string;
  readonly sidebarPadding: string;
  readonly sidebarIconPaddingLeft: string;
  readonly iosTabBarHeight: string;
  readonly iosNavBarHeight: string;
  readonly ipadSplitSidebarWidth: string;
}

export interface DesignTokenBundle {
  readonly meta: {
    readonly platform: ApplePlatform;
    readonly designEra: DesignEra;
    readonly paletteMode: PaletteMode;
    readonly osVersionReference: string;
  };
  readonly dark: ThemeColorTokens;
  readonly light: ThemeColorTokens;
  readonly typography: TypographyTokens;
  readonly dimensions: DimensionTokens;
}

export interface BuildTokensOptions {
  platform?: ApplePlatform;
  designEra?: DesignEra;
  paletteMode?: PaletteMode;
  accentPrimary?: string;
}

const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/**
 * Memvalidasi format output token ('css' | 'json' | 'typescript' | 'swift').
 *
 * @param {unknown} rawFormat - Input format dari pengguna
 * @returns {TokenOutputFormat} Format yang telah tervalidasi
 * @throws {InvalidArgumentError} Jika format tidak didukung
 */
export function parseTokenOutputFormat(rawFormat: unknown): TokenOutputFormat {
  if (rawFormat === undefined || rawFormat === null || rawFormat === "") {
    return "css";
  }
  const normalized = String(rawFormat).trim().toLowerCase();
  if ((TOKEN_OUTPUT_FORMATS as readonly string[]).includes(normalized)) {
    return normalized as TokenOutputFormat;
  }
  throw new InvalidArgumentError(
    `Format token tidak valid: "${String(rawFormat)}". Pilihan: ${TOKEN_OUTPUT_FORMATS.join(", ")}.`
  );
}

/**
 * Memvalidasi input era desain ('liquid_glass' | 'classic').
 *
 * @param {unknown} rawEra - Input era desain dari pengguna
 * @returns {DesignEra} Era desain yang tervalidasi
 * @throws {InvalidArgumentError} Jika era desain tidak valid
 */
export function parseDesignEra(rawEra: unknown): DesignEra {
  if (rawEra === undefined || rawEra === null || rawEra === "") {
    return "liquid_glass";
  }
  const normalized = String(rawEra).trim().toLowerCase();
  if ((DESIGN_ERAS as readonly string[]).includes(normalized)) {
    return normalized as DesignEra;
  }
  throw new InvalidArgumentError(
    `Era desain tidak valid: "${String(rawEra)}". Pilihan: ${DESIGN_ERAS.join(", ")}.`
  );
}

/**
 * Memvalidasi input mode palet ('apple_system' | 'brand_custom').
 *
 * @param {unknown} rawPalette - Input mode palet dari pengguna
 * @returns {PaletteMode} Mode palet yang tervalidasi
 * @throws {InvalidArgumentError} Jika mode palet tidak valid
 */
export function parsePaletteMode(rawPalette: unknown): PaletteMode {
  if (rawPalette === undefined || rawPalette === null || rawPalette === "") {
    return "apple_system";
  }
  const normalized = String(rawPalette).trim().toLowerCase();
  if ((PALETTE_MODES as readonly string[]).includes(normalized)) {
    return normalized as PaletteMode;
  }
  throw new InvalidArgumentError(
    `Mode palet tidak valid: "${String(rawPalette)}". Pilihan: ${PALETTE_MODES.join(", ")}.`
  );
}

/**
 * Menormalkan kode warna hex aksen primer atau mengembalikan warna default sesuai palet.
 *
 * @param {string | undefined} rawAccent - Kode warna hex opsional
 * @param {PaletteMode} paletteMode - Mode palet yang dipilih
 * @returns {string} Kode warna hex yang valid
 */
export function resolveAccentHex(rawAccent: string | undefined, paletteMode: PaletteMode): string {
  if (typeof rawAccent === "string" && HEX_COLOR_PATTERN.test(rawAccent.trim())) {
    return rawAccent.trim();
  }
  return paletteMode === "apple_system" ? "#007aff" : "#6366f1";
}

/**
 * Membangun token warna mode gelap berdasarkan mode palet dan era desain.
 *
 * @param {string} accentHex - Warna aksen primer hex
 * @param {PaletteMode} paletteMode - Mode palet ('apple_system' atau 'brand_custom')
 * @param {DesignEra} designEra - Era desain ('liquid_glass' atau 'classic')
 * @returns {ThemeColorTokens} Kumpulan token warna untuk mode gelap
 */
function buildDarkColorTokens(
  accentHex: string,
  paletteMode: PaletteMode,
  designEra: DesignEra
): ThemeColorTokens {
  const isApplePalette = paletteMode === "apple_system";
  const isLiquidGlass = designEra === "liquid_glass";
  return {
    bgApp: isApplePalette ? "#000000" : "#0d1117",
    bgSurface1: isApplePalette ? "#1c1c1e" : "#161b22",
    bgSurface2: isApplePalette ? "#2c2c2e" : "#21262d",
    bgSurfaceElevated: isApplePalette ? "#3a3a3c" : "#2d333b",
    bgSurfaceHover: "rgba(255, 255, 255, 0.06)",
    bgSurfaceActive: "rgba(255, 255, 255, 0.12)",
    borderSubtle: "rgba(255, 255, 255, 0.08)",
    borderMedium: "rgba(255, 255, 255, 0.16)",
    borderFocus: `${accentHex}99`,
    borderSpecular: isLiquidGlass ? "rgba(255, 255, 255, 0.28)" : "rgba(255, 255, 255, 0.12)",
    textPrimary: isApplePalette ? "#ffffff" : "#f0f6fc",
    textSecondary: isApplePalette ? "rgba(235, 235, 245, 0.6)" : "#9da7b3",
    textTertiary: isApplePalette ? "rgba(235, 235, 245, 0.3)" : "#6e7681",
    accentPrimary: accentHex,
    accentSuccess: "#30d158",
    accentWarning: "#ffd60a",
    accentDanger: "#ff453a",
    glassBackground: isLiquidGlass ? "rgba(28, 28, 30, 0.62)" : "rgba(28, 28, 30, 0.78)",
    glassBorder: isLiquidGlass ? "rgba(255, 255, 255, 0.22)" : "rgba(255, 255, 255, 0.1)",
    glassBackdropFilter: isLiquidGlass ? "saturate(200%) blur(28px)" : "saturate(180%) blur(20px)",
    shadowDropdown: "none",
  };
}

/**
 * Membangun token warna mode terang berdasarkan mode palet dan era desain.
 *
 * @param {string} accentHex - Warna aksen primer hex
 * @param {PaletteMode} paletteMode - Mode palet ('apple_system' atau 'brand_custom')
 * @param {DesignEra} designEra - Era desain ('liquid_glass' atau 'classic')
 * @returns {ThemeColorTokens} Kumpulan token warna untuk mode terang
 */
function buildLightColorTokens(
  accentHex: string,
  paletteMode: PaletteMode,
  designEra: DesignEra
): ThemeColorTokens {
  const isApplePalette = paletteMode === "apple_system";
  const isLiquidGlass = designEra === "liquid_glass";
  return {
    bgApp: isApplePalette ? "#f2f2f7" : "#f1f5f9",
    bgSurface1: "#ffffff",
    bgSurface2: isApplePalette ? "#e5e5ea" : "#e8ecf2",
    bgSurfaceElevated: "#ffffff",
    bgSurfaceHover: "rgba(15, 23, 42, 0.05)",
    bgSurfaceActive: "rgba(15, 23, 42, 0.1)",
    borderSubtle: isApplePalette ? "rgba(60, 60, 67, 0.18)" : "#cbd5e1",
    borderMedium: isApplePalette ? "rgba(60, 60, 67, 0.29)" : "#94a3b8",
    borderFocus: `${accentHex}99`,
    borderSpecular: isLiquidGlass ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 255, 255, 0.45)",
    textPrimary: isApplePalette ? "#000000" : "#0f172a",
    textSecondary: isApplePalette ? "rgba(60, 60, 67, 0.6)" : "#334155",
    textTertiary: isApplePalette ? "rgba(60, 60, 67, 0.3)" : "#64748b",
    accentPrimary: accentHex,
    accentSuccess: "#34c759",
    accentWarning: "#ff9500",
    accentDanger: "#ff3b30",
    glassBackground: isLiquidGlass ? "rgba(255, 255, 255, 0.65)" : "rgba(255, 255, 255, 0.82)",
    glassBorder: isLiquidGlass ? "rgba(255, 255, 255, 0.68)" : "rgba(60, 60, 67, 0.15)",
    glassBackdropFilter: isLiquidGlass ? "saturate(200%) blur(28px)" : "saturate(180%) blur(20px)",
    shadowDropdown: "none",
  };
}

/**
 * Membangun paket lengkap DesignTokenBundle untuk platform, era desain, dan palet tertentu.
 *
 * @param {BuildTokensOptions} [options] - Opsi konfigurasi pembuatan token
 * @returns {DesignTokenBundle} Bundle token yang siap dirender ke CSS, JSON, TS, atau Swift
 */
export function buildDesignTokenBundle(options: BuildTokensOptions = {}): DesignTokenBundle {
  const platform = options.platform ?? "macos";
  const designEra = options.designEra ?? "liquid_glass";
  const paletteMode = options.paletteMode ?? "apple_system";
  const accentHex = resolveAccentHex(options.accentPrimary, paletteMode);
  const profile = getPlatformProfile(platform);
  const isDesktop = platform === "macos";

  return {
    meta: {
      platform,
      designEra,
      paletteMode,
      osVersionReference: profile.osVersionReference,
    },
    dark: buildDarkColorTokens(accentHex, paletteMode, designEra),
    light: buildLightColorTokens(accentHex, paletteMode, designEra),
    typography: {
      fontFamilySans:
        "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif",
      fontFamilyMono: "'SF Mono', ui-monospace, Menlo, Monaco, monospace",
      baseBodySize: `${profile.baseBodyFontSizePt}px`,
      largeTitleSize: isDesktop ? "26px" : "34px",
      title1Size: isDesktop ? "22px" : "28px",
      headlineSize: `${profile.baseBodyFontSizePt}px`,
      captionSize: isDesktop ? "11px" : "12px",
    },
    dimensions: {
      minHitTarget: `${profile.minHitTargetPt}px`,
      radiusWindow: `${profile.defaultCornerRadiusPt}px`,
      radiusCard: isDesktop ? "12px" : "16px",
      radiusControl: isDesktop ? "8px" : "12px",
      radiusPill: "9999px",
      titlebarHeight: "38px",
      titlebarBtnHeight: "26px",
      sidebarCollapsedWidth: "63px",
      sidebarExpandedWidth: "220px",
      sidebarPadding: "12px",
      sidebarIconPaddingLeft: "9px",
      iosTabBarHeight: "49px",
      iosNavBarHeight: "44px",
      ipadSplitSidebarWidth: "320px",
    },
  };
}
