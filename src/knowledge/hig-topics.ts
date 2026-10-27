/**
 * @file hig-topics.ts
 * @description Basis pengetahuan (Knowledge Base) aturan Apple Human Interface Guidelines (HIG)
 *   untuk macOS, iPadOS, iOS, dan bahasa desain Liquid Glass.
 *
 * Tanggung Jawab:
 * - Menyimpan penjelasan teknis, formula matematika, dan pencegahan bug per topik HIG.
 * - Menyediakan fungsi lookup tervalidasi yang melempar InvalidArgumentError jika topik tidak dikenal.
 */

import { InvalidArgumentError } from "../core/errors.ts";
import type { ApplePlatform } from "../core/platform/types.ts";

export const HIG_TOPICS = [
  "zero_shift_geometry",
  "zero_shadow_popovers",
  "window_frame_canvas",
  "titlebar_controls",
  "spotlight_command_palette",
  "toast_banner",
  "liquid_glass_materials",
  "touch_and_hit_targets",
  "safe_area_and_viewport",
  "ipad_split_view_and_morphing",
  "ipad_pointer_and_stage_manager",
  "ios_floating_tab_bar",
  "ios_large_title_and_sheets",
] as const;

export type HigTopicId = (typeof HIG_TOPICS)[number];

export interface HigTopicEntry {
  readonly id: HigTopicId;
  readonly title: string;
  readonly platforms: readonly ApplePlatform[];
  readonly markdownContent: string;
}

