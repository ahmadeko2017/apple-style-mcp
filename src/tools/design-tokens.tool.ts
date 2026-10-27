/**
 * @file design-tokens.tool.ts
 * @description Tool MCP untuk mengekstrak dan menghasilkan design tokens Apple HIG
 *   lintas platform (macOS, iPadOS, iOS) dalam format CSS, JSON, TypeScript, atau SwiftUI.
 *
 * Tanggung Jawab:
 * - Memvalidasi parameter input (format, platform, design_era, palette_mode, accent_primary).
 * - Memanggil Token Engine terpusat dan mengembalikan representasi string yang sesuai.
 */

import { parseApplePlatform } from "../core/platform/profiles.ts";
import {
  APPLE_PLATFORMS,
  DESIGN_ERAS,
  PALETTE_MODES,
  TOKEN_OUTPUT_FORMATS,
} from "../core/platform/types.ts";
import { renderDesignTokens } from "../tokens/renderers.ts";
import {
  buildDesignTokenBundle,
  parseDesignEra,
  parsePaletteMode,
  parseTokenOutputFormat,
} from "../tokens/token-definitions.ts";
import type { McpTool, ToolInputSchema } from "../types.ts";

/**
 * Tool MCP untuk mengambil paket Design Tokens Apple HIG (macOS, iPadOS, iOS).
 */
export class DesignTokensTool implements McpTool {
  public readonly name = "get_design_tokens";
  public readonly description =
    "Menyediakan design tokens resmi Apple HIG untuk macOS, iPadOS, dan iOS (Liquid Glass & Classic Vibrancy, Apple System Colors & Brand Custom, SF Pro typography, safe-area insets, dan chrome geometry) dalam format CSS, JSON, TypeScript, atau SwiftUI.";

  public readonly inputSchema: ToolInputSchema = {
    type: "object",
    properties: {
      format: {
        type: "string",
        enum: [...TOKEN_OUTPUT_FORMATS],
        description:
          "Format output yang diinginkan: css, json, typescript, atau swift (default: css)",
      },
      platform: {
        type: "string",
        enum: [...APPLE_PLATFORMS],
        description: "Target platform Apple: macos, ipados, atau ios (default: macos)",
      },
      design_era: {
        type: "string",
        enum: [...DESIGN_ERAS],
        description:
          "Bahasa desain Apple: liquid_glass (OS 26 / Tahoe) atau classic (default: liquid_glass)",
      },
      palette_mode: {
        type: "string",
        enum: [...PALETTE_MODES],
        description: "Palet dasar warna: apple_system atau brand_custom (default: apple_system)",
      },
      accent_primary: {
        type: "string",
        description: "Warna aksen primer kustom dalam format hex (contoh: #0284c7)",
      },
    },
    required: [],
  };

  /**
   * Mengeksekusi pembuatan design tokens berdasarkan argumen pengguna.
   *
   * @param {Record<string, unknown>} args - Argumen input dari pemanggilan tool MCP
   * @returns {string} Representasi design tokens dalam format yang dipilih
   * @throws {InvalidArgumentError} Jika format, platform, design_era, atau palette_mode tidak valid
   */
  public execute(args: Record<string, unknown>): string {
    const format = parseTokenOutputFormat(args.format);
    const platform = parseApplePlatform(args.platform, "macos");
    const designEra = parseDesignEra(args.design_era);
    const paletteMode = parsePaletteMode(args.palette_mode);
    const accentPrimary = typeof args.accent_primary === "string" ? args.accent_primary : undefined;

    const tokenBundle = buildDesignTokenBundle({
      platform,
      designEra,
      paletteMode,
      accentPrimary,
    });

    return renderDesignTokens(tokenBundle, format);
  }
}

export const designTokensTool = new DesignTokensTool();
