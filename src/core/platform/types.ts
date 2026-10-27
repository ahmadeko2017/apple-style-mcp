/**
 * @file types.ts
 * @description Definisi tipe data inti untuk profil platform Apple (macOS, iPadOS, iOS) dan era desain.
 *
 * Tanggung Jawab:
 * - Mendefinisikan tipe union ApplePlatform, DesignEra, ColorScheme, PaletteMode, dan TokenOutputFormat.
 * - Mendefinisikan kontrak PlatformProfile untuk diferensiasi metrik HIG antar perangkat.
 */

export const APPLE_PLATFORMS = ["macos", "ipados", "ios"] as const;
export type ApplePlatform = (typeof APPLE_PLATFORMS)[number];

export const DESIGN_ERAS = ["liquid_glass", "classic"] as const;
export type DesignEra = (typeof DESIGN_ERAS)[number];

export const COLOR_SCHEMES = ["dark", "light", "both"] as const;
export type ColorScheme = (typeof COLOR_SCHEMES)[number];

export const PALETTE_MODES = ["apple_system", "brand_custom"] as const;
export type PaletteMode = (typeof PALETTE_MODES)[number];

export const TOKEN_OUTPUT_FORMATS = ["css", "json", "typescript", "swift"] as const;
export type TokenOutputFormat = (typeof TOKEN_OUTPUT_FORMATS)[number];

export type WindowChromeType =
  "traffic_lights_titlebar" | "stage_manager_windowing" | "edge_to_edge_safe_area";

/**
 * Spesifikasi profil ergonomi dan geometri antarmuka untuk satu platform Apple.
 */
export interface PlatformProfile {
  readonly platform: ApplePlatform;
  readonly displayName: string;
  readonly osVersionReference: string;
  readonly navigationParadigm: string;
  readonly inputModalities: readonly string[];
  readonly minHitTargetPt: number;
  readonly baseBodyFontSizePt: number;
  readonly windowChromeType: WindowChromeType;
  readonly requiresSafeAreaInsets: boolean;
  readonly supportsHoverByDefault: boolean;
  readonly defaultCornerRadiusPt: number;
}
