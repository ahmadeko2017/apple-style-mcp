/**
 * @file guidelines.resource.ts
 * @description Resources MCP untuk pedoman Apple HIG lintas platform (macOS, iPadOS, iOS, Liquid Glass)
 *   serta resource kompatibilitas mundur (desktop://).
 *
 * Tanggung Jawab:
 * - Menyediakan dokumen referensi statis bagi klien MCP melalui URI apple:// dan desktop://.
 */

import { listAllPlatformProfiles } from "../core/platform/profiles.ts";
import { getHigRuleMarkdown, listHigTopicsByPlatform } from "../knowledge/hig-topics.ts";
import type { McpResource } from "../types.ts";

export const macosHigResource: McpResource = {
  uri: "desktop://guidelines/macos-hig",
  name: "macOS Desktop HIG Guidelines",
  description: "Pedoman resmi Apple HIG untuk antarmuka desktop native berbasis Tauri v2",
  mimeType: "text/markdown",
  read: () => `# macOS Desktop App Architecture Guidelines
1. Window frame frameless (decorations: false, transparent: true, shadow: false)
2. Traffic lights at top-left with SVG micro-icons
3. Drag region with programmatic IPC 'start_dragging_window'
4. Collapsible sidebar with zero-shift geometry
5. Spotlight command palette (⌘K)
6. macOS notification banner at top-right
7. Zero-shadow popovers and tooltips
8. Centered design tokens with dark/light mode support`,
};

export const zeroShiftResource: McpResource = {
  uri: "desktop://geometry/zero-shift",
  name: "Sidebar Zero-Shift Geometry Formula",
  description: "Formula matematika koordinat absolut 21px untuk collapsible sidebar",
  mimeType: "text/plain",
  read: () => `FORMULA ZERO-SHIFT GEOMETRY:
Sidebar Padding: 12px (4 Sisi)
Button Dimensi Collapsed: 38px x 38px
Icon Wrapper Dimensi: 20px x 20px
Padding-left Item Konstan: (38 - 20) / 2 = 9px

Expanded Koordinat X: 12px + 9px = 21px
Collapsed Koordinat X: 12px + 9px = 21px
Selisih: 0px (Bebas Glitch Loncat)

Lebar Total Collapsed: 12px + 38px + 12px + 1px border = 63px (Margin simetris 12px di 4 sisi)`,
};

export const appleOverviewResource: McpResource = {
  uri: "apple://hig/overview",
  name: "Apple Multi-Platform HIG Overview (macOS, iPadOS, iOS)",
  description: "Ringkasan profil ergonomi dan arsitektur navigasi macOS, iPadOS, dan iOS",
  mimeType: "application/json",
  read: () => JSON.stringify({ platforms: listAllPlatformProfiles() }, null, 2),
};

export const liquidGlassResource: McpResource = {
  uri: "apple://hig/liquid-glass",
  name: "Apple Liquid Glass Design Guidelines (OS 26 / macOS Tahoe)",
  description: "Aturan hierarki material Liquid Glass untuk layer navigasi melayang",
  mimeType: "text/markdown",
  read: () => getHigRuleMarkdown("liquid_glass_materials"),
};

export const ipadosHigResource: McpResource = {
  uri: "apple://hig/ipados",
  name: "iPadOS 26 HIG Guidelines",
  description: "Pedoman Split View, Morphing Sidebar/Tab Bar, dan Trackpad Pointer pada iPadOS",
  mimeType: "text/markdown",
  read: () =>
    listHigTopicsByPlatform("ipados")
      .map((entry) => entry.markdownContent)
      .join("\n\n---\n\n"),
};

export const iosHigResource: McpResource = {
  uri: "apple://hig/ios",
  name: "iOS 26 HIG Guidelines",
  description: "Pedoman Floating Tab Bar, Large Title, Bottom Sheet, dan Safe Area pada iOS",
  mimeType: "text/markdown",
  read: () =>
    listHigTopicsByPlatform("ios")
      .map((entry) => entry.markdownContent)
      .join("\n\n---\n\n"),
};

export const ALL_MCP_RESOURCES: readonly McpResource[] = [
  macosHigResource,
  zeroShiftResource,
  appleOverviewResource,
  liquidGlassResource,
  ipadosHigResource,
  iosHigResource,
];
