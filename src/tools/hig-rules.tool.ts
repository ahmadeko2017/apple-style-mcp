/**
 * @file hig-rules.tool.ts
 * @description Tool MCP untuk melihat aturan spesifik Apple HIG lintas macOS, iPadOS, dan iOS.
 *
 * Tanggung Jawab:
 * - Memvalidasi topik HIG dan filter platform opsional.
 * - Mengembalikan dokumentasi teknis, formula matematika, dan solusi pencegahan bug.
 */

import { parseApplePlatform } from "../core/platform/profiles.ts";
import { APPLE_PLATFORMS } from "../core/platform/types.ts";
import { getHigRuleMarkdown, HIG_TOPICS } from "../knowledge/hig-topics.ts";
import type { McpTool, ToolInputSchema } from "../types.ts";

/**
 * Tool MCP untuk lookup instan aturan desain Apple HIG (macOS, iPadOS, iOS, Liquid Glass).
 */
export class HigRulesTool implements McpTool {
  public readonly name = "get_apple_hig_rule";
  public readonly description =
    "Melihat penjelasan teknis, formula matematika, dan pencegahan bug untuk aturan desain Apple HIG lintas macOS, iPadOS, dan iOS (termasuk Liquid Glass, Zero-Shift Geometry, Safe Area Insets, Split View, dan Floating Tab Bar).";

  public readonly inputSchema: ToolInputSchema = {
    type: "object",
    properties: {
      topic: {
        type: "string",
        enum: [...HIG_TOPICS],
        description: "Topik aturan Apple HIG yang ingin dipelajari",
      },
      platform: {
        type: "string",
        enum: [...APPLE_PLATFORMS],
        description: "Filter platform opsional: macos, ipados, atau ios",
      },
    },
    required: ["topic"],
  };

  /**
   * Mengeksekusi pencarian aturan Apple HIG berdasarkan topik dan platform.
   *
   * @param {Record<string, unknown>} args - Argumen input yang memuat 'topic' dan 'platform' opsional
   * @returns {string} Penjelasan teknis aturan Apple HIG dalam format Markdown
   * @throws {InvalidArgumentError} Jika topik atau platform tidak valid
   */
  public execute(args: Record<string, unknown>): string {
    const platform =
      args.platform !== undefined && args.platform !== ""
        ? parseApplePlatform(args.platform)
        : undefined;
    return getHigRuleMarkdown(args.topic, platform);
  }
}

export const higRulesTool = new HigRulesTool();
