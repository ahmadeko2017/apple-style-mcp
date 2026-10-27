/**
 * @file audit-engine.ts
 * @description Mesin audit kepatuhan Apple HIG untuk macOS, iPadOS, dan iOS.
 *
 * Tanggung Jawab:
 * - Mengevaluasi aturan konfigurasi Tauri v2, CSS Liquid Glass/Zero-Shift, safe-area mobile,
 *   ergonomi target sentuh 44pt, dan proteksi desktop secara akurat (berbasis regex properti).
 * - Menghitung skor kepatuhan total maupun skor per platform.
 */

import fs from "node:fs";
import path from "node:path";
import { readTextFileSafely, scanDirectoryFiles } from "../core/fs/safe-fs.ts";
import type { ApplePlatform } from "../core/platform/types.ts";

export interface AuditCheckResult {
  readonly platform: ApplePlatform | "shared";
  readonly category: string;
  readonly check: string;
  readonly passed: boolean;
  readonly severity: "error" | "warning" | "info";
  readonly message: string;
  readonly recommendation?: string;
}

export interface ProjectAuditReport {
  readonly projectPath: string;
  readonly targetPlatforms: readonly ApplePlatform[];
  readonly complianceScore: string;
  readonly platformScores: Record<string, string>;
  readonly totalChecks: number;
  readonly passedChecks: number;
  readonly failedChecks: number;
  readonly audits: readonly AuditCheckResult[];
}

