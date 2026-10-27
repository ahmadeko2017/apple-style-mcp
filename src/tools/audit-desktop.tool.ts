/**
 * @file audit-desktop.tool.ts
 * @description Tool audit kepatuhan desain desktop macOS & cross-platform Tauri v2.
 */

import fs from "node:fs";
import path from "node:path";
import type { McpTool, ToolInputSchema } from "../types.ts";

interface AuditResult {
  category: string;
  check: string;
  passed: boolean;
  severity: "error" | "warning" | "info";
  message: string;
  recommendation?: string;
}

export class DesktopAuditTool implements McpTool {
  public readonly name = "audit_desktop_project";
  public readonly description =
    "Mengaudit kepatuhan arsitektur, konfigurasi Tauri v2, dan styling desktop macOS native pada direktori proyek.";

  public readonly inputSchema: ToolInputSchema = {
    type: "object",
    properties: {
      project_path: {
        type: "string",
        description: "Path direktori proyek yang akan diaudit (default: direktori aktif)",
      },
    },
    required: [],
  };

  public async execute(args: Record<string, unknown>): Promise<string> {
    const projectPath = typeof args.project_path === "string" && args.project_path.trim() !== ""
      ? path.resolve(args.project_path)
      : process.cwd();

    if (!fs.existsSync(projectPath)) {
      return JSON.stringify({ error: `Direktori "${projectPath}" tidak ditemukan.` }, null, 2);
    }

    const results: AuditResult[] = [];

    this.auditTauriConfig(projectPath, results);
    this.auditCssStyling(projectPath, results);
    this.auditContextMenuGuard(projectPath, results);
    this.auditShortcuts(projectPath, results);

    const totalChecks = results.length;
    const passedChecks = results.filter((r) => r.passed).length;
    const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

    return JSON.stringify(
      {
        projectPath,
        complianceScore: `${score}%`,
        totalChecks,
        passedChecks,
        failedChecks: totalChecks - passedChecks,
        audits: results,
      },
      null,
      2
    );
  }

  private auditTauriConfig(projectPath: string, results: AuditResult[]): void {
    const tauriConfPath = path.join(projectPath, "src-tauri", "tauri.conf.json");
    if (!fs.existsSync(tauriConfPath)) {
      results.push({
        category: "Tauri Configuration",
        check: "tauri.conf.json existence",
        passed: false,
        severity: "warning",
        message: "File src-tauri/tauri.conf.json tidak ditemukan.",
        recommendation: "Pastikan proyek adalah aplikasi berbasis Tauri v2.",
      });
      return;
    }

    try {
      const rawContent = fs.readFileSync(tauriConfPath, "utf-8");
      const conf = JSON.parse(rawContent);
      const windows = conf?.app?.windows || [];
      const mainWindow = windows[0] || {};

      results.push({
        category: "Tauri Window Frame",
        check: "decorations: false",
        passed: mainWindow.decorations === false,
        severity: "error",
        message: mainWindow.decorations === false
          ? "Window decorations disetel ke false (frameless chrome aktif)."
          : "decorations tidak bernilai false, window akan menampilkan border OS bawaan.",
        recommendation: 'Setel "decorations": false di app.windows[0].',
      });

      results.push({
        category: "Tauri Window Frame",
        check: "transparent: true",
        passed: mainWindow.transparent === true,
        severity: "error",
        message: mainWindow.transparent === true
          ? "Window transparency aktif untuk sudut melengkung 12px."
          : "transparent tidak bernilai true, area luar sudut 12px akan berwarna hitam.",
        recommendation: 'Setel "transparent": true di app.windows[0].',
      });

      results.push({
        category: "Tauri Window Frame",
        check: "shadow: false",
        passed: mainWindow.shadow === false,
        severity: "error",
        message: mainWindow.shadow === false
          ? "Window shadow dinonaktifkan untuk mencegah garis hitam 1px Windows DWM."
          : "shadow aktif, dapat memicu injeksi border hitam 1px pada Windows 10/11.",
        recommendation: 'Setel "shadow": false di app.windows[0].',
      });
    } catch {
      results.push({
        category: "Tauri Configuration",
        check: "tauri.conf.json parsing",
        passed: false,
        severity: "error",
        message: "Gagal mem-parse src-tauri/tauri.conf.json.",
      });
    }
  }

