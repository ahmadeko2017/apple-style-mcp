/**
 * @file pattern-comparisons.ts
 * @description Matriks perbandingan pola antarmuka Apple HIG lintas macOS, iPadOS, dan iOS.
 *
 * Tanggung Jawab:
 * - Memetakan bagaimana satu pola UI (navigasi, modal, aksi konteks, notifikasi, safe area,
 *   tipografi) diterjemahkan secara idiomatik ke macOS, iPadOS, dan iOS.
 */

import { InvalidArgumentError } from "../core/errors.ts";

export const COMPARISON_PATTERNS = [
  "navigation",
  "modality",
  "context_actions",
  "notifications",
  "window_and_safe_area",
  "typography_and_ergonomics",
] as const;

export type ComparisonPatternId = (typeof COMPARISON_PATTERNS)[number];

export interface PlatformPatternSpec {
  readonly primaryComponent: string;
  readonly geometryAndMetrics: string;
  readonly interactionBehavior: string;
  readonly cssAndCodeGuidelines: string;
}

export interface PatternComparisonMatrix {
  readonly pattern: ComparisonPatternId;
  readonly summary: string;
  readonly macos: PlatformPatternSpec;
  readonly ipados: PlatformPatternSpec;
  readonly ios: PlatformPatternSpec;
  readonly adaptiveStrategy: string;
}

