/**
 * @file base-app-scaffold.tool.ts
 * @description Tool untuk melakukan scaffolding proyek desktop baru dari base app template.
 */

import fs from "node:fs";
import path from "node:path";
import type { McpTool, ToolInputSchema } from "../types.ts";

export class BaseAppScaffoldTool implements McpTool {
  public readonly name = "scaffold_base_app_template";
  public readonly description =
    "Menghasilkan struktur starter atau menuliskan file konfigurasi (tauri.conf.json, tokens.css, AppShell starter) untuk proyek desktop baru.";

  public readonly inputSchema: ToolInputSchema = {
    type: "object",
    properties: {
      app_name: {
        type: "string",
        description: "Nama aplikasi desktop baru (contoh: 'My Desktop App')",
      },
      identifier: {
        type: "string",
        description: "Bundle identifier aplikasi (contoh: 'com.mycompany.app')",
      },
      accent_color: {
        type: "string",
        description: "Warna aksen utama aplikasi (hex, contoh: '#0284c7'). Default: '#6366f1'",
      },
      target_dir: {
        type: "string",
        description: "Direktori target penulisan file starter (opsional. Jika tidak diisi, mengembalikan JSON file payload)",
      },
    },
    required: ["app_name", "identifier"],
  };

  public execute(args: Record<string, unknown>): string {
    const appName = String(args.app_name || "New Desktop App");
    const identifier = String(args.identifier || "com.example.app");
    const accent = typeof args.accent_color === "string" && args.accent_color.startsWith("#")
      ? args.accent_color
      : "#6366f1";
    const targetDir = typeof args.target_dir === "string" && args.target_dir.trim() !== ""
      ? path.resolve(args.target_dir)
      : null;

    const tauriConf = {
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
    };

    const tokensCss = `:root {
  --bg-app: #0d1117;
  --bg-surface-1: #161b22;
  --bg-surface-2: #21262d;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --text-primary: #f0f6fc;
  --text-secondary: #9da7b3;
  --text-tertiary: #6e7681;
  --accent-primary: ${accent};
  --accent-success: #22c55e;
  --accent-warning: #eab308;
  --accent-danger: #ef4444;
  --shadow-window: 0 12px 32px rgba(0, 0, 0, 0.5);
  --shadow-dropdown: none;
  --radius-window: 12px;
  --titlebar-height: 38px;
  --titlebar-btn-height: 26px;
}

[data-theme="light"] {
  --bg-app: #f1f5f9;
  --bg-surface-1: #ffffff;
  --bg-surface-2: #e8ecf2;
  --border-subtle: #cbd5e1;
  --text-primary: #0f172a;
  --text-secondary: #334155;
  --accent-primary: ${accent};
  --shadow-dropdown: none;
}`;

    if (targetDir) {
      const tauriDir = path.join(targetDir, "src-tauri");
      const stylesDir = path.join(targetDir, "src", "styles");

      fs.mkdirSync(tauriDir, { recursive: true });
      fs.mkdirSync(stylesDir, { recursive: true });

      fs.writeFileSync(path.join(tauriDir, "tauri.conf.json"), JSON.stringify(tauriConf, null, 2), "utf-8");
      fs.writeFileSync(path.join(stylesDir, "tokens.css"), tokensCss, "utf-8");

      return JSON.stringify(
        {
          success: true,
          message: `File konfigurasi berhasil dibuat di ${targetDir}`,
          filesCreated: [
            path.join(tauriDir, "tauri.conf.json"),
            path.join(stylesDir, "tokens.css"),
          ],
        },
        null,
        2
      );
    }

    return JSON.stringify(
      {
        appName,
        identifier,
        accentColor: accent,
        files: {
          "src-tauri/tauri.conf.json": tauriConf,
          "src/styles/tokens.css": tokensCss,
        },
      },
      null,
      2
    );
  }
}

export const baseAppScaffoldTool = new BaseAppScaffoldTool();