const HIG_TOPIC_CATALOG: Record<HigTopicId, HigTopicEntry> = {
  zero_shift_geometry: {
    id: "zero_shift_geometry",
    title: "Formula Zero-Shift Geometry Sidebar (macOS & iPadOS)",
    platforms: ["macos", "ipados"],
    markdownContent: `# Formula Zero-Shift Geometry Sidebar
- Masalah: Ikon meloncat/bergeser saat expand/collapse jika menggunakan 'justify-content: center' pada mode collapsed.
- Solusi Baku:
  1. Kunci 'justify-content: flex-start' dan 'padding-left: 9px' secara konstan di kedua mode.
  2. Dimensi slot ikon tetap '20px x 20px; flex-shrink: 0'.
  3. Saat collapsed, tombol menyusut menjadi bujur sangkar '38px x 38px'. Ikon otomatis di tengah tombol: (38 - 20) / 2 = 9px.
  4. Koordinat X ikon selalu di '21px' (12px padding sidebar + 9px padding-left item) di kedua mode (Zero-Shift).
  5. Lebar sidebar collapsed adalah tepat '63px' (12px + 38px + 12px + 1px border), menghasilkan margin 12px identik di 4 sisi.`,
  },
  zero_shadow_popovers: {
    id: "zero_shadow_popovers",
    title: "Aturan Zero-Shadow Popovers, Dropdowns & Tooltips",
    platforms: ["macos", "ipados", "ios"],
    markdownContent: `# Aturan Zero-Shadow Popovers, Dropdowns & Tooltips
- Masalah: Bayangan luar ('box-shadow') pada menu dropdown atau tooltip akan meluber keluar batas lengkung jendela desktop 12px atau terpotong garis window chrome.
- Solusi Baku:
  1. Gunakan 'box-shadow: none !important;' pada semua popovers, dropdown, dan tooltips.
  2. Batas elemen melayang didefinisikan murni dengan 'border: 1px solid var(--border-subtle);' atau specular border Liquid Glass.
  3. Beri offset vertikal aman pada tooltip titlebar: 'top: calc(100% + 10px);' agar melayang di bawah garis titlebar 38px.`,
  },
  window_frame_canvas: {
    id: "window_frame_canvas",
    title: "Kanvas Transparan & Konten Solid (Anti-Artefak Hitam)",
    platforms: ["macos"],
    markdownContent: `# Kanvas Transparan & Konten Solid (Anti-Artefak Hitam)
- Konfigurasi 'tauri.conf.json':
  - "decorations": false
  - "transparent": true
  - "shadow": false (Mencegah injeksi border hitam 1px dari Windows DWM)
- CSS:
  - 'html, body, #root': 'background-color: transparent;'
  - '.desktop-window-container': Solid opaque 'background-color: var(--bg-app); border-radius: 12px; border: 1px solid var(--border-subtle);'
  - Saat maximized: 'border-radius: 0 !important; border: none !important;'`,
  },
  titlebar_controls: {
    id: "titlebar_controls",
    title: "Standar Titlebar & Action Controls (macOS)",
    platforms: ["macos"],
    markdownContent: `# Standar Titlebar & Action Controls
- Tinggi Titlebar Tetap: 38px ('--titlebar-height').
- Tinggi Tombol Aksi Seragam: 26px ('--titlebar-btn-height'). Dilarang mengandalkan auto-height agar tidak melonjak saat ganti tema.
- Traffic Lights: Diameter 12px, margin antar tombol 8px (🔴 #ff5f56, 🟡 #ffbd2e, 🟢 #27c93f). Micro-symbols (✕, −, ⤢) muncul saat hover.
- Drag Region: Gunakan '-webkit-app-region: drag' dan programmatic IPC 'start_dragging_window' saat 'onMouseDown'.`,
  },
  spotlight_command_palette: {
    id: "spotlight_command_palette",
    title: "Spotlight Command Palette (⌘K / Ctrl+K)",
    platforms: ["macos", "ipados"],
    markdownContent: `# Spotlight Command Palette (⌘K / Ctrl+K)
- Translucency: 'backdrop-filter: saturate(200%) blur(36px);'.
- Latar Belakang: Semi-transparan adaptif ('var(--glass-bg)').
- Lebar: 620px (mengecil ke 520px pada jendela < 860px).
- Shortcut: '⌘K' di macOS/iPadOS, 'Ctrl+K' di Windows.
- Navigasi: 'ArrowUp', 'ArrowDown', 'Enter' untuk eksekusi, 'Esc' untuk menutup.`,
  },
  toast_banner: {
    id: "toast_banner",
    title: "Apple Notification Banner (Toast)",
    platforms: ["macos", "ipados", "ios"],
    markdownContent: `# Apple Notification Banner (Toast)
- Posisi macOS: Kanan Atas ('top: 48px; right: 16px;'), melayang di bawah titlebar.
- Posisi iOS/iPadOS: Tengah Atas ('top: calc(var(--safe-area-top) + 12px); left: 50%; transform: translateX(-50%);') berbentuk kapsul/pill.
- Sudut Melengkung: 'border-radius: 14px;' (macOS) atau '9999px' pill (iOS) dengan 'backdrop-filter: saturate(200%) blur(24px);'.
- Squircle Icon Box: Ukuran 32px x 32px, radius 8px, latar belakang beropasitas 16% warna Apple System Tint.`,
  },
  liquid_glass_materials: {
    id: "liquid_glass_materials",
    title: "Aturan Material Liquid Glass (iOS 26, iPadOS 26, macOS Tahoe)",
    platforms: ["macos", "ipados", "ios"],
    markdownContent: `# Aturan Material Liquid Glass (iOS 26, iPadOS 26, macOS Tahoe)
- Aturan Hierarki Utama ("Navigation Layer Only"):
  1. Liquid Glass WAJIB dibatasi hanya pada layer navigasi dan kontrol melayang (Tab Bar, Sidebar, Toolbar, Command Palette, Bottom Sheet, Popover).
  2. DILARANG KERAS menerapkan Liquid Glass pada layer konten utama (tabel, kartu artikel, daftar panjang) agar hierarki visual tetap jernih.
- Komposisi CSS Liquid Glass:
  - 'background: var(--glass-bg);'
  - 'backdrop-filter: var(--glass-backdrop); -webkit-backdrop-filter: var(--glass-backdrop);'
  - 'border: 0.5px solid var(--glass-border);'
  - 'box-shadow: inset 0 1px 0 0 var(--border-specular);' (efek pantulan cahaya tepi kaca).`,
  },
  touch_and_hit_targets: {
    id: "touch_and_hit_targets",
    title: "Ergonomi Target Sentuh & Pointer Lintas Perangkat Apple",
    platforms: ["macos", "ipados", "ios"],
    markdownContent: `# Ergonomi Target Sentuh & Pointer Lintas Perangkat Apple
- Minimum Hit Target (Apple HIG):
  - iOS & iPadOS: Wajib minimal '44px x 44px' ('--min-hit-target: 44px') untuk semua kontrol interaktif sentuh.
  - macOS: Minimal '28px x 28px' untuk kontrol berbasis pointer presisi.
- Isolasi Hover pada Perangkat Sentuh:
  - Bungkus semua aturan ':hover' di dalam '@media (hover: hover) and (pointer: fine)' agar tidak menimbulkan sticky hover bug di iOS/iPadOS.
- Respons Sentuh Instan:
  - Gunakan '-webkit-tap-highlight-color: transparent;' dan 'touch-action: manipulation;' pada tombol mobile.`,
  },
  safe_area_and_viewport: {
    id: "safe_area_and_viewport",
    title: "Safe Area Insets, Viewport Cover, & Anti-Zoom Input (iOS/iPadOS)",
    platforms: ["ipados", "ios"],
    markdownContent: `# Safe Area Insets, Viewport Cover, & Anti-Zoom Input (iOS/iPadOS)
- Konfigurasi Meta Viewport:
  - Wajib menyertakan 'viewport-fit=cover' di '<meta name="viewport">' agar kanvas merender penuh di balik Dynamic Island dan Home Indicator.
- Penggunaan Safe Area Insets:
  - Gunakan 'env(safe-area-inset-top)', 'env(safe-area-inset-bottom)', 'env(safe-area-inset-left)', dan 'env(safe-area-inset-right)' pada padding bar navigasi dan kontainer.
- Tinggi Viewport Dinamis:
  - Gunakan '100dvh' (bukan '100vh') untuk mencegah layout terpotong saat keyboard virtual muncul.
- Pencegahan Auto-Zoom WebKit iOS:
  - Ukuran font pada '<input>', '<select>', dan '<textarea>' WAJIB minimal '16px' di iOS agar WebKit tidak melakukan zoom paksa saat fokus.`,
  },
  ipad_split_view_and_morphing: {
    id: "ipad_split_view_and_morphing",
    title: "iPadOS Split View (2/3 Kolom) & Adaptive Morphing Tab Bar",
    platforms: ["ipados"],
    markdownContent: `# iPadOS Split View (2/3 Kolom) & Adaptive Morphing Tab Bar
- Arsitektur Kolom iPadOS:
  - Regular Width (>= 768px): Gunakan Split View 2 kolom (Sidebar 320px + Primary Detail) atau 3 kolom (Sidebar + Content List + Detail).
  - Compact Width (< 768px / Slide Over): Sidebar otomatis bertransformasi (morph) menjadi Floating Liquid Glass Tab Bar atau Drawer tersembunyi.
- Transisi Adaptif:
  - Pertahankan state seleksi aktif saat pengguna mengubah ukuran jendela di Stage Manager.`,
  },
  ipad_pointer_and_stage_manager: {
    id: "ipad_pointer_and_stage_manager",
    title: "iPadOS Trackpad Pointer Hover & Stage Manager Multitasking",
    platforms: ["ipados"],
    markdownContent: `# iPadOS Trackpad Pointer Hover & Stage Manager Multitasking
- Efek Pointer Magnetik (Trackpad/Mouse iPad):
  - Sediakan highlight halus ('border-radius: 10px', transisi 'transform 0.15s ease') ketika pointer berada di atas tombol bar pada '@media (hover: hover) and (pointer: fine)'.
- Kesiapan Stage Manager:
  - Jangan mengunci orientasi layar; pastikan layout responsif dari lebar 375px (Slide Over) hingga 1366px (iPad Pro 13" Landscape).`,
  },
  ios_floating_tab_bar: {
    id: "ios_floating_tab_bar",
    title: "iOS 26 Liquid Glass Floating Tab Bar & Scroll Minimize",
    platforms: ["ios", "ipados"],
    markdownContent: `# iOS 26 Liquid Glass Floating Tab Bar & Scroll Minimize
- Geometri Floating Pill:
  - Tab Bar pada iOS 26 melayang sebagai kapsul Liquid Glass di atas konten dengan jarak bawah 'calc(env(safe-area-inset-bottom, 0px) + 12px)'.
- Perilaku Auto-Minimize Saat Scroll:
  - Ketika pengguna menggulir ke bawah, Tab Bar menyusut secara organik untuk memaksimalkan ruang baca, dan kembali mengembang saat scroll berhenti atau berbalik ke atas.
- Batasan Item:
  - Maksimal 5 tab utama dengan target sentuh masing-masing minimal 44x44pt.`,
  },
  ios_large_title_and_sheets: {
    id: "ios_large_title_and_sheets",
    title: "iOS Large Title Navigation Bar & Detent Bottom Sheets",
    platforms: ["ios", "ipados"],
    markdownContent: `# iOS Large Title Navigation Bar & Detent Bottom Sheets
- Large Title Navigation Bar:
  - Saat posisi scroll di puncak ('scrollTop === 0'), tampilkan judul besar '34px bold'.
  - Saat pengguna menggulir ke bawah, judul besar menyusut mulus menjadi judul tengah '17px semibold' di dalam bar Liquid Glass setinggi '44px'.
- Bottom Sheet dengan Detents:
  - Gunakan detents 'medium' (50dvh) dan 'large' (92dvh), dilengkapi indikator grabber ('36px x 5px', radius '9999px') di bagian tengah atas sheet.`,
  },
};

