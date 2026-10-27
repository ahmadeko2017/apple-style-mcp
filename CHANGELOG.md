# Changelog

Seluruh perubahan penting pada proyek **`@ahmad/apple-style-mcp`** didokumentasikan dalam file ini.

Format mengacu pada [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/), dan proyek ini mematuhi [Semantic Versioning](https://semver.org/lang/id/).

---

## [2.0.0] - 2026-10-27

### ✨ Ditambahkan (Added)

- **Dukungan Penuh Multi-Platform Apple HIG**: Ekspansi dari khusus macOS Desktop menjadi ekosistem penuh **macOS 26 Tahoe**, **iPadOS 26**, dan **iOS 26**.
- **Bahasa Desain Liquid Glass & Classic Vibrancy**: Dukungan token dan permukaan komponen dengan aturan _"Navigation Layer Only"_, specular highlight border, dan dynamic lensing.
- **Single Source of Truth Token Engine (`src/tokens/`)**: Ekspor token dalam 4 format: **CSS Variables**, **JSON**, **TypeScript (`as const`)**, dan **SwiftUI (`Color`, `Font`, `Layout`)**.
- **21 Template Komponen Produksi (`src/components/`)**:
  - **macOS**: `mac_traffic_lights`, `adaptive_titlebar`, `zero_shift_sidebar`, `command_palette` (navigasi keyboard penuh `ArrowUp`/`ArrowDown`/`Enter`/`Esc`), `toast_banner`, `inspector_panel`, `context_menu_guard`, `shortcut_formatter`.
  - **iPadOS**: `ipad_split_view` (2/3 kolom), `adaptive_sidebar_tabbar` (morphing sidebar ke floating tab bar), `ipad_popover`, `pointer_hover_effect` (trackpad magnetic lift).
  - **iOS**: `ios_tab_bar` (Liquid Glass auto-minimize), `ios_navigation_bar` (large title collapse), `ios_bottom_sheet` (medium/large detents + grabber), `ios_inset_grouped_list`, `ios_segmented_control`.
  - **Shared / Universal**: `adaptive_app_shell`, `platform_detector` (deteksi iPadOS via `maxTouchPoints`), `safe_area_provider`, `liquid_glass_surface`.
- **Tool Baru `compare_platform_pattern`**: Matriks perbandingan arsitektur UI antara macOS, iPadOS, dan iOS (`navigation`, `modality`, `context_actions`, `notifications`, `window_and_safe_area`, `typography_and_ergonomics`).
- **Auto-Detector Platform & Multi-Platform Audit Engine (`src/audit/`)**: Skor kepatuhan per platform (`platformScores.macos`, `platformScores.ipados`, `platformScores.ios`) beserta deteksi otomatis `viewport-fit=cover`, `env(safe-area-inset-*)`, `100dvh`, dan target sentuh `44x44pt`.
- **Enterprise Production Readiness**:
  - Migrasi dan integrasi `@modelcontextprotocol/sdk`.
  - `StructuredLogger` JSON ke `stderr` dengan redaksi otomatis PII (email, JWT, nomor kartu/PAN, path direktori user).
  - `GracefulShutdownManager` untuk menangani `SIGTERM` dan `SIGINT` dengan _in-flight operation draining_.
  - `safe-fs` dengan proteksi path traversal, pembatasan kedalaman rekursi/ukuran file, `dry_run`, dan proteksi `overwrite: false`.

### 🔄 Diubah (Changed)

- Nama paket diperbarui menjadi `@ahmad/apple-style-mcp` (dengan mempertahankan binary & alias kompatibilitas `desktop-style-mcp`, `audit_desktop_project`, `scaffold_macos_component`, dan `scaffold_base_app_template`).
- Pengecekan CSS pada mesin audit diperbarui dari pencocokan substring sederhana menjadi evaluasi properti berbasis Regular Expression yang presisi.

---

## [1.0.0] - 2026-10-01

### ✨ Rilis Awal

- Server MCP JSON-RPC 2.0 stdio untuk audit dan scaffolding aplikasi desktop macOS berbasis Tauri v2 + React TypeScript.
- Implementasi awal Formula Zero-Shift Sidebar Geometry (`21px` X-coordinate lock) dan Zero-Shadow Popovers.
