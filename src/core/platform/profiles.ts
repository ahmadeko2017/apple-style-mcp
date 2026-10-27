/**
 * @file profiles.ts
 * @description Implementasi spesifikasi PlatformProfile untuk macOS, iPadOS, dan iOS sesuai Apple HIG.
 *
 * Tanggung Jawab:
 * - Menyediakan profil metrik ergonomi untuk macOS Tahoe, iPadOS 26, dan iOS 26.
 * - Menyediakan helper validasi dan lookup profil platform secara type-safe.
 */

import { InvalidArgumentError } from "../errors.ts";
import { APPLE_PLATFORMS, type ApplePlatform, type PlatformProfile } from "./types.ts";

export const MACOS_PROFILE: PlatformProfile = {
  platform: "macos",
  displayName: "macOS Desktop",
  osVersionReference: "macOS 26 Tahoe / Sonoma",
  navigationParadigm: "Zero-Shift Collapsible Sidebar + Adaptive Titlebar + Command Palette (⌘K)",
  inputModalities: ["pointer", "hardware_keyboard", "trackpad_gesture"],
  minHitTargetPt: 28,
  baseBodyFontSizePt: 13,
  windowChromeType: "traffic_lights_titlebar",
  requiresSafeAreaInsets: false,
  supportsHoverByDefault: true,
  defaultCornerRadiusPt: 12,
};

export const IPADOS_PROFILE: PlatformProfile = {
  platform: "ipados",
  displayName: "iPadOS Tablet",
  osVersionReference: "iPadOS 26",
  navigationParadigm: "Adaptive Split View (2/3 Columns) + Morphing Sidebar to Floating Tab Bar",
  inputModalities: ["multi_touch", "apple_pencil", "trackpad_pointer", "hardware_keyboard"],
  minHitTargetPt: 44,
  baseBodyFontSizePt: 17,
  windowChromeType: "stage_manager_windowing",
  requiresSafeAreaInsets: true,
  supportsHoverByDefault: true,
  defaultCornerRadiusPt: 18,
};

export const IOS_PROFILE: PlatformProfile = {
  platform: "ios",
  displayName: "iOS Mobile",
  osVersionReference: "iOS 26",
  navigationParadigm: "Liquid Glass Floating Tab Bar + Large Title Navigation Bar + Bottom Sheet",
  inputModalities: ["multi_touch", "haptic_touch"],
  minHitTargetPt: 44,
  baseBodyFontSizePt: 17,
  windowChromeType: "edge_to_edge_safe_area",
  requiresSafeAreaInsets: true,
  supportsHoverByDefault: false,
  defaultCornerRadiusPt: 20,
};

const PROFILE_MAP: Record<ApplePlatform, PlatformProfile> = {
  macos: MACOS_PROFILE,
  ipados: IPADOS_PROFILE,
  ios: IOS_PROFILE,
};

/**
 * Mengambil spesifikasi PlatformProfile berdasarkan identifier platform.
 *
 * @param {ApplePlatform} platform - Identifier platform ('macos' | 'ipados' | 'ios')
 * @returns {PlatformProfile} Objek profil platform yang sesuai
 */
export function getPlatformProfile(platform: ApplePlatform): PlatformProfile {
  return PROFILE_MAP[platform];
}

/**
 * Mengambil seluruh daftar PlatformProfile yang didukung.
 *
 * @returns {readonly PlatformProfile[]} Array berisi profil macOS, iPadOS, dan iOS
 */
export function listAllPlatformProfiles(): readonly PlatformProfile[] {
  return [MACOS_PROFILE, IPADOS_PROFILE, IOS_PROFILE];
}

/**
 * Memvalidasi dan mengonversi input mentah menjadi ApplePlatform yang sah.
 *
 * @param {unknown} rawPlatform - Nilai input platform dari argumen pengguna
 * @param {ApplePlatform} [defaultPlatform] - Nilai default jika input kosong/undefined
 * @returns {ApplePlatform} Platform yang telah tervalidasi
 * @throws {InvalidArgumentError} Jika input bukan 'macos', 'ipados', atau 'ios'
 */
export function parseApplePlatform(
  rawPlatform: unknown,
  defaultPlatform: ApplePlatform = "macos"
): ApplePlatform {
  if (rawPlatform === undefined || rawPlatform === null || rawPlatform === "") {
    return defaultPlatform;
  }
  const normalized = String(rawPlatform).trim().toLowerCase();
  if ((APPLE_PLATFORMS as readonly string[]).includes(normalized)) {
    return normalized as ApplePlatform;
  }
  throw new InvalidArgumentError(
    `Platform tidak valid: "${String(rawPlatform)}". Pilihan yang tersedia: ${APPLE_PLATFORMS.join(", ")}.`,
    { providedPlatform: rawPlatform, allowedPlatforms: APPLE_PLATFORMS }
  );
}
