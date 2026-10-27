/**
 * @file detector.ts
 * @description Detektor otomatis target platform Apple (macOS, iPadOS, iOS) dari struktur proyek.
 *
 * Tanggung Jawab:
 * - Memvalidasi input array platform jika diberikan secara eksplisit oleh pengguna.
 * - Mendeteksi secara otomatis apakah suatu proyek menargetkan macOS, iPadOS, dan/atau iOS
 *   berdasarkan konfigurasi Tauri v2, HTML viewport, dan token CSS.
 */

import fs from "node:fs";
import path from "node:path";
import { readTextFileSafely, scanDirectoryFiles } from "../core/fs/safe-fs.ts";
import { parseApplePlatform } from "../core/platform/profiles.ts";
import type { ApplePlatform } from "../core/platform/types.ts";

/**
 * Mengurai daftar platform dari argumen input atau melakukan deteksi otomatis dari direktori proyek.
 *
 * @param {unknown} rawPlatforms - Input array atau string platform dari pengguna
 * @param {string} projectPath - Path direktori proyek yang sedang diaudit
 * @param {readonly ApplePlatform[]} [fallbackPlatforms] - Default jika tidak terdeteksi
 * @returns {ApplePlatform[]} Daftar platform unik yang akan diaudit
 */
export function resolveTargetPlatforms(
  rawPlatforms: unknown,
  projectPath: string,
  fallbackPlatforms: readonly ApplePlatform[] = ["macos"]
): ApplePlatform[] {
  if (Array.isArray(rawPlatforms) && rawPlatforms.length > 0) {
    const validated = rawPlatforms.map((item) => parseApplePlatform(item));
    return Array.from(new Set(validated));
  }
  if (typeof rawPlatforms === "string" && rawPlatforms.trim() !== "") {
    return [parseApplePlatform(rawPlatforms)];
  }
  return detectProjectPlatforms(projectPath, fallbackPlatforms);
}

/**
 * Mendeteksi platform Apple yang ditargetkan oleh proyek berdasarkan artefak konfigurasi & kode.
 *
 * @param {string} projectPath - Path absolut direktori proyek
 * @param {readonly ApplePlatform[]} fallbackPlatforms - Platform default jika tidak ada sinyal khusus
 * @returns {ApplePlatform[]} Daftar platform yang terdeteksi
 */
export function detectProjectPlatforms(
  projectPath: string,
  fallbackPlatforms: readonly ApplePlatform[] = ["macos"]
): ApplePlatform[] {
  const detected = new Set<ApplePlatform>();
  const tauriConfPath = path.join(projectPath, "src-tauri", "tauri.conf.json");
  const tauriGenAppleDir = path.join(projectPath, "src-tauri", "gen", "apple");

  if (fs.existsSync(tauriConfPath)) {
    inspectTauriConfigForPlatforms(tauriConfPath, detected);
  }
  if (fs.existsSync(tauriGenAppleDir)) {
    detected.add("ios");
    detected.add("ipados");
  }
  inspectWebAssetsForPlatforms(projectPath, detected);

  if (detected.size === 0) {
    return [...fallbackPlatforms];
  }
  return Array.from(detected);
}

/**
 * Memeriksa isi tauri.conf.json untuk mendeteksi keberadaan konfigurasi desktop atau iOS.
 *
 * @param {string} tauriConfPath - Path menuju tauri.conf.json
 * @param {Set<ApplePlatform>} detected - Himpunan platform yang terdeteksi
 */
function inspectTauriConfigForPlatforms(tauriConfPath: string, detected: Set<ApplePlatform>): void {
  const rawJson = readTextFileSafely(tauriConfPath);
  if (!rawJson) return;
  try {
    const parsed = JSON.parse(rawJson) as Record<string, unknown>;
    const appSection = parsed.app as Record<string, unknown> | undefined;
    const bundleSection = parsed.bundle as Record<string, unknown> | undefined;
    if (Array.isArray(appSection?.windows) && appSection.windows.length > 0) {
      detected.add("macos");
    }
    if (bundleSection?.iOS !== undefined) {
      detected.add("ios");
      detected.add("ipados");
    }
  } catch {
    detected.add("macos");
  }
}

/**
 * Memeriksa index.html dan stylesheet CSS untuk sinyal iOS / iPadOS.
 *
 * @param {string} projectPath - Direktori proyek
 * @param {Set<ApplePlatform>} detected - Himpunan platform yang terdeteksi
 */
function inspectWebAssetsForPlatforms(projectPath: string, detected: Set<ApplePlatform>): void {
  const indexHtmlContent = readTextFileSafely(path.join(projectPath, "index.html")) ?? "";
  const cssFiles = scanDirectoryFiles(path.join(projectPath, "src"), { extensions: [".css"] });
  const combinedCss = cssFiles.map((file) => file.content).join("\n");

  if (indexHtmlContent.includes("viewport-fit=cover") || combinedCss.includes("safe-area-inset")) {
    detected.add("ios");
  }
  if (combinedCss.includes("--ipad-split-sidebar-width") || combinedCss.includes("SplitView")) {
    detected.add("ipados");
  }
}