const PATTERN_CATALOG: Record<ComparisonPatternId, PatternComparisonMatrix> = {
  navigation: {
    pattern: "navigation",
    summary: "Perbandingan struktur navigasi utama antara Desktop, Tablet Split View, dan Mobile.",
    macos: {
      primaryComponent: "Zero-Shift Collapsible Sidebar + Adaptive Titlebar + Command Palette (⌘K)",
      geometryAndMetrics: "Sidebar width: 63px (collapsed) / 220px (expanded), Titlebar: 38px",
      interactionBehavior: "Klik pointer + shortcut ⌘K; koordinat X ikon terkunci di 21px",
      cssAndCodeGuidelines: "Gunakan justify-content: flex-start dan padding-left: 9px konstan",
    },
    ipados: {
      primaryComponent: "Adaptive Split View (2/3 Kolom) + Morphing Sidebar / Floating Tab Bar",
      geometryAndMetrics: "Sidebar: 320px pada Regular width (>=768px), Tab Bar: 49px pada Compact",
      interactionBehavior:
        "Otomatis morph dari Sidebar ke Floating Liquid Glass Tab Bar saat Slide Over",
      cssAndCodeGuidelines: "Gunakan media query (min-width: 768px) untuk peralihan Split View",
    },
    ios: {
      primaryComponent: "Liquid Glass Floating Tab Bar + Large Title Navigation Bar",
      geometryAndMetrics:
        "Tab Bar: 49px + safe-area-bottom, Nav Bar: 44px (collapsed) / 96px (large)",
      interactionBehavior: "Tab Bar menyusut saat scroll ke bawah; Large Title menyusut ke tengah",
      cssAndCodeGuidelines:
        "Terapkan padding-bottom: env(safe-area-inset-bottom) dan maksimal 5 tab",
    },
    adaptiveStrategy:
      "Gunakan komponen AdaptiveAppShell yang merender ZeroShiftSidebar di macOS, SplitView di iPadOS (>=768px), dan IosFloatingTabBar di layar compact (<768px).",
  },
  modality: {
    pattern: "modality",
    summary: "Perbandingan dialog modal, sheet, dan inspector panel lintas perangkat Apple.",
    macos: {
      primaryComponent: "Centered Glass Modal / Command Palette & Right Slide-Out Inspector Panel",
      geometryAndMetrics: "Modal width: 620px, Inspector width: 380px, border-radius: 16px",
      interactionBehavior: "Ditutup dengan tombol Esc atau klik backdrop; fokus terkunci di input",
      cssAndCodeGuidelines:
        "backdrop-filter: saturate(200%) blur(36px); tanpa shadow meluber keluar",
    },
    ipados: {
      primaryComponent: "Form Sheet Terpusat (540x620pt) atau Contextual Popover Tanpa Shadow",
      geometryAndMetrics: "Form Sheet: max-width 540px, height 620px, border-radius: 18px",
      interactionBehavior: "Mendukung swipe-down dismiss maupun tombol Esc pada hardware keyboard",
      cssAndCodeGuidelines: "Gunakan box-shadow: none pada popover; batasi dengan border 0.5px",
    },
    ios: {
      primaryComponent: "Bottom Sheet dengan Detents (Medium 50dvh & Large 92dvh) + Grabber",
      geometryAndMetrics: "Lebar: 100vw, tinggi: 50dvh / 92dvh, radius atas: 20px, grabber: 36x5px",
      interactionBehavior: "Tarik grabber untuk pindah detent atau swipe ke bawah untuk menutup",
      cssAndCodeGuidelines:
        "Gunakan height berbasis dvh dan padding-bottom: env(safe-area-inset-bottom)",
    },
    adaptiveStrategy:
      "Render BottomSheet pada layar sentuh compact (<768px) dan beralih ke Centered Sheet / Inspector Panel pada viewport >=768px.",
  },
  context_actions: {
    pattern: "context_actions",
    summary: "Perbandingan menu konteks dan aksi sekunder berdasarkan modalitas input.",
    macos: {
      primaryComponent: "Custom Native Context Menu + Disabled Browser Right-Click Guard",
      geometryAndMetrics: "Tinggi item: 26px, radius menu: 8px, padding: 4px",
      interactionBehavior:
        "Klik kanan mouse memunculkan menu konteks aplikasi (bukan menu browser)",
      cssAndCodeGuidelines: "Pasang setupContextMenuGuard() pada root aplikasi desktop",
    },
    ipados: {
      primaryComponent: "Long-Press Context Menu dengan Preview + Trackpad Secondary Click",
      geometryAndMetrics: "Min hit target: 44px per baris aksi, radius menu: 14px",
      interactionBehavior: "Long-press sentuh atau klik dua jari di trackpad + efek hover magnetik",
      cssAndCodeGuidelines: "Gunakan @media (hover: hover) and (pointer: fine) untuk efek pointer",
    },
    ios: {
      primaryComponent: "Haptic Touch Long-Press Menu + List Row Swipe Actions + Action Sheet",
      geometryAndMetrics: "Min hit target: 44x44px, tombol destruktif berwarna #ff453a / #ff3b30",
      interactionBehavior:
        "Geser baris ke kiri untuk aksi cepat (Hapus/Arsip) atau tahan untuk menu",
      cssAndCodeGuidelines: "Gunakan -webkit-user-select: none dan touch-action: pan-y pada baris",
    },
    adaptiveStrategy:
      "Sediakan tombol aksi eksplisit (...) sebagai fallback universal di semua platform selain gesture.",
  },
  notifications: {
    pattern: "notifications",
    summary: "Perbandingan posisi dan bentuk banner notifikasi in-app (Toast).",
    macos: {
      primaryComponent: "Top-Right macOS Notification Banner",
      geometryAndMetrics: "top: 48px, right: 16px, max-width: 360px, border-radius: 14px",
      interactionBehavior: "Muncul dari kanan atas di bawah titlebar; tombol close mikro 20px",
      cssAndCodeGuidelines:
        "Gunakan Liquid Glass background + border 1px solid var(--border-subtle)",
    },
    ipados: {
      primaryComponent: "Top-Center Floating Pill Banner",
      geometryAndMetrics:
        "top: calc(env(safe-area-inset-top) + 12px), max-width: 420px, radius: 9999px",
      interactionBehavior: "Turun dari atas tengah dan dapat di-swipe ke atas untuk dismiss",
      cssAndCodeGuidelines: "Gunakan position: fixed dan z-index di atas navigation bar",
    },
    ios: {
      primaryComponent: "Dynamic Island / Top Safe-Area Capsule Alert",
      geometryAndMetrics: "top: calc(env(safe-area-inset-top) + 8px), width: min(92vw, 380px)",
      interactionBehavior: "Auto-dismiss 4 detik atau swipe-up; tidak menutupi Tab Bar bawah",
      cssAndCodeGuidelines:
        "Hormati env(safe-area-inset-top) agar tidak bertabrakan dengan Dynamic Island",
    },
    adaptiveStrategy:
      "Posisikan banner di kanan atas pada macOS dan tengah atas (safe-area aware) pada iOS/iPadOS.",
  },
  window_and_safe_area: {
    pattern: "window_and_safe_area",
    summary: "Perbandingan manajemen bingkai jendela (window frame) dan safe area layar.",
    macos: {
      primaryComponent: "Frameless Transparent Tauri Window + Traffic Lights + 12px Rounded Canvas",
      geometryAndMetrics: "decorations: false, transparent: true, shadow: false, radius: 12px",
      interactionBehavior:
        "Drag via IPC start_dragging_window; double-click titlebar untuk maximize",
      cssAndCodeGuidelines: "Hilangkan border-radius menjadi 0 saat window dalam state maximized",
    },
    ipados: {
      primaryComponent: "Stage Manager Resizable Window + Safe Area Insets",
      geometryAndMetrics: "Viewport fleksibel (375px s/d 1366px), safe-area-top ~24px",
      interactionBehavior: "Mendukung semua orientasi dan multitasking Split View / Slide Over",
      cssAndCodeGuidelines:
        "Gunakan 100dvh dan hindari ukuran lebar pixel statis pada kontainer utama",
    },
    ios: {
      primaryComponent: "Edge-to-Edge Fullscreen Canvas (viewport-fit=cover) + Safe Area Provider",
      geometryAndMetrics: "Safe area atas (Dynamic Island ~59px), bawah (Home Indicator ~34px)",
      interactionBehavior:
        "Konten mengalir di balik bar Liquid Glass; kontrol tetap di dalam safe area",
      cssAndCodeGuidelines: "Wajib pasang viewport-fit=cover di index.html dan gunakan 100dvh",
    },
    adaptiveStrategy:
      "Aktifkan window frame Tauri hanya di desktop; di iOS/iPadOS gunakan SafeAreaProvider penuh.",
  },
  typography_and_ergonomics: {
    pattern: "typography_and_ergonomics",
    summary: "Perbandingan skala tipografi SF Pro, ukuran input, dan target sentuh.",
    macos: {
      primaryComponent: "Desktop Compact Typography & Pointer Ergonomics",
      geometryAndMetrics: "Body: 13px, Large Title: 26px, Min Hit Target: 28x28px",
      interactionBehavior: "Optimal untuk jarak pandang monitor desktop dan kursor presisi",
      cssAndCodeGuidelines: "Gunakan --font-size-body: 13px dan --min-hit-target: 28px",
    },
    ipados: {
      primaryComponent: "Dynamic Type Touch & Trackpad Hybrid Ergonomics",
      geometryAndMetrics: "Body: 17px, Large Title: 34px, Min Hit Target: 44x44px, Input >=16px",
      interactionBehavior: "Mendukung ketukan jari (44pt) sekaligus kursor trackpad magnetik",
      cssAndCodeGuidelines: "Pastikan font-size input >= 16px dan tombol minimal 44x44px",
    },
    ios: {
      primaryComponent: "Mobile Dynamic Type & Thumb-Zone Ergonomics",
      geometryAndMetrics: "Body: 17px, Large Title: 34px, Min Hit Target: 44x44px, Input >=16px",
      interactionBehavior: "Kontrol utama diletakkan di area jangkauan ibu jari (bawah layar)",
      cssAndCodeGuidelines:
        "Wajib font-size >= 16px pada input untuk mencegah auto-zoom WebKit iOS",
    },
    adaptiveStrategy:
      "Gunakan CSS variables dari get_design_tokens sesuai platform agar ukuran font dan hit target menyesuaikan otomatis.",
  },
};

/**
 * Mengambil matriks perbandingan lintas platform untuk suatu pola desain Apple HIG.
 *
 * @param {unknown} rawPattern - Nama pola yang ingin dibandingkan
 * @returns {PatternComparisonMatrix} Matriks perbandingan lengkap (macOS, iPadOS, iOS)
 * @throws {InvalidArgumentError} Jika nama pola tidak valid
 */
export function getPatternComparison(rawPattern: unknown): PatternComparisonMatrix {
  const normalized = String(rawPattern || "")
    .trim()
    .toLowerCase() as ComparisonPatternId;
  const matrix = PATTERN_CATALOG[normalized];
  if (!matrix) {
    throw new InvalidArgumentError(
      `Pola perbandingan tidak valid: "${String(rawPattern)}". Pilihan: ${COMPARISON_PATTERNS.join(", ")}.`,
      { providedPattern: rawPattern, validPatterns: COMPARISON_PATTERNS }
    );
  }
  return matrix;
}