  private auditCssStyling(projectPath: string, results: AuditResult[]): void {
    const stylesDir = path.join(projectPath, "src", "styles");
    if (!fs.existsSync(stylesDir)) {
      return;
    }

    const cssFiles = fs.readdirSync(stylesDir).filter((f) => f.endsWith(".css"));
    let combinedCss = "";
    for (const file of cssFiles) {
      combinedCss += fs.readFileSync(path.join(stylesDir, file), "utf-8") + "\n";
    }

    // 1. Cek Zero-Shadow Popover
    const hasZeroShadow = combinedCss.includes("box-shadow: none") || combinedCss.includes("--shadow-dropdown: none");
    results.push({
      category: "CSS Visual Design",
      check: "Zero-Shadow Popovers / Dropdowns",
      passed: hasZeroShadow,
      severity: "warning",
      message: hasZeroShadow
        ? "Aturan zero-shadow untuk popover/dropdown terdeteksi."
        : "Tidak ditemukan aturan zero-shadow pada popover, berisiko terpotong sudut 12px.",
      recommendation: "Gunakan 'box-shadow: none !important;' pada popover/dropdown dalam window frameless.",
    });

    // 2. Cek Titlebar Button Height 26px
    const hasTitlebarBtnHeight = combinedCss.includes("--titlebar-btn-height: 26px") || combinedCss.includes("26px");
    results.push({
      category: "CSS Window Chrome",
      check: "Titlebar Button Height 26px",
      passed: hasTitlebarBtnHeight,
      severity: "info",
      message: hasTitlebarBtnHeight
        ? "Konfigurasi tinggi tombol titlebar 26px terdeteksi."
        : "Tinggi tombol titlebar mungkin tidak seragam saat berganti tema.",
      recommendation: "Gunakan token '--titlebar-btn-height: 26px;' untuk seluruh tombol aksi titlebar.",
    });

    // 3. Cek Translucency Vibrancy
    const hasVibrancy = combinedCss.includes("saturate(180%)") || combinedCss.includes("saturate(190%)");
    results.push({
      category: "CSS Material",
      check: "macOS Vibrancy Translucency (saturate + blur)",
      passed: hasVibrancy,
      severity: "info",
      message: hasVibrancy
        ? "Formula saturate(180%+) blur(...) terdeteksi untuk efek kaca berembun Apple."
        : "Efek blur tidak disertai saturate, warna kaca berembun mungkin pucat/kusam.",
      recommendation: "Gunakan 'backdrop-filter: saturate(180%) blur(20px);' untuk sidebar & modal.",
    });

    // 4. Cek Zero-Shift Geometry pada Sidebar
    const hasCenterNavJump = combinedCss.includes(".sidebar-collapsed .nav-item { justify-content: center");
    results.push({
      category: "CSS Sidebar Geometry",
      check: "Zero-Shift Icon Coordinate Lock",
      passed: !hasCenterNavJump,
      severity: "warning",
      message: !hasCenterNavJump
        ? "Pola Zero-Shift terpenuhi (tidak menggunakan justify-content: center saat collapse)."
        : "Ditemukan justify-content: center pada nav-item collapsed yang memicu ikon melompat.",
      recommendation: "Kunci justify-content: flex-start dan padding-left: 9px secara konstan di kedua mode.",
    });
  }

  private auditContextMenuGuard(projectPath: string, results: AuditResult[]): void {
    const srcDir = path.join(projectPath, "src");
    let hasContextMenuGuard = false;

    const scanDir = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".git") {
          scanDir(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
          const content = fs.readFileSync(fullPath, "utf-8");
          if (content.includes("contextmenu") && content.includes("preventDefault")) {
            hasContextMenuGuard = true;
          }
        }
      }
    };

    scanDir(srcDir);

    results.push({
      category: "Desktop Native Protection",
      check: "Disabled Right-Click Context Menu",
      passed: hasContextMenuGuard,
      severity: "warning",
      message: hasContextMenuGuard
        ? "Guard penonaktifan context menu browser terdeteksi."
        : "Klik kanan browser masih aktif, mengurangi kesan software desktop native.",
      recommendation: "Gunakan utilitas setupContextMenuGuard() di src/main.tsx.",
    });
  }

  private auditShortcuts(projectPath: string, results: AuditResult[]): void {
    const srcDir = path.join(projectPath, "src");
    let hasModAbstraction = false;

    const scanDir = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".git") {
          scanDir(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
          const content = fs.readFileSync(fullPath, "utf-8");
          if (content.includes("formatShortcut") || content.includes("Mod+")) {
            hasModAbstraction = true;
          }
        }
      }
    };

    scanDir(srcDir);

    results.push({
      category: "Keyboard Shortcuts",
      check: "Token Mod Shortcut Abstraction",
      passed: hasModAbstraction,
      severity: "info",
      message: hasModAbstraction
        ? "Abstraksi token shortcut 'Mod' terdeteksi untuk kompatibilitas ⌘ vs Ctrl."
        : "Tidak ditemukan utilitas formatShortcut() atau token 'Mod+'.",
      recommendation: "Gunakan token 'Mod' dan utilitas formatShortcut(shortcut, platform).",
    });
  }
}

export const desktopAuditTool = new DesktopAuditTool();
