/**
 * @file component-registry.ts
 * @description Registry terpusat untuk mengambil template komponen Apple HIG lintas macOS, iPadOS, dan iOS.
 *
 * Tanggung Jawab:
 * - Menggabungkan seluruh template komponen dari modul macOS, iPadOS, iOS, dan Shared.
 * - Memvalidasi nama komponen dan mengembalikan kode sumber React + TypeScript produksi.
 */

import { InvalidArgumentError } from "../core/errors.ts";
import { IOS_COMPONENT_TEMPLATES } from "./ios-templates.ts";
import { IPADOS_COMPONENT_TEMPLATES } from "./ipados-templates.ts";
import { MACOS_COMPONENT_TEMPLATES } from "./macos-templates.ts";
import { SHARED_COMPONENT_TEMPLATES } from "./shared-templates.ts";

export const ALL_APPLE_COMPONENTS = [
  // macOS Desktop
  "mac_traffic_lights",
  "adaptive_titlebar",
  "zero_shift_sidebar",
  "command_palette",
  "toast_banner",
  "inspector_panel",
  "context_menu_guard",
  "shortcut_formatter",
  // iPadOS
  "ipad_split_view",
  "adaptive_sidebar_tabbar",
  "ipad_popover",
  "pointer_hover_effect",
  // iOS
  "ios_tab_bar",
  "ios_navigation_bar",
  "ios_bottom_sheet",
  "ios_inset_grouped_list",
  "ios_segmented_control",
  // Shared / Cross-Platform
  "adaptive_app_shell",
  "platform_detector",
  "safe_area_provider",
  "liquid_glass_surface",
] as const;

export type AppleComponentName = (typeof ALL_APPLE_COMPONENTS)[number];

const COMBINED_TEMPLATES: Readonly<Record<string, string>> = {
  ...MACOS_COMPONENT_TEMPLATES,
  ...IPADOS_COMPONENT_TEMPLATES,
  ...IOS_COMPONENT_TEMPLATES,
  ...SHARED_COMPONENT_TEMPLATES,
};

/**
 * Mengambil kode sumber komponen React + TypeScript berdasarkan nama komponen.
 *
 * @param {unknown} rawComponentName - Nama komponen yang diminta pengguna
 * @returns {string} Kode sumber komponen React + TypeScript
 * @throws {InvalidArgumentError} Jika nama komponen tidak terdaftar dalam katalog
 */
export function getAppleComponentTemplate(rawComponentName: unknown): string {
  const normalizedName = String(rawComponentName || "")
    .trim()
    .toLowerCase();
  const templateCode = COMBINED_TEMPLATES[normalizedName];
  if (!templateCode) {
    throw new InvalidArgumentError(
      `Pilihan komponen tidak valid: "${String(rawComponentName)}". Pilihan yang tersedia: ${ALL_APPLE_COMPONENTS.join(", ")}.`,
      { providedComponent: rawComponentName, availableComponents: ALL_APPLE_COMPONENTS }
    );
  }
  return templateCode;
}
