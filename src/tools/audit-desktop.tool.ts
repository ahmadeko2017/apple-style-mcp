/**
 * @file audit-desktop.tool.ts
 * @description Tool MCP untuk mengaudit kepatuhan arsitektur dan styling proyek Apple HIG
 *   lintas macOS, iPadOS, dan iOS (`audit_apple_project` serta alias `audit_desktop_project`).
 *
 * Tanggung Jawab:
 * - Memvalidasi path proyek dan menentukan target platform (eksplisit atau auto-detect).
 * - Menjalankan mesin audit multi-platform dan mengembalikan laporan JSON terstruktur.
 */

import fs from "node:fs";
import path from "node:path";
import { runAppleProjectAudit } from "../audit/audit-engine.ts";
import { resolveTargetPlatforms } from "../audit/detector.ts";
import { APPLE_PLATFORMS, type ApplePlatform } from "../core/platform/types.ts";
import type { McpTool, ToolInputSchema } from "../types.ts";

/**
 * Tool utama untuk mengaudit proyek terhadap standar Apple HIG (macOS, iPadOS, iOS).
 */
export class AppleProjectAuditTool implements McpTool {
  public readonly name: string;
  public readonly description: string;
  private readonly defaultPlatforms: readonly ApplePlatform[];

  public readonly inputSchema: ToolInputSchema = {
    type: "object",
    properties: {
      project_path: {
        type: "string",
        description: "Path direktori proyek yang akan diaudit (default: direktori kerja aktif)",
      },
      platforms: {
        type: "array",
        items: {
          type: "string",
          enum: [...APPLE_PLATFORMS],
        },
        description:
          "Daftar platform Apple yang diaudit: ['macos', 'ipados', 'ios'] (opsional, auto-detect jika kosong)",
      },
    },
    required: [],
  };

  /**
   * Membuat instance AppleProjectAuditTool.
   *
   * @param {string} [toolName] - Nama tool yang diekspos ke klien MCP
   * @param {string} [toolDescription] - Deskripsi kemampuan tool
   * @param {readonly ApplePlatform[]} [defaultPlatforms] - Platform fallback saat auto-detect
   */
  constructor(
    toolName = "audit_apple_project",
    toolDescription = "Mengaudit kepatuhan arsitektur, konfigurasi Tauri v2, safe-area mobile, ergonomi sentuh 44pt, dan styling Liquid Glass Apple HIG pada proyek macOS, iPadOS, dan iOS.",
    defaultPlatforms: readonly ApplePlatform[] = ["macos"]
  ) {
    this.name = toolName;
    this.description = toolDescription;
    this.defaultPlatforms = defaultPlatforms;
  }

  /**
   * Mengeksekusi audit proyek untuk platform yang dipilih atau terdeteksi otomatis.
   *
   * @param {Record<string, unknown>} args - Argumen pemanggilan tool
   * @returns {Promise<string>} Laporan hasil audit dalam format string JSON
   */
  public async execute(args: Record<string, unknown>): Promise<string> {
    const projectPath =
      typeof args.project_path === "string" && args.project_path.trim() !== ""
        ? path.resolve(args.project_path)
        : process.cwd();

    if (!fs.existsSync(projectPath)) {
      return JSON.stringify({ error: `Direktori "${projectPath}" tidak ditemukan.` }, null, 2);
    }

    const targetPlatforms = resolveTargetPlatforms(
      args.platforms,
      projectPath,
      this.defaultPlatforms
    );
    const auditReport = runAppleProjectAudit(projectPath, targetPlatforms);
    return JSON.stringify(auditReport, null, 2);
  }
}

export const appleAuditTool = new AppleProjectAuditTool();

export const desktopAuditTool = new AppleProjectAuditTool(
  "audit_desktop_project",
  "[Alias Kompatibilitas] Mengaudit kepatuhan arsitektur, konfigurasi Tauri v2, dan styling desktop macOS native pada direktori proyek.",
  ["macos"]
);