/**
 * Mengambil entri aturan Apple HIG berdasarkan topik dan memfilter opsional berdasarkan platform.
 *
 * @param {unknown} rawTopic - Nama topik aturan yang diminta
 * @param {ApplePlatform} [platform] - Filter platform opsional
 * @returns {string} Penjelasan teknis aturan HIG dalam format Markdown
 * @throws {InvalidArgumentError} Jika topik tidak ditemukan dalam katalog
 */
export function getHigRuleMarkdown(rawTopic: unknown, platform?: ApplePlatform): string {
  const normalizedTopic = String(rawTopic || "")
    .trim()
    .toLowerCase() as HigTopicId;
  const entry = HIG_TOPIC_CATALOG[normalizedTopic];
  if (!entry) {
    throw new InvalidArgumentError(
      `Topik tidak dikenal: "${String(rawTopic)}". Topik yang valid: ${HIG_TOPICS.join(", ")}.`,
      { providedTopic: rawTopic, validTopics: HIG_TOPICS }
    );
  }
  if (platform && !entry.platforms.includes(platform)) {
    return `> Catatan: Topik "${entry.id}" dirancang khusus untuk platform [${entry.platforms.join(", ")}], bukan "${platform}".\n\n${entry.markdownContent}`;
  }
  return entry.markdownContent;
}

/**
 * Mengambil seluruh entri HIG yang relevan untuk suatu platform.
 *
 * @param {ApplePlatform} platform - Platform target ('macos' | 'ipados' | 'ios')
 * @returns {readonly HigTopicEntry[]} Daftar entri HIG untuk platform tersebut
 */
export function listHigTopicsByPlatform(platform: ApplePlatform): readonly HigTopicEntry[] {
  return Object.values(HIG_TOPIC_CATALOG).filter((entry) => entry.platforms.includes(platform));
}
