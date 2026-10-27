# 🍎 Apple Style MCP Server (`@ahmad/apple-style-mcp` v2.0.0)

Model Context Protocol (MCP) server untuk mengaudit, mengekstrak design tokens, membandingkan pola desain, dan melakukan scaffolding komponen produksi berbasis **Apple Human Interface Guidelines (HIG)** lintas **macOS, iPadOS, dan iOS** (mendukung bahasa desain **Liquid Glass** & **Classic Vibrancy**).

**Author**: Ahmad  
**License**: MIT

---

## ✨ Fitur Utama v2.0.0

- **Multi-Platform Apple HIG**: Mendukung penuh **macOS Desktop** (Tahoe / Sonoma), **iPadOS 26** (Split View 2/3 Kolom & Morphing Sidebar-to-TabBar), dan **iOS 26** (Floating Liquid Glass Tab Bar, Large Title Navigation Bar, Detent Bottom Sheets, & Safe Area Insets).
- **Liquid Glass & Classic Vibrancy**: Token material dan komponen mendukung aturan hierarki _"Navigation Layer Only"_ untuk Liquid Glass maupun Classic Vibrancy.
- **Single Source of Truth Token Engine**: Mengekspor token dalam format **CSS**, **JSON**, **TypeScript**, dan **SwiftUI** (`Color`, `Font`, & `Layout`).
- **Safe File System & Enterprise Logging**: Dilengkapi proteksi path anti-traversal, perlindungan `overwrite: false`, dukungan `dry_run`, graceful shutdown (`SIGTERM`/`SIGINT`), dan structured JSON logger ke `stderr` dengan redaksi PII otomatis.
- **100% Backward Compatible**: Seluruh nama tool dan resource versi 1.x (`audit_desktop_project`, `scaffold_macos_component`, `scaffold_base_app_template`, `desktop://...`) tetap didukung sebagai alias kompatibilitas.

---

## 🛠️ Daftar Tools MCP

### 1. `audit_apple_project` _(Alias: `audit_desktop_project`)_

Mengaudit direktori proyek terhadap standar Apple HIG lintas `macos`, `ipados`, dan `ios` (mendukung deteksi platform otomatis):

- **macOS**: Frameless Tauri window (`decorations: false`, `transparent: true`, `shadow: false`), Zero-Shadow popovers, Titlebar button height `26px`, Zero-Shift sidebar coordinate lock (`21px`), Context menu guard, dan shortcut `Mod`.
- **iOS & iPadOS**: `viewport-fit=cover`, penggunaan `env(safe-area-inset-*)`, tinggi dinamis `100dvh` / body `17px`, dan target sentuh minimum `44x44pt`.
- **iPadOS**: Konfigurasi Split View (`320px`) & media query responsif `>= 768px`.
- **Shared Material**: Penggunaan translucency `saturate(180%+) blur(...)`.

### 2. `scaffold_apple_component` _(Alias: `scaffold_macos_component`)_

Menghasilkan kode komponen React + TypeScript produksi siap pakai:

- **macOS**: `mac_traffic_lights`, `adaptive_titlebar`, `zero_shift_sidebar`, `command_palette`, `toast_banner`, `inspector_panel`, `context_menu_guard`, `shortcut_formatter`.
- **iPadOS**: `ipad_split_view`, `adaptive_sidebar_tabbar`, `ipad_popover`, `pointer_hover_effect`.
- **iOS**: `ios_tab_bar`, `ios_navigation_bar`, `ios_bottom_sheet`, `ios_inset_grouped_list`, `ios_segmented_control`.
- **Shared / Universal**: `adaptive_app_shell`, `platform_detector`, `safe_area_provider`, `liquid_glass_surface`.

### 3. `get_design_tokens`

Mengekstrak paket design tokens berdasarkan `platform` (`macos` | `ipados` | `ios`), `design_era` (`liquid_glass` | `classic`), `palette_mode` (`apple_system` | `brand_custom`), dan `format` (`css` | `json` | `typescript` | `swift`).

### 4. `scaffold_apple_app_template` _(Alias: `scaffold_base_app_template`)_

Menghasilkan konfigurasi starter (`src-tauri/tauri.conf.json`, `src/styles/tokens.css`, dan `index.html` dengan `viewport-fit=cover` untuk mobile) dengan proteksi `dry_run` dan `overwrite: false`.

### 5. `get_apple_hig_rule`

Lookup penjelasan teknis dan formula matematika untuk 13 topik HIG:
`zero_shift_geometry`, `zero_shadow_popovers`, `window_frame_canvas`, `titlebar_controls`, `spotlight_command_palette`, `toast_banner`, `liquid_glass_materials`, `touch_and_hit_targets`, `safe_area_and_viewport`, `ipad_split_view_and_morphing`, `ipad_pointer_and_stage_manager`, `ios_floating_tab_bar`, `ios_large_title_and_sheets`.

### 6. `compare_platform_pattern`

Membandingkan bagaimana satu pola UI (`navigation`, `modality`, `context_actions`, `notifications`, `window_and_safe_area`, `typography_and_ergonomics`) diterjemahkan secara idiomatik di macOS, iPadOS, dan iOS.

---

## 📚 Daftar Resources MCP

- `apple://hig/overview` — Ringkasan profil ergonomi macOS, iPadOS, dan iOS (JSON)
- `apple://hig/liquid-glass` — Pedoman material Liquid Glass OS 26 / macOS Tahoe
- `apple://hig/ipados` — Kumpulan pedoman desain iPadOS 26
- `apple://hig/ios` — Kumpulan pedoman desain iOS 26
- `desktop://guidelines/macos-hig` — Pedoman arsitektur desktop macOS
- `desktop://geometry/zero-shift` — Formula matematika Zero-Shift Sidebar

---

## 🚀 Instalasi & Konfigurasi

### Build & Menjalankan Server

```bash
npm install
npm run build
npm start
```

### Konfigurasi di Antigravity / Claude Desktop (`mcp_config.json`)

```json
{
  "mcpServers": {
    "apple-style-mcp": {
      "command": "node",
      "args": ["/path/to/apple-style-mcp/dist/index.js"]
    }
  }
}
```

---

## 🧪 Verifikasi Kualitas (Typecheck, Lint, Format, Test & Coverage)

```bash
npm run verify
```
