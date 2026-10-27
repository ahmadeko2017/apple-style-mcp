/**
 * @file hig-rules.tool.ts
 * @description Tool untuk melihat aturan spesifik Apple HIG dan pedoman desktop Tauri v2.
 */

import type { McpTool, ToolInputSchema } from "../types.ts";

export class HigRulesTool implements McpTool {
  public readonly name = "get_apple_hig_rule";
  public readonly description =
    "Melihat penjelasan teknis, formula matematika, dan pencegahan bug untuk aturan desain desktop Apple HIG (zero_shift_geometry, zero_shadow_popovers, window_frame_canvas, titlebar_controls, spotlight_command_palette, toast_banner).";

  public readonly inputSchema: ToolInputSchema = {
    type: "object",
    properties: {
      topic: {
        type: "string",
        enum: [
          "zero_shift_geometry",
          "zero_shadow_popovers",
          "window_frame_canvas",
          "titlebar_controls",
          "spotlight_command_palette",
          "toast_banner",
        ],
        description: "Topik aturan yang ingin dipelajari",
      },
    },
    required: ["topic"],
  };

  public execute(args: Record<string, unknown>): string {
    const topic = String(args.topic || "").toLowerCase();

    switch (topic) {
      case "zero_shift_geometry":
        return `# Formula Zero-Shift Geometry Sidebar
- Masalah: Ikon meloncat/bergeser saat expand/collapse jika menggunakan 'justify-content: center' pada mode collapsed.
- Solusi Baku:
  1. Kunci 'justify-content: flex-start' dan 'padding-left: 9px' secara konstan di kedua mode.
  2. Dimensi slot ikon tetap '20px x 20px; flex-shrink: 0'.
  3. Saat collapsed, tombol menyusut menjadi bujur sangkar '38px x 38px'. Ikon otomatis di tengah tombol: (38 - 20) / 2 = 9px.
  4. Koordinat X ikon selalu di '21px' (12px padding sidebar + 9px padding-left item) di kedua mode (Zero-Shift).
  5. Lebar sidebar collapsed adalah tepat '63px' (12px + 38px + 12px + 1px border), menghasilkan margin 12px identik di 4 sisi.`;

      case "zero_shadow_popovers":
        return `# Aturan Zero-Shadow Popovers, Dropdowns & Tooltips
- Masalah: Bayangan luar ('box-shadow') pada menu dropdown atau tooltip akan meluber keluar batas lengkung jendela desktop 12px atau terpotong garis window chrome.
- Solusi Baku:
  1. Gunakan 'box-shadow: none !important;' pada semua popovers, dropdown, dan tooltips.
  2. Batas elemen melayang didefinisikan murni dengan 'border: 1px solid var(--border-subtle);'.
  3. Beri offset vertikal aman pada tooltip titlebar: 'top: calc(100% + 10px);' agar melayang di bawah garis titlebar 38px.`;

      case "window_frame_canvas":
        return `# Kanvas Transparan & Konten Solid (Anti-Artefak Hitam)
- Konfigurasi 'tauri.conf.json':
  - "decorations": false
  - "transparent": true
  - "shadow": false (Mencegah injeksi border hitam 1px dari Windows DWM)
- CSS:
  - 'html, body, #root': 'background-color: transparent;'
  - '.desktop-window-container': Solid opaque 'background-color: var(--bg-app); border-radius: 12px; border: 1px solid var(--border-subtle);'
  - Saat maximized: 'border-radius: 0 !important; border: none !important;'`;

      case "titlebar_controls":
        return `# Standar Titlebar & Action Controls
- Tinggi Titlebar Tetap: 38px ('--titlebar-height').
- Tinggi Tombol Aksi Seragam: 26px ('--titlebar-btn-height'). Dilarang mengandalkan auto-height agar tidak melonjak saat ganti tema.
- Traffic Lights: Diameter 12px, margin antar tombol 8px (🔴 #ff5f56, 🟡 #ffbd2e, 🟢 #27c93f). Micro-symbols (✕, −, ⤢) muncul saat hover.
- Drag Region: Gunakan '-webkit-app-region: drag' dan programmatic IPC 'start_dragging_window' saat 'onMouseDown'.`;

      case "spotlight_command_palette":
        return `# Spotlight Command Palette (⌘K / Ctrl+K)
- Translucency: 'backdrop-filter: saturate(190%) blur(36px);'.
- Latar Belakang: Semi-transparan adaptif ('rgba(255, 255, 255, 0.90)' di Light Mode, 'rgba(22, 27, 34, 0.90)' di Dark Mode).
- Lebar: 620px (mengecil ke 520px pada jendela < 860px).
- Shortcut: '⌘K' di macOS, 'Ctrl+K' di Windows.
- Navigasi: 'ArrowUp', 'ArrowDown', 'Enter' untuk eksekusi, 'Esc' untuk menutup.`;

      case "toast_banner":
        return `# macOS Notification Banner (Toast)
- Posisi: Wajib di Kanan Atas ('top: 48px; right: 16px;'), melayang di bawah titlebar.
- Sudut Melengkung: 'border-radius: 14px;' dengan 'backdrop-filter: saturate(190%) blur(24px);'.
- Squircle Icon Box: Ukuran 32px x 32px, radius 8px, latar belakang beropasitas 16% warna Apple System Tint.
- Tombol Close Mikro: Bulat 20px di sudut kanan atas banner notifikasi.`;

      default:
        return `Topik tidak dikenal: "${topic}". Topik yang valid: zero_shift_geometry, zero_shadow_popovers, window_frame_canvas, titlebar_controls, spotlight_command_palette, toast_banner.`;
    }
  }
}

export const higRulesTool = new HigRulesTool();
