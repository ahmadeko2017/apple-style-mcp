# 🖥️ Desktop Style MCP Server (`@paylabs/desktop-style-mcp`)

Model Context Protocol (MCP) server untuk mengawal kepatuhan desain antarmuka, geometri window, dan scaffolding otomatis aplikasi desktop native berbasis **macOS (Apple HIG)** dan **Tauri v2 + React TypeScript**.

---

## 🛠️ Kemampuan & Tools MCP

Server ini mengekspos 5 tools protokol MCP standar:

### 1. `audit_desktop_project`
Mengaudit direktori proyek desktop secara menyeluruh terhadap 9 standar emas:
- **Tauri Window Frame**: `decorations: false`, `transparent: true`, `shadow: false` (anti-border hitam Windows DWM).
- **CSS Visual Design**: Aturan `box-shadow: none !important;` pada popover/dropdown/tooltip (Zero-Shadow).
- **CSS Window Chrome**: Tinggi seragam tombol titlebar `26px` (`--titlebar-btn-height`).
- **CSS Material**: Translucency vibrancy `backdrop-filter: saturate(180%) blur(...)`.
- **CSS Sidebar Geometry**: Zero-Shift geometry (koordinat ikon terkunci di 21px, margin simetris 12px di 4 sisi).
- **Desktop Protection**: Penonaktifan klik kanan context menu browser (`setupContextMenuGuard`).
- **Keyboard Shortcuts**: Abstraksi token `Mod` untuk kompatibilitas `⌘` (macOS) vs `Ctrl` (Windows).

### 2. `scaffold_macos_component`
Menghasilkan kode komponen React + TypeScript produksi siap pakai:
- `mac_traffic_lights`: Traffic lights Apple HIG dengan simbol mikro SVG (✕, −, ⤢) saat di-hover.
- `adaptive_titlebar`: Titlebar 38px dengan traffic lights, window title, dan programmatic drag region IPC.
- `zero_shift_sidebar`: Collapsible sidebar dengan koordinat ikon terkunci di 21px (`width: 63px / 220px`).
- `command_palette`: Spotlight ⌘K modal dengan backdrop blur `blur(36px)` dan navigasi keyboard.
- `toast_banner`: macOS Sonoma style notification banner di kanan atas (*top-right*).
- `inspector_panel`: Slide-out panel detail dari kanan dengan scroll terisolasi.
- `context_menu_guard`: Utilitas pencegahan klik kanan browser native.
- `shortcut_formatter`: Utilitas pemformat shortcut `Mod+K` menjadi `⌘K` atau `Ctrl + K`.

### 3. `get_design_tokens`
Mengekstrak design tokens baku (warna solid, dark/light mode, radius, typography SF Pro, zero-shadow, and chrome heights) dalam format `css`, `json`, atau `typescript`.

### 4. `scaffold_base_app_template`
Membuat atau menghasilkan struktur konfigurasi awal (`tauri.conf.json` dan `tokens.css`) untuk proyek desktop baru dengan nama aplikasi, bundle identifier, dan warna aksen brand kustom.

### 5. `get_apple_hig_rule`
Lookup instan terhadap penjelasan teknis, formula matematika, dan pencegahan bug untuk topik:
`zero_shift_geometry`, `zero_shadow_popovers`, `window_frame_canvas`, `titlebar_controls`, `spotlight_command_palette`, `toast_banner`.

---

## 🚀 Menjalankan & Menggunakan Server

### Menjalankan Secara Lokal via TSX / NPX
```bash
npx -y tsx packages/desktop-style-mcp/src/index.ts
```

### Konfigurasi di Antigravity / Claude Desktop (`mcp_config.json`)
```json
{
  "mcpServers": {
    "desktop-style-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "tsx",
        "c:/project/PaylabsVA-Desktop-main/packages/desktop-style-mcp/src/index.ts"
      ]
    }
  }
}
```

---

## 🧪 Menjalankan Test Suite

```bash
bun run test packages/desktop-style-mcp/src/__tests__/server.test.ts
```
100% unit test passing dengan cakupan seluruh handler JSON-RPC 2.0 stdio dan tools.
