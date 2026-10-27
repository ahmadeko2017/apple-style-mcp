/**
 * @file design-tokens.tool.ts
 * @description Tool untuk mengekstrak dan menghasilkan design tokens baku macOS native (CSS/JSON/TS).
 */

import type { McpTool, ToolInputSchema } from "../types.ts";

export class DesignTokensTool implements McpTool {
  public readonly name = "get_design_tokens";
  public readonly description =
    "Menyediakan design tokens standar macOS native (warna solid, dark/light mode, radius, typography SF Pro, zero-shadow, and chrome heights) dalam format CSS, JSON, atau TypeScript.";

  public readonly inputSchema: ToolInputSchema = {
    type: "object",
    properties: {
      format: {
        type: "string",
        enum: ["css", "json", "typescript"],
        description: "Format output yang diinginkan (default: css)",
      },
      accent_primary: {
        type: "string",
        description: "Warna aksen brand primer kustom (hex, contoh: #0284c7). Default: #6366f1",
      },
    },
    required: [],
  };

  public execute(args: Record<string, unknown>): string {
    const format = String(args.format || "css").toLowerCase();
    const accent = typeof args.accent_primary === "string" && args.accent_primary.startsWith("#")
      ? args.accent_primary
      : "#6366f1";

    if (format === "json") {
      return this.getJSONTokens(accent);
    }
    if (format === "typescript") {
      return this.getTSTokens(accent);
    }
    return this.getCSSTokens(accent);
  }

  private getCSSTokens(accent: string): string {
    return `:root {
  /* Dark Mode (Default Desktop Elegan) */
  --bg-app: #0d1117;
  --bg-surface-1: #161b22;
  --bg-surface-2: #21262d;
  --bg-surface-hover: rgba(255, 255, 255, 0.06);
  --bg-surface-active: rgba(255, 255, 255, 0.1);

  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-medium: rgba(255, 255, 255, 0.14);
  --border-focus: ${accent}99;

  --text-primary: #f0f6fc;
  --text-secondary: #9da7b3;
  --text-tertiary: #6e7681;

  --accent-primary: ${accent};
  --accent-primary-hover: ${accent};
  --accent-success: #22c55e;
  --accent-warning: #eab308;
  --accent-danger: #ef4444;

  /* Aturan Zero-Shadow untuk Frameless Windows */
  --shadow-window: 0 12px 32px rgba(0, 0, 0, 0.5);
  --shadow-dropdown: none;

  /* Radius Tokens */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-window: 12px;

  /* Chrome Heights */
  --titlebar-height: 38px;
  --titlebar-btn-height: 26px;
}

[data-theme="light"] {
  --bg-app: #f1f5f9;
  --bg-surface-1: #ffffff;
  --bg-surface-2: #e8ecf2;
  --bg-surface-hover: rgba(15, 23, 42, 0.05);

  --border-subtle: #cbd5e1;
  --border-medium: #94a3b8;

  --text-primary: #0f172a;
  --text-secondary: #334155;
  --text-tertiary: #64748b;

  --accent-primary: ${accent};
  --shadow-dropdown: none;
}`;
  }

  private getJSONTokens(accent: string): string {
    return JSON.stringify(
      {
        dark: {
          bgApp: "#0d1117",
          bgSurface1: "#161b22",
          bgSurface2: "#21262d",
          borderSubtle: "rgba(255, 255, 255, 0.08)",
          textPrimary: "#f0f6fc",
          textSecondary: "#9da7b3",
          accentPrimary: accent,
          shadowDropdown: "none",
        },
        light: {
          bgApp: "#f1f5f9",
          bgSurface1: "#ffffff",
          bgSurface2: "#e8ecf2",
          borderSubtle: "#cbd5e1",
          textPrimary: "#0f172a",
          textSecondary: "#334155",
          accentPrimary: accent,
          shadowDropdown: "none",
        },
        dimensions: {
          radiusWindow: "12px",
          titlebarHeight: "38px",
          titlebarBtnHeight: "26px",
          sidebarCollapsedWidth: "63px",
          sidebarExpandedWidth: "220px",
          sidebarPadding: "12px",
          sidebarIconPaddingLeft: "9px",
        },
      },
      null,
      2
    );
  }

  private getTSTokens(accent: string): string {
    return `export const DESKTOP_TOKENS = {
  colors: {
    accentPrimary: '${accent}',
    macClose: '#ff5f56',
    macMinimize: '#ffbd2e',
    macMaximize: '#27c93f',
  },
  geometry: {
    windowRadius: 12,
    titlebarHeight: 38,
    titlebarBtnHeight: 26,
    sidebarCollapsedWidth: 63,
    sidebarExpandedWidth: 220,
    sidebarPadding: 12,
    sidebarIconPaddingLeft: 9,
  },
} as const;`;
  }
}

export const designTokensTool = new DesignTokensTool();
