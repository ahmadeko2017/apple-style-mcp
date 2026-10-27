/**
 * @file compare-pattern.tool.ts
 * @description Tool MCP untuk membandingkan implementasi pola UI antara macOS, iPadOS, dan iOS.
 *
 * Tanggung Jawab:
 * - Memvalidasi parameter 'pattern' dari pengguna.
 * - Mengembalikan matriks perbandingan terstruktur (JSON) antara macOS, iPadOS, dan iOS.
 */

import { COMPARISON_PATTERNS, getPatternComparison } from "../knowledge/pattern-comparisons.ts";
import type { McpTool, ToolInputSchema } from "../types.ts";

/**
 * Tool MCP untuk membandingkan pola desain antarmuka lintas macOS, iPadOS, dan iOS.
 */
export class ComparePlatformPatternTool implements McpTool {
  public readonly name = "compare_platform_pattern";
  public readonly description =
    "Membandingkan bagaimana suatu pola antarmuka Apple HIG (navigation, modality, context_actions, notifications, window_and_safe_area, typography_and_ergonomics) diimplementasikan di macOS, iPadOS, dan iOS.";

  public readonly inputSchema: ToolInputSchema = {
    type: "object",
    properties: {
      pattern: {
        type: "string",
        enum: [...COMPARISON_PATTERNS],
        description: "Pola desain UI yang ingin dibandingkan lintas platform Apple",
      },
    },
    required: ["pattern"],
  };

  /**
   * Mengeksekusi perbandingan pola desain lintas platform Apple.
   *
   * @param {Record<string, unknown>} args - Argumen pemanggilan tool yang berisi 'pattern'
   * @returns {string} String JSON berisi matriks perbandingan macOS, iPadOS, dan iOS
   * @throws {InvalidArgumentError} Jika nama pola tidak dikenali
   */
  public execute(args: Record<string, unknown>): string {
    const comparisonMatrix = getPatternComparison(args.pattern);
    return JSON.stringify(comparisonMatrix, null, 2);
  }
}

export const comparePlatformPatternTool = new ComparePlatformPatternTool();
