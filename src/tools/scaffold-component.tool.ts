/**
 * @file scaffold-component.tool.ts
 * @description Tool MCP untuk menghasilkan kode komponen React + TypeScript produksi
 *   bergaya Apple HIG lintas macOS, iPadOS, dan iOS (`scaffold_apple_component` & alias `scaffold_macos_component`).
 *
 * Tanggung Jawab:
 * - Memvalidasi parameter nama komponen dan platform opsional.
 * - Mengembalikan kode komponen siap pakai dari Component Registry.
 */

import {
  ALL_APPLE_COMPONENTS,
  getAppleComponentTemplate,
} from "../components/component-registry.ts";
import { parseApplePlatform } from "../core/platform/profiles.ts";
import { APPLE_PLATFORMS } from "../core/platform/types.ts";
import type { McpTool, ToolInputSchema } from "../types.ts";

/**
 * Tool MCP untuk menghasilkan komponen React + TypeScript bergaya Apple HIG (macOS, iPadOS, iOS).
 */
export class ScaffoldAppleComponentTool implements McpTool {
  public readonly name: string;
  public readonly description: string;

  public readonly inputSchema: ToolInputSchema = {
    type: "object",
    properties: {
      component: {
        type: "string",
        enum: [...ALL_APPLE_COMPONENTS],
        description:
          "Jenis komponen Apple HIG yang ingin di-generate (macOS, iPadOS, iOS, atau Shared)",
      },
      platform: {
        type: "string",
        enum: [...APPLE_PLATFORMS],
        description: "Konteks platform opsional: macos, ipados, atau ios",
      },
    },
    required: ["component"],
  };

  /**
   * Membuat instance ScaffoldAppleComponentTool.
   *
   * @param {string} [toolName] - Nama tool MCP
   * @param {string} [toolDescription] - Deskripsi kemampuan tool
   */
  constructor(
    toolName = "scaffold_apple_component",
    toolDescription = "Menghasilkan kode komponen React + TypeScript produksi bergaya Apple HIG untuk macOS, iPadOS, dan iOS (Traffic Lights, Zero-Shift Sidebar, Command Palette, iPad Split View, iOS Liquid Glass Tab Bar, Bottom Sheet, dll)."
  ) {
    this.name = toolName;
    this.description = toolDescription;
  }

  /**
   * Mengeksekusi pembuatan kode komponen berdasarkan nama komponen yang dipilih.
   *
   * @param {Record<string, unknown>} args - Argumen input yang memuat 'component' dan 'platform' opsional
   * @returns {string} Kode sumber komponen React + TypeScript
   * @throws {InvalidArgumentError} Jika nama komponen atau platform tidak valid
   */
  public execute(args: Record<string, unknown>): string {
    if (args.platform !== undefined && args.platform !== "") {
      parseApplePlatform(args.platform);
    }
    return getAppleComponentTemplate(args.component);
  }
}

export const scaffoldAppleComponentTool = new ScaffoldAppleComponentTool();

export const scaffoldComponentTool = new ScaffoldAppleComponentTool(
  "scaffold_macos_component",
  "[Alias Kompatibilitas] Menghasilkan kode komponen React + TypeScript produksi bergaya Apple HIG macOS, iPadOS, dan iOS."
);