const ZERO_SHADOW_REGEX = /(?:box-shadow|--shadow-dropdown)\s*:\s*none/i;
const TITLEBAR_BTN_HEIGHT_REGEX = /--titlebar-btn-height\s*:\s*26px/i;
const VIBRANCY_BLUR_REGEX = /backdrop-filter\s*:[^;]*saturate\((?:180|190|200)%\)[^;]*blur\(/i;
const SIDEBAR_CENTER_JUMP_REGEX =
  /\.sidebar-collapsed\s+\.nav-item\s*\{[^}]*justify-content\s*:\s*center/i;
const SAFE_AREA_INSET_REGEX = /env\(\s*safe-area-inset-(?:top|bottom|left|right)/i;
const DYNAMIC_VH_REGEX = /\b100dvh\b|--font-size-body\s*:\s*17px/i;
const TOUCH_TARGET_44_REGEX = /--min-hit-target\s*:\s*44px|min-(?:height|width)\s*:\s*44px/i;
const IPAD_SPLIT_REGEX = /--ipad-split-sidebar-width|@media[^{]*\(\s*min-width\s*:\s*768px\s*\)/i;

/**
 * Menjalankan audit menyeluruh terhadap direktori proyek untuk platform Apple yang dipilih.
 *
 * @param {string} projectPath - Path absolut direktori proyek
 * @param {readonly ApplePlatform[]} targetPlatforms - Daftar platform yang dievaluasi
 * @returns {ProjectAuditReport} Laporan hasil audit lengkap beserta skor kepatuhan
 */
export function runAppleProjectAudit(
  projectPath: string,
  targetPlatforms: readonly ApplePlatform[]
): ProjectAuditReport {
  const audits: AuditCheckResult[] = [];
  const combinedCss = collectProjectFilesContent(projectPath, [".css"]);
  const combinedSourceCode = collectProjectFilesContent(projectPath, [".ts", ".tsx"]);

  if (targetPlatforms.includes("macos")) {
    evaluateMacosTauriChecks(projectPath, audits);
    evaluateMacosCssChecks(combinedCss, audits);
    appendDesktopCodeGuards(combinedSourceCode, audits);
  }
  if (targetPlatforms.includes("ios") || targetPlatforms.includes("ipados")) {
    evaluateMobileViewportChecks(projectPath, combinedCss, audits);
    evaluateMobileErgonomicChecks(combinedCss, audits);
  }
  if (targetPlatforms.includes("ipados")) {
    evaluateIpadosSplitViewChecks(combinedCss, audits);
  }
  evaluateSharedMaterialChecks(combinedCss, audits);

  return buildAuditSummary(projectPath, targetPlatforms, audits);
}

/**
 * Menggabungkan isi file dengan ekstensi tertentu di dalam direktori src proyek.
 *
 * @param {string} projectPath - Path direktori proyek
 * @param {readonly string[]} extensions - Daftar ekstensi file yang dicari
 * @returns {string} Gabungan isi seluruh file yang cocok
 */
function collectProjectFilesContent(projectPath: string, extensions: readonly string[]): string {
  const matchedFiles = scanDirectoryFiles(path.join(projectPath, "src"), { extensions });
  return matchedFiles.map((scannedFile) => scannedFile.content).join("\n");
}

/**
 * Mengevaluasi keberadaan dan konfigurasi tauri.conf.json untuk target desktop macOS.
 *
 * @param {string} projectPath - Path direktori proyek
 * @param {AuditCheckResult[]} audits - Kolektor hasil audit
 */
function evaluateMacosTauriChecks(projectPath: string, audits: AuditCheckResult[]): void {
  const tauriConfPath = path.join(projectPath, "src-tauri", "tauri.conf.json");
  const rawConf = readTextFileSafely(tauriConfPath);
  if (!rawConf) {
    audits.push({
      platform: "macos",
      category: "Tauri Configuration",
      check: "tauri.conf.json existence",
      passed: false,
      severity: "warning",
      message: "File src-tauri/tauri.conf.json tidak ditemukan.",
      recommendation: "Pastikan proyek adalah aplikasi berbasis Tauri v2.",
    });
    return;
  }
  parseAndVerifyTauriWindow(rawConf, audits);
}

/**
 * Mem-parse JSON tauri.conf.json dan memverifikasi properti window frame.
 *
 * @param {string} rawConf - Isi teks tauri.conf.json
 * @param {AuditCheckResult[]} audits - Kolektor hasil audit
 */
function parseAndVerifyTauriWindow(rawConf: string, audits: AuditCheckResult[]): void {
  try {
    const parsed = JSON.parse(rawConf) as { app?: { windows?: Array<Record<string, unknown>> } };
    const mainWindow = parsed?.app?.windows?.[0] ?? {};
    audits.push(
      createWindowCheck(
        "decorations: false",
        mainWindow.decorations === false,
        'Setel "decorations": false di app.windows[0].'
      ),
      createWindowCheck(
        "transparent: true",
        mainWindow.transparent === true,
        'Setel "transparent": true di app.windows[0].'
      ),
      createWindowCheck(
        "shadow: false",
        mainWindow.shadow === false,
        'Setel "shadow": false di app.windows[0].'
      )
    );
  } catch {
    audits.push({
      platform: "macos",
      category: "Tauri Configuration",
      check: "tauri.conf.json parsing",
      passed: false,
      severity: "error",
      message: "Gagal mem-parse src-tauri/tauri.conf.json.",
    });
  }
}

/**
 * Membuat objek AuditCheckResult untuk properti Tauri Window Frame.
 *
 * @param {string} checkName - Nama properti yang diperiksa
 * @param {boolean} passed - Apakah pemeriksaan lulus
 * @param {string} recommendation - Saran perbaikan
 * @returns {AuditCheckResult} Entri hasil pemeriksaan
 */
function createWindowCheck(
  checkName: string,
  passed: boolean,
  recommendation: string
): AuditCheckResult {
  return {
    platform: "macos",
    category: "Tauri Window Frame",
    check: checkName,
    passed,
    severity: "error",
    message: passed
      ? `Konfigurasi ${checkName} telah aktif.`
      : `Konfigurasi ${checkName} belum sesuai standar frameless.`,
    recommendation,
  };
}

/**
 * Mengevaluasi aturan CSS khusus macOS Desktop (Zero-Shadow, Titlebar 26px, Zero-Shift).
 *
 * @param {string} combinedCss - Gabungan isi CSS proyek
 * @param {AuditCheckResult[]} audits - Kolektor hasil audit
 */
function evaluateMacosCssChecks(combinedCss: string, audits: AuditCheckResult[]): void {
  if (combinedCss.length === 0) return;
  const hasZeroShadow = ZERO_SHADOW_REGEX.test(combinedCss);
  const hasBtnHeight = TITLEBAR_BTN_HEIGHT_REGEX.test(combinedCss);
  const hasCenterJump = SIDEBAR_CENTER_JUMP_REGEX.test(combinedCss);

  audits.push(
    {
      platform: "macos",
      category: "CSS Visual Design",
      check: "Zero-Shadow Popovers / Dropdowns",
      passed: hasZeroShadow,
      severity: "warning",
      message: hasZeroShadow
        ? "Aturan zero-shadow terdeteksi."
        : "Tidak ditemukan aturan zero-shadow pada popover.",
      recommendation: "Gunakan 'box-shadow: none !important;' atau '--shadow-dropdown: none;'.",
    },
    {
      platform: "macos",
      category: "CSS Window Chrome",
      check: "Titlebar Button Height 26px",
      passed: hasBtnHeight,
      severity: "info",
      message: hasBtnHeight
        ? "Token '--titlebar-btn-height: 26px' terdeteksi."
        : "Token '--titlebar-btn-height: 26px' belum ada.",
      recommendation: "Gunakan token '--titlebar-btn-height: 26px;' untuk tombol aksi titlebar.",
    },
    {
      platform: "macos",
      category: "CSS Sidebar Geometry",
      check: "Zero-Shift Icon Coordinate Lock",
      passed: !hasCenterJump,
      severity: "warning",
      message: !hasCenterJump
        ? "Pola Zero-Shift terpenuhi."
        : "Ditemukan justify-content: center saat sidebar collapse.",
      recommendation: "Kunci justify-content: flex-start dan padding-left: 9px secara konstan.",
    }
  );
}

/**
 * Menambahkan pemeriksaan context menu guard dan shortcut Mod pada kode sumber.
 *
 * @param {string} combinedSourceCode - Gabungan kode TS/TSX
 * @param {AuditCheckResult[]} audits - Kolektor hasil audit
 */
function appendDesktopCodeGuards(combinedSourceCode: string, audits: AuditCheckResult[]): void {
  const hasContextMenuGuard =
    combinedSourceCode.includes("contextmenu") && combinedSourceCode.includes("preventDefault");
  const hasModShortcut =
    combinedSourceCode.includes("formatShortcut") || combinedSourceCode.includes("Mod+");

  audits.push(
    {
      platform: "macos",
      category: "Desktop Native Protection",
      check: "Disabled Right-Click Context Menu",
      passed: hasContextMenuGuard,
      severity: "warning",
      message: hasContextMenuGuard
        ? "Guard context menu terdeteksi."
        : "Klik kanan browser masih aktif.",
      recommendation: "Gunakan utilitas setupContextMenuGuard() di src/main.tsx.",
    },
    {
      platform: "macos",
      category: "Keyboard Shortcuts",
      check: "Token Mod Shortcut Abstraction",
      passed: hasModShortcut,
      severity: "info",
      message: hasModShortcut
        ? "Abstraksi token 'Mod' terdeteksi."
        : "Tidak ditemukan formatShortcut() atau 'Mod+'.",
      recommendation: "Gunakan token 'Mod' dan utilitas formatShortcut(shortcut, platform).",
    }
  );
}

/**
 * Mengevaluasi viewport-fit=cover dan safe-area-inset untuk iOS & iPadOS.
 *
 * @param {string} projectPath - Path direktori proyek
 * @param {string} combinedCss - Gabungan isi CSS proyek
 * @param {AuditCheckResult[]} audits - Kolektor hasil audit
 */
function evaluateMobileViewportChecks(
  projectPath: string,
  combinedCss: string,
  audits: AuditCheckResult[]
): void {
  const indexHtmlPath = path.join(projectPath, "index.html");
  const indexHtml = fs.existsSync(indexHtmlPath) ? (readTextFileSafely(indexHtmlPath) ?? "") : "";
  const hasViewportCover =
    indexHtml.includes("viewport-fit=cover") || combinedCss.includes("--safe-area-top");
  const hasSafeAreaEnv = SAFE_AREA_INSET_REGEX.test(combinedCss);

  audits.push(
    {
      platform: "ios",
      category: "Mobile Viewport & Safe Area",
      check: "viewport-fit=cover Configuration",
      passed: hasViewportCover,
      severity: "error",
      message: hasViewportCover
        ? "Konfigurasi viewport-fit=cover terdeteksi."
        : "Belum ada viewport-fit=cover di index.html.",
      recommendation: "Tambahkan 'viewport-fit=cover' pada meta viewport di index.html.",
    },
    {
      platform: "ios",
      category: "Mobile Viewport & Safe Area",
      check: "Safe Area Insets env(safe-area-inset-*)",
      passed: hasSafeAreaEnv,
      severity: "error",
      message: hasSafeAreaEnv
        ? "Penggunaan env(safe-area-inset-*) terdeteksi."
        : "CSS belum menggunakan env(safe-area-inset-*).",
      recommendation: "Gunakan env(safe-area-inset-top) dan env(safe-area-inset-bottom).",
    }
  );
}

/**
 * Mengevaluasi ergonomi mobile (100dvh, 17px body, dan target sentuh 44x44pt).
 *
 * @param {string} combinedCss - Gabungan isi CSS proyek
 * @param {AuditCheckResult[]} audits - Kolektor hasil audit
 */
function evaluateMobileErgonomicChecks(combinedCss: string, audits: AuditCheckResult[]): void {
  const hasDynamicViewport = DYNAMIC_VH_REGEX.test(combinedCss);
  const hasTouchTarget44 = TOUCH_TARGET_44_REGEX.test(combinedCss);

  audits.push(
    {
      platform: "ios",
      category: "Mobile Ergonomics & Typography",
      check: "Dynamic Viewport (100dvh) / 17px Body Scale",
      passed: hasDynamicViewport,
      severity: "warning",
      message: hasDynamicViewport
        ? "Skala 17px atau 100dvh terdeteksi."
        : "Belum ditemukan 100dvh atau --font-size-body: 17px.",
      recommendation: "Gunakan 100dvh dan --font-size-body: 17px untuk iOS/iPadOS.",
    },
    {
      platform: "ios",
      category: "Mobile Touch Ergonomics",
      check: "Minimum Hit Target 44x44pt",
      passed: hasTouchTarget44,
      severity: "error",
      message: hasTouchTarget44
        ? "Standar target sentuh 44px terdeteksi."
        : "Belum ditemukan token --min-hit-target: 44px.",
      recommendation: "Tetapkan '--min-hit-target: 44px;' pada semua tombol sentuh iOS/iPadOS.",
    }
  );
}

/**
 * Mengevaluasi aturan khusus iPadOS (Split View / Adaptive Breakpoint).
 *
 * @param {string} combinedCss - Gabungan isi CSS proyek
 * @param {AuditCheckResult[]} audits - Kolektor hasil audit
 */
function evaluateIpadosSplitViewChecks(combinedCss: string, audits: AuditCheckResult[]): void {
  const hasSplitViewSupport = IPAD_SPLIT_REGEX.test(combinedCss);
  audits.push({
    platform: "ipados",
    category: "iPadOS Adaptive Layout",
    check: "Split View Sidebar / Responsive Breakpoint (>=768px)",
    passed: hasSplitViewSupport,
    severity: "warning",
    message: hasSplitViewSupport
      ? "Konfigurasi Split View iPadOS terdeteksi."
      : "Belum ditemukan konfigurasi Split View (>=768px).",
    recommendation:
      "Gunakan '--ipad-split-sidebar-width: 320px;' dan media query min-width: 768px.",
  });
}

/**
 * Mengevaluasi penggunaan material kaca (Liquid Glass / Vibrancy) lintas platform Apple.
 *
 * @param {string} combinedCss - Gabungan isi CSS proyek
 * @param {AuditCheckResult[]} audits - Kolektor hasil audit
 */
function evaluateSharedMaterialChecks(combinedCss: string, audits: AuditCheckResult[]): void {
  if (combinedCss.length === 0) return;
  const hasVibrancyOrGlass = VIBRANCY_BLUR_REGEX.test(combinedCss);
  audits.push({
    platform: "shared",
    category: "CSS Material",
    check: "Apple Liquid Glass / Vibrancy Translucency (saturate + blur)",
    passed: hasVibrancyOrGlass,
    severity: "info",
    message: hasVibrancyOrGlass
      ? "Formula saturate(180%+) blur(...) terdeteksi."
      : "Efek blur tidak disertai saturate(180%+).",
    recommendation: "Gunakan 'backdrop-filter: saturate(200%) blur(28px);' pada layer navigasi.",
  });
}

/**
 * Menghitung skor total dan skor per platform dari daftar hasil pemeriksaan audit.
 *
 * @param {string} projectPath - Path proyek yang diaudit
 * @param {readonly ApplePlatform[]} targetPlatforms - Daftar platform yang diaudit
 * @param {readonly AuditCheckResult[]} audits - Daftar seluruh hasil pemeriksaan
 * @returns {ProjectAuditReport} Laporan akhir hasil audit
 */
function buildAuditSummary(
  projectPath: string,
  targetPlatforms: readonly ApplePlatform[],
  audits: readonly AuditCheckResult[]
): ProjectAuditReport {
  const totalChecks = audits.length;
  const passedChecks = audits.filter((auditEntry) => auditEntry.passed).length;
  const overallPct = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  const platformScores: Record<string, string> = {};
  for (const platform of targetPlatforms) {
    const relevantChecks = audits.filter(
      (auditEntry) => auditEntry.platform === platform || auditEntry.platform === "shared"
    );
    const passedPlatformChecks = relevantChecks.filter((auditEntry) => auditEntry.passed).length;
    const pct =
      relevantChecks.length > 0
        ? Math.round((passedPlatformChecks / relevantChecks.length) * 100)
        : 0;
    platformScores[platform] = `${pct}%`;
  }

  return {
    projectPath,
    targetPlatforms,
    complianceScore: `${overallPct}%`,
    platformScores,
    totalChecks,
    passedChecks,
    failedChecks: totalChecks - passedChecks,
    audits,
  };
}
