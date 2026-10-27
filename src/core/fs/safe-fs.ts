/**
 * @file safe-fs.ts
 * @description Utilitas filesystem yang aman dengan pembatasan kedalaman rekursi, ukuran file,
 *   pencegahan symlink loop, serta proteksi penulisan file (safe path & anti-overwrite).
 *
 * Tanggung Jawab:
 * - Menggantikan duplikasi fungsi scanDir dengan satu pemindai terpusat yang aman.
 * - Mencegah pembacaan file raksasa atau symlink berbahaya saat audit proyek.
 * - Memvalidasi direktori target sebelum melakukan scaffolding file.
 */

import fs from "node:fs";
import path from "node:path";
import { UnsafePathError } from "../errors.ts";

export interface ScannedFileContent {
  readonly relativePath: string;
  readonly fullPath: string;
  readonly content: string;
}

export interface ScanDirectoryOptions {
  readonly extensions: readonly string[];
  readonly maxDepth?: number;
  readonly maxFileSizeBytes?: number;
}

const IGNORED_DIRECTORIES = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  "target",
  ".next",
]);

const DEFAULT_MAX_DEPTH = 6;
const DEFAULT_MAX_FILE_SIZE_BYTES = 512 * 1024;

/**
 * Memeriksa apakah sebuah file memiliki ekstensi yang termasuk dalam daftar filter.
 *
 * @param {string} fileName - Nama file yang diperiksa
 * @param {readonly string[]} allowedExtensions - Daftar ekstensi (contoh: ['.ts', '.tsx'])
 * @returns {boolean} True jika ekstensi cocok
 */
function hasMatchingExtension(fileName: string, allowedExtensions: readonly string[]): boolean {
  return allowedExtensions.some((ext) => fileName.toLowerCase().endsWith(ext.toLowerCase()));
}

/**
 * Membaca file teks secara aman apabila ukurannya tidak melebihi batas maksimum.
 *
 * @param {string} fullPath - Path absolut menuju file
 * @param {number} maxFileSizeBytes - Batas ukuran maksimum dalam byte
 * @returns {string | null} Isi file atau null jika melewati batas/gagal dibaca
 */
export function readTextFileSafely(
  fullPath: string,
  maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE_BYTES
): string | null {
  try {
    const stat = fs.lstatSync(fullPath);
    if (stat.isSymbolicLink() || !stat.isFile() || stat.size > maxFileSizeBytes) {
      return null;
    }
    return fs.readFileSync(fullPath, "utf-8");
  } catch {
    return null;
  }
}

/**
 * Memindai direktori secara rekursif dengan batasan kedalaman dan pengabaian symlink.
 *
 * @param {string} rootDirectory - Direktori akar pemindaian
 * @param {ScanDirectoryOptions} options - Konfigurasi ekstensi, kedalaman, dan ukuran maksimum
 * @returns {ScannedFileContent[]} Daftar file beserta isinya yang berhasil dipindai
 */
export function scanDirectoryFiles(
  rootDirectory: string,
  options: ScanDirectoryOptions
): ScannedFileContent[] {
  const collectedFiles: ScannedFileContent[] = [];
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
  const maxBytes = options.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES;

  walkDirectoryLevel(
    rootDirectory,
    rootDirectory,
    0,
    maxDepth,
    maxBytes,
    options.extensions,
    collectedFiles
  );
  return collectedFiles;
}

/**
 * Fungsi rekursif internal untuk memindai satu level direktori.
 *
 * @param {string} rootDir - Direktori awal pemindaian
 * @param {string} currentDir - Direktori yang sedang dipindai
 * @param {number} currentDepth - Kedalaman rekursi saat ini
 * @param {number} maxDepth - Kedalaman maksimum
 * @param {number} maxBytes - Ukuran file maksimum
 * @param {readonly string[]} extensions - Daftar ekstensi yang dicari
 * @param {ScannedFileContent[]} collector - Array penampung hasil
 */
function walkDirectoryLevel(
  rootDir: string,
  currentDir: string,
  currentDepth: number,
  maxDepth: number,
  maxBytes: number,
  extensions: readonly string[],
  collector: ScannedFileContent[]
): void {
  if (currentDepth > maxDepth || !fs.existsSync(currentDir)) {
    return;
  }
  const directoryEntries = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const entry of directoryEntries) {
    if (entry.isSymbolicLink()) continue;
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory() && !IGNORED_DIRECTORIES.has(entry.name)) {
      walkDirectoryLevel(
        rootDir,
        fullPath,
        currentDepth + 1,
        maxDepth,
        maxBytes,
        extensions,
        collector
      );
      continue;
    }
    if (entry.isFile() && hasMatchingExtension(entry.name, extensions)) {
      const content = readTextFileSafely(fullPath, maxBytes);
      if (content !== null) {
        collector.push({ relativePath: path.relative(rootDir, fullPath), fullPath, content });
      }
    }
  }
}

/**
 * Memvalidasi path direktori target penulisan agar bebas dari karakter ilegal atau root OS.
 *
 * @param {string} rawTargetDir - Path direktori target dari input pengguna
 * @returns {string} Path absolut yang telah dinormalisasi dan aman
 * @throws {UnsafePathError} Jika path mengandung null byte atau mengarah ke root filesystem
 */
export function resolveSafeTargetDirectory(rawTargetDir: string): string {
  if (rawTargetDir.includes("\0")) {
    throw new UnsafePathError("Path direktori target mengandung karakter null byte ilegal.");
  }
  const resolvedPath = path.resolve(rawTargetDir.trim());
  const parsedPath = path.parse(resolvedPath);
  if (resolvedPath === parsedPath.root) {
    throw new UnsafePathError("Penulisan langsung ke root filesystem tidak diizinkan.", {
      resolvedPath,
    });
  }
  return resolvedPath;
}

/**
 * Memastikan tidak ada file yang akan tertimpa secara tidak sengaja ketika overwrite=false.
 *
 * @param {readonly string[]} candidateFilePaths - Daftar path absolut file yang akan ditulis
 * @param {boolean} allowOverwrite - Apakah penimpaan file diizinkan
 * @throws {UnsafePathError} Jika file sudah ada dan allowOverwrite bernilai false
 */
export function assertFilesWritable(
  candidateFilePaths: readonly string[],
  allowOverwrite: boolean
): void {
  if (allowOverwrite) {
    return;
  }
  const existingFiles = candidateFilePaths.filter((filePath) => fs.existsSync(filePath));
  if (existingFiles.length > 0) {
    throw new UnsafePathError(
      `File tujuan sudah ada dan overwrite=false: ${existingFiles.map((f) => path.basename(f)).join(", ")}`,
      { existingFiles }
    );
  }
}
