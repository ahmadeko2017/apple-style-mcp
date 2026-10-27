/**
 * @file base-app-scaffold.tool.ts
 * @description Tool MCP untuk melakukan scaffolding proyek Apple multi-platform (macOS, iPadOS, iOS)
 *   menggunakan Token Engine terpusat serta proteksi path dan anti-overwrite.
 *
 * Tanggung Jawab:
 * - Menghasilkan konfigurasi Tauri v2 (desktop frameless & iOS/iPadOS bundle), tokens.css,
 *   dan index.html (viewport-fit=cover).
 * - Memproteksi operasi penulisan file dengan validasi path, dry_run, dan overwrite flag.
 */

import fs from "node:fs";
import path from "node:path";
import { assertFilesWritable, resolveSafeTargetDirectory } from "../core/fs/safe-fs.ts";
import { parseApplePlatform } from "../core/platform/profiles.ts";
import {
  APPLE_PLATFORMS,
  DESIGN_ERAS,
  PALETTE_MODES,
  type ApplePlatform,
} from "../core/platform/types.ts";
import { renderCssTokens } from "../tokens/renderers.ts";
import {
  buildDesignTokenBundle,
  parseDesignEra,
  parsePaletteMode,
  resolveAccentHex,
} from "../tokens/token-definitions.ts";
import type { McpTool, ToolInputSchema } from "../types.ts";

interface ScaffoldTemplateSpec {
  readonly appName: string;
  readonly identifier: string;
  readonly platforms: readonly ApplePlatform[];
  readonly accentColor: string;
  readonly tauriConf: Record<string, unknown>;
  readonly tokensCss: string;
  readonly indexHtml?: string;
}

/**
 * Tool MCP untuk melakukan scaffolding konfigurasi awal aplikasi Apple (macOS, iPadOS, iOS).
 */
export class AppleAppScaffoldTool implements McpTool {
  public readonly name: string;
  public readonly description: string;

  public readonly inputSchema: ToolInputSchema = {
    type: "object",
    properties: {
      app_name: {
        type: "string",
        description: "Nama aplikasi baru (contoh: 'Awesome Apple App')",
      },
      identifier: {
        type: "string",
        description: "Bundle identifier aplikasi (contoh: 'com.ahmad.app')",
      },
      platforms: {
        type: "array",
        items: { type: "string", enum: [...APPLE_PLATFORMS] },
        description: "Daftar platform target: ['macos', 'ipados', 'ios'] (default: ['macos'])",
      },
      accent_color: {
        type: "string",
        description: "Warna aksen utama dalam format hex (contoh: '#0284c7')",
      },
      design_era: {
        type: "string",
        enum: [...DESIGN_ERAS],
        description: "Era desain: liquid_glass atau classic (default: liquid_glass)",
      },
      palette_mode: {
        type: "string",
        enum: [...PALETTE_MODES],
        description: "Mode palet warna: apple_system atau brand_custom (default: apple_system)",
      },
      target_dir: {
        type: "string",
        description: "Direktori target penulisan file starter (opsional)",
      },
      dry_run: {
        type: "boolean",
        description:
          "Jika true, hanya mengembalikan preview tanpa menulis ke disk (default: false)",
      },
      overwrite: {
        type: "boolean",
        description: "Jika true, mengizinkan penimpaan file yang sudah ada (default: false)",
      },
    },
    required: ["app_name", "identifier"],
  };

  /**
   * Membuat instance AppleAppScaffoldTool.
   *
   * @param {string} [toolName] - Nama tool MCP
   * @param {string} [toolDescription] - Deskripsi kemampuan tool
   */
  constructor(
    toolName = "scaffold_apple_app_template",
    toolDescription = "Menghasilkan struktur starter dan file konfigurasi (tauri.conf.json, tokens.css, index.html safe-area) untuk proyek macOS, iPadOS, dan iOS dengan dukungan dry_run dan proteksi overwrite."
  ) {
    this.name = toolName;
    this.description = toolDescription;
  }

  /**
   * Mengeksekusi pembuatan payload template atau menulisnya secara aman ke direktori target.
   *
   * @param {Record<string, unknown>} args - Argumen konfigurasi dari pengguna
   * @returns {string} JSON hasil pembuatan file atau payload preview
   * @throws {InvalidArgumentError | UnsafePathError} Jika argumen atau path tidak valid
   */
  public execute(args: Record<string, unknown>): string {
    const spec = buildScaffoldSpec(args);
    const rawTargetDir = typeof args.target_dir === "string" ? args.target_dir.trim() : "";
    const isDryRun = args.dry_run === true;
    const allowOverwrite = args.overwrite === true;

    if (rawTargetDir !== "" && !isDryRun) {
      return writeScaffoldFilesToDisk(rawTargetDir, spec, allowOverwrite);
    }

    const filesMap: Record<string, unknown> = {
      "src-tauri/tauri.conf.json": spec.tauriConf,
      "src/styles/tokens.css": spec.tokensCss,
      ...(spec.indexHtml ? { "index.html": spec.indexHtml } : {}),
    };

    return JSON.stringify(
      {
        appName: spec.appName,
        identifier: spec.identifier,
        platforms: spec.platforms,
        accentColor: spec.accentColor,
        dryRun: isDryRun,
        files: filesMap,
      },
      null,
      2
    );
  }
}

/**
 * Membangun spesifikasi konfigurasi Tauri, CSS Tokens, dan HTML dari argumen input.
 *
 * @param {Record<string, unknown>} args - Argumen input tool
 * @returns {ScaffoldTemplateSpec} Spesifikasi template yang siap ditulis atau dipreview
 */
function buildScaffoldSpec(args: Record<string, unknown>): ScaffoldTemplateSpec {
  const appName = String(args.app_name || "New Apple App");
  const identifier = String(args.identifier || "com.example.app");
  const platforms = parseScaffoldPlatforms(args.platforms);
  const designEra = parseDesignEra(args.design_era);
  const paletteMode = parsePaletteMode(args.palette_mode);
  const rawAccent = typeof args.accent_color === "string" ? args.accent_color : "#6366f1";
  const accentColor = resolveAccentHex(rawAccent, paletteMode);

  const primaryPlatform = platforms[0] ?? "macos";
  const tokenBundle = buildDesignTokenBundle({
    platform: primaryPlatform,
    designEra,
    paletteMode,
    accentPrimary: accentColor,
  });

  const hasMobileTarget = platforms.includes("ios") || platforms.includes("ipados");
  return {
    appName,
    identifier,
    platforms,
    accentColor,
    tauriConf: createTauriConfigObject(appName, identifier, hasMobileTarget),
    tokensCss: renderCssTokens(tokenBundle),
    indexHtml: hasMobileTarget ? createMobileIndexHtml(appName) : undefined,
  };
}

/**
 * Memvalidasi daftar platform pada argumen scaffold.
 *
 * @param {unknown} rawPlatforms - Input array platform dari pengguna
 * @returns {ApplePlatform[]} Daftar platform yang valid
 */
function parseScaffoldPlatforms(rawPlatforms: unknown): ApplePlatform[] {
  if (!Array.isArray(rawPlatforms) || rawPlatforms.length === 0) {
    return ["macos"];
  }
  return Array.from(new Set(rawPlatforms.map((platformItem) => parseApplePlatform(platformItem))));
}

/**
 * Membuat objek konfigurasi tauri.conf.json untuk desktop dan opsional iOS/iPadOS.
 *
 * @param {string} appName - Nama produk aplikasi
 * @param {string} identifier - Bundle identifier
 * @param {boolean} includeIosBundle - Apakah menyertakan konfigurasi bundle.iOS
 * @returns {Record<string, unknown>} Objek konfigurasi Tauri v2
 */
function createTauriConfigObject(
  appName: string,
  identifier: string,
  includeIosBundle: boolean
): Record<string, unknown> {
  return {
    $schema: "https://schema.tauri.app/config/2",
    productName: appName,
    version: "1.0.0",
    identifier,
    app: {
      windows: [
        {
          label: "main",
          title: appName,
          width: 1024,
          height: 700,
          minWidth: 800,
          minHeight: 540,
          decorations: false,
          transparent: true,
          shadow: false,
        },
      ],
    },
    ...(includeIosBundle
      ? {
          bundle: {
            iOS: {
              minimumSystemVersion: "16.0",
              fullScreen: true,
            },
          },
        }
      : {}),
  };
}

/**
 * Membuat template index.html dengan meta viewport-fit=cover untuk iOS dan iPadOS.
 *
 * @param {string} appName - Judul halaman aplikasi
 * @returns {string} Konten HTML starter
 */
function createMobileIndexHtml(appName: string): string {
  return `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>${appName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
}

/**
 * Menuliskan file hasil scaffolding ke disk setelah memvalidasi path dan perlindungan overwrite.
 *
 * @param {string} rawTargetDir - Direktori tujuan dari input pengguna
 * @param {ScaffoldTemplateSpec} spec - Spesifikasi file yang akan ditulis
 * @param {boolean} allowOverwrite - Apakah mengizinkan penimpaan file
 * @returns {string} Respons JSON berisi daftar file yang berhasil dibuat
 */
function writeScaffoldFilesToDisk(
  rawTargetDir: string,
  spec: ScaffoldTemplateSpec,
  allowOverwrite: boolean
): string {
  const safeTargetDir = resolveSafeTargetDirectory(rawTargetDir);
  const tauriConfFile = path.join(safeTargetDir, "src-tauri", "tauri.conf.json");
  const tokensCssFile = path.join(safeTargetDir, "src", "styles", "tokens.css");
  const indexHtmlFile = path.join(safeTargetDir, "index.html");

  const filesToWrite = [tauriConfFile, tokensCssFile, ...(spec.indexHtml ? [indexHtmlFile] : [])];
  assertFilesWritable(filesToWrite, allowOverwrite);

  fs.mkdirSync(path.dirname(tauriConfFile), { recursive: true });
  fs.mkdirSync(path.dirname(tokensCssFile), { recursive: true });
  fs.writeFileSync(tauriConfFile, JSON.stringify(spec.tauriConf, null, 2), "utf-8");
  fs.writeFileSync(tokensCssFile, spec.tokensCss, "utf-8");
  if (spec.indexHtml) {
    fs.writeFileSync(indexHtmlFile, spec.indexHtml, "utf-8");
  }

  return JSON.stringify(
    {
      success: true,
      message: `File konfigurasi berhasil dibuat di ${safeTargetDir}`,
      filesCreated: filesToWrite,
    },
    null,
    2
  );
}

export const appleAppScaffoldTool = new AppleAppScaffoldTool();

export const baseAppScaffoldTool = new AppleAppScaffoldTool(
  "scaffold_base_app_template",
  "[Alias Kompatibilitas] Menghasilkan struktur starter atau menuliskan file konfigurasi (tauri.conf.json, tokens.css, AppShell starter) untuk proyek desktop/mobile baru."
);
