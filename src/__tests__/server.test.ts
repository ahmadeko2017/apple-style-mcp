/**
 * @file server.test.ts
 * @description Unit dan integration test komprehensif untuk @ahmad/apple-style-mcp v2.0.0
 *   mencakup macOS, iPadOS, iOS, Liquid Glass, SDK integration, logger PII masking,
 *   safe-fs, auto-detector, dan graceful shutdown (Pola AAA, 0 penggunaan tipe `any`).
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { detectProjectPlatforms, resolveTargetPlatforms } from "../audit/detector.ts";
import {
  AppleStyleMcpError,
  InvalidArgumentError,
  ResourceNotFoundError,
  ToolNotFoundError,
  UnsafePathError,
} from "../core/errors.ts";
import {
  assertFilesWritable,
  readTextFileSafely,
  resolveSafeTargetDirectory,
} from "../core/fs/safe-fs.ts";
import {
  getPlatformProfile,
  listAllPlatformProfiles,
  parseApplePlatform,
} from "../core/platform/profiles.ts";
import { ToolRegistry } from "../registry.ts";
import {
  createMcpSdkServer,
  defaultRegistry,
  handleJsonRpcMessage,
  processIncomingStdioLine,
  SERVER_NAME,
  SERVER_VERSION,
} from "../server.ts";
import { sanitizeSensitiveText, StructuredLogger } from "../server/logger.ts";
import { GracefulShutdownManager } from "../server/shutdown.ts";

interface InitializeResultPayload {
  protocolVersion: string;
  serverInfo: { name: string; version: string };
  capabilities: { tools?: Record<string, unknown>; resources?: Record<string, unknown> };
}

interface ToolsListResultPayload {
  tools: Array<{ name: string; description: string }>;
}

interface ToolCallResultPayload {
  isError?: boolean;
  content: Array<{ type: string; text: string }>;
}

interface ResourcesListResultPayload {
  resources: Array<{ uri: string; name: string }>;
}

interface ResourceReadResultPayload {
  contents: Array<{ uri: string; mimeType: string; text: string }>;
}

describe("Apple Style MCP Server v2.0.0 — Core & Multi-Platform Suite", () => {
  it("should_return_server_info_when_initialize_called", async () => {
    // Arrange
    const rpcRequest = {
      jsonrpc: "2.0" as const,
      id: 1,
      method: "initialize",
      params: {},
    };

    // Act
    const rpcResponse = await handleJsonRpcMessage(rpcRequest, defaultRegistry);

    // Assert
    expect(rpcResponse).toBeDefined();
    expect(rpcResponse?.id).toBe(1);
    const initPayload = rpcResponse?.result as InitializeResultPayload;
    expect(initPayload.serverInfo.name).toBe(SERVER_NAME);
    expect(initPayload.serverInfo.version).toBe(SERVER_VERSION);
    expect(initPayload.protocolVersion).toBe("2024-11-05");
    expect(initPayload.capabilities.tools).toBeDefined();
    expect(initPayload.capabilities.resources).toBeDefined();
  });

  it("should_return_null_when_notifications_initialized_or_idless_unknown_received", async () => {
    // Arrange & Act
    const notifRes = await handleJsonRpcMessage(
      { jsonrpc: "2.0", method: "notifications/initialized" },
      defaultRegistry
    );
    const unknownNoIdRes = await handleJsonRpcMessage(
      { jsonrpc: "2.0", method: "unknown/notification" },
      defaultRegistry
    );

    // Assert
    expect(notifRes).toBeNull();
    expect(unknownNoIdRes).toBeNull();
  });

  it("should_return_empty_object_when_ping_called_and_error_when_unknown_method_called", async () => {
    // Arrange & Act
    const pingRes = await handleJsonRpcMessage(
      { jsonrpc: "2.0", id: 99, method: "ping" },
      defaultRegistry
    );
    const unknownRes = await handleJsonRpcMessage(
      { jsonrpc: "2.0", id: 100, method: "unknown/method" },
      defaultRegistry
    );

    // Assert
    expect(pingRes?.result).toEqual({});
    expect(unknownRes?.error?.code).toBe(-32601);
  });

  it("should_register_both_v2_apple_tools_and_v1_compatibility_aliases", async () => {
    // Arrange
    const listRequest = {
      jsonrpc: "2.0" as const,
      id: 2,
      method: "tools/list",
    };

    // Act
    const rpcResponse = await handleJsonRpcMessage(listRequest, defaultRegistry);

    // Assert
    const listPayload = rpcResponse?.result as ToolsListResultPayload;
    const registeredToolNames = listPayload.tools.map((toolItem) => toolItem.name);
    expect(registeredToolNames).toContain("audit_apple_project");
    expect(registeredToolNames).toContain("scaffold_apple_component");
    expect(registeredToolNames).toContain("get_design_tokens");
    expect(registeredToolNames).toContain("scaffold_apple_app_template");
    expect(registeredToolNames).toContain("get_apple_hig_rule");
    expect(registeredToolNames).toContain("compare_platform_pattern");
    expect(registeredToolNames).toContain("audit_desktop_project");
    expect(registeredToolNames).toContain("scaffold_macos_component");
    expect(registeredToolNames).toContain("scaffold_base_app_template");
  });

  it("should_auto_detect_and_audit_multi_platform_project_for_macos_ipados_and_ios", async () => {
    // Arrange
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "apple-audit-test-"));
    fs.mkdirSync(path.join(tempDir, "src-tauri", "gen", "apple"), { recursive: true });
    fs.mkdirSync(path.join(tempDir, "src", "styles"), { recursive: true });
    fs.writeFileSync(
      path.join(tempDir, "src-tauri", "tauri.conf.json"),
      JSON.stringify({
        app: { windows: [{ decorations: false, transparent: true, shadow: false }] },
        bundle: { iOS: { minimumSystemVersion: "16.0" } },
      }),
      "utf-8"
    );
    fs.writeFileSync(
      path.join(tempDir, "index.html"),
      '<meta name="viewport" content="width=device-width, viewport-fit=cover" />',
      "utf-8"
    );
    fs.writeFileSync(
      path.join(tempDir, "src", "styles", "tokens.css"),
      `:root {
        --titlebar-btn-height: 26px;
        --shadow-dropdown: none;
        --min-hit-target: 44px;
        --font-size-body: 17px;
        --ipad-split-sidebar-width: 320px;
        padding-top: env(safe-area-inset-top);
        backdrop-filter: saturate(200%) blur(28px);
      }`,
      "utf-8"
    );
    fs.writeFileSync(
      path.join(tempDir, "src", "main.ts"),
      "window.addEventListener('contextmenu', (e) => e.preventDefault()); formatShortcut('Mod+K', 'macos');",
      "utf-8"
    );

    // Act: Call without explicit platforms to exercise auto-detector
    const rpcResponse = await handleJsonRpcMessage(
      {
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "audit_apple_project",
          arguments: { project_path: tempDir },
        },
      },
      defaultRegistry
    );
    fs.rmSync(tempDir, { recursive: true, force: true });

    // Assert
    const callPayload = rpcResponse?.result as ToolCallResultPayload;
    const parsedReport = JSON.parse(callPayload.content[0].text) as {
      complianceScore: string;
      platformScores: Record<string, string>;
      failedChecks: number;
    };
    expect(parsedReport.complianceScore).toBe("100%");
    expect(parsedReport.platformScores.macos).toBe("100%");
    expect(parsedReport.platformScores.ipados).toBe("100%");
    expect(parsedReport.platformScores.ios).toBe("100%");
    expect(parsedReport.failedChecks).toBe(0);
  });

  it("should_handle_missing_directory_and_malformed_tauri_config_during_audit", async () => {
    // Arrange
    const badDir = fs.mkdtempSync(path.join(os.tmpdir(), "apple-bad-audit-"));
    fs.mkdirSync(path.join(badDir, "src-tauri"), { recursive: true });
    fs.writeFileSync(path.join(badDir, "src-tauri", "tauri.conf.json"), "{ invalid json", "utf-8");

    // Act
    const missingDirRes = await handleJsonRpcMessage(
      {
        jsonrpc: "2.0",
        id: 30,
        method: "tools/call",
        params: {
          name: "audit_apple_project",
          arguments: { project_path: path.join(badDir, "does-not-exist") },
        },
      },
      defaultRegistry
    );
    const malformedConfRes = await handleJsonRpcMessage(
      {
        jsonrpc: "2.0",
        id: 31,
        method: "tools/call",
        params: {
          name: "audit_apple_project",
          arguments: { project_path: badDir, platforms: ["macos", "ios", "ipados"] },
        },
      },
      defaultRegistry
    );
    const noTauriConfDir = fs.mkdtempSync(path.join(os.tmpdir(), "apple-no-tauri-"));
    const noTauriRes = await handleJsonRpcMessage(
      {
        jsonrpc: "2.0",
        id: 32,
        method: "tools/call",
        params: {
          name: "audit_apple_project",
          arguments: { project_path: noTauriConfDir },
        },
      },
      defaultRegistry
    );

    fs.rmSync(badDir, { recursive: true, force: true });
    fs.rmSync(noTauriConfDir, { recursive: true, force: true });

    // Assert
    expect((missingDirRes?.result as ToolCallResultPayload).content[0].text).toContain(
      "tidak ditemukan"
    );
    expect((malformedConfRes?.result as ToolCallResultPayload).content[0].text).toContain(
      "Gagal mem-parse"
    );
    expect((noTauriRes?.result as ToolCallResultPayload).content[0].text).toContain(
      "tauri.conf.json existence"
    );
  });

  it("should_scaffold_macos_ipados_ios_and_shared_components_correctly", async () => {
    // Arrange
    const componentsToVerify = [
      { name: "mac_traffic_lights", expectedSymbol: "MacTrafficLights" },
      { name: "adaptive_titlebar", expectedSymbol: "AdaptiveTitlebar" },
      { name: "zero_shift_sidebar", expectedSymbol: "paddingLeft: 9" },
      { name: "command_palette", expectedSymbol: "ArrowDown" },
      { name: "toast_banner", expectedSymbol: "MacToastContainer" },
      { name: "inspector_panel", expectedSymbol: "MacDetailPanel" },
      { name: "context_menu_guard", expectedSymbol: "setupContextMenuGuard" },
      { name: "shortcut_formatter", expectedSymbol: "formatShortcut" },
      { name: "ipad_split_view", expectedSymbol: "IpadSplitView" },
      { name: "adaptive_sidebar_tabbar", expectedSymbol: "IpadAdaptiveSidebarTabBar" },
      { name: "ipad_popover", expectedSymbol: "IpadPopover" },
      { name: "pointer_hover_effect", expectedSymbol: "IpadPointerHoverButton" },
      { name: "ios_tab_bar", expectedSymbol: "IosFloatingTabBar" },
      { name: "ios_navigation_bar", expectedSymbol: "IosLargeTitleNavigationBar" },
      { name: "ios_bottom_sheet", expectedSymbol: "IosBottomSheet" },
      { name: "ios_inset_grouped_list", expectedSymbol: "IosInsetGroupedList" },
      { name: "ios_segmented_control", expectedSymbol: "IosSegmentedControl" },
      { name: "adaptive_app_shell", expectedSymbol: "AdaptiveAppShell" },
      { name: "platform_detector", expectedSymbol: "detectAppleEnvironment" },
      { name: "safe_area_provider", expectedSymbol: "SafeAreaProvider" },
      { name: "liquid_glass_surface", expectedSymbol: "LiquidGlassSurface" },
    ];

    for (const entry of componentsToVerify) {
      // Act
      const rpcResponse = await handleJsonRpcMessage(
        {
          jsonrpc: "2.0",
          id: 4,
          method: "tools/call",
          params: {
            name: "scaffold_apple_component",
            arguments: { component: entry.name, platform: "macos" },
          },
        },
        defaultRegistry
      );

      // Assert
      const callPayload = rpcResponse?.result as ToolCallResultPayload;
      expect(callPayload.isError).toBeUndefined();
      expect(callPayload.content[0].text).toContain(entry.expectedSymbol);
    }
  });

  it("should_return_design_tokens_in_css_json_ts_and_swift_for_all_platforms_and_eras", async () => {
    // Arrange & Act
    const cssRes = await handleJsonRpcMessage(
      {
        jsonrpc: "2.0",
        id: 6,
        method: "tools/call",
        params: {
          name: "get_design_tokens",
          arguments: {
            format: "css",
            platform: "ios",
            design_era: "classic",
            accent_primary: "#0284c7",
          },
        },
      },
      defaultRegistry
    );
    const jsonRes = await handleJsonRpcMessage(
      {
        jsonrpc: "2.0",
        id: 7,
        method: "tools/call",
        params: {
          name: "get_design_tokens",
          arguments: {
            format: "json",
            platform: "ipados",
            palette_mode: "brand_custom",
          },
        },
      },
      defaultRegistry
    );
    const swiftRes = await handleJsonRpcMessage(
      {
        jsonrpc: "2.0",
        id: 8,
        method: "tools/call",
        params: {
          name: "get_design_tokens",
          arguments: { format: "swift", platform: "macos" },
        },
      },
      defaultRegistry
    );
    const tsRes = await handleJsonRpcMessage(
      {
        jsonrpc: "2.0",
        id: 9,
        method: "tools/call",
        params: {
          name: "get_design_tokens",
          arguments: { format: "typescript" },
        },
      },
      defaultRegistry
    );

    // Assert
    const cssText = (cssRes?.result as ToolCallResultPayload).content[0].text;
    expect(cssText).toContain("--accent-primary: #0284c7;");
    expect(cssText).toContain("--min-hit-target: 44px;");

    const jsonText = (jsonRes?.result as ToolCallResultPayload).content[0].text;
    const jsonParsed = JSON.parse(jsonText) as {
      meta: { platform: string; paletteMode: string };
      dark: { accentPrimary: string };
    };
    expect(jsonParsed.meta.platform).toBe("ipados");
    expect(jsonParsed.dark.accentPrimary).toBe("#6366f1");

    const swiftText = (swiftRes?.result as ToolCallResultPayload).content[0].text;
    expect(swiftText).toContain("import SwiftUI");

    const tsText = (tsRes?.result as ToolCallResultPayload).content[0].text;
    expect(tsText).toContain("APPLE_STYLE_TOKENS");
  });

  it("should_scaffold_app_template_in_preview_and_disk_modes_with_overwrite_protection", async () => {
    // Arrange
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "apple-scaffold-test-"));
    const previewReq = {
      jsonrpc: "2.0" as const,
      id: 10,
      method: "tools/call",
      params: {
        name: "scaffold_apple_app_template",
        arguments: {
          app_name: "Preview App",
          identifier: "com.ahmad.preview",
        },
      },
    };
    const writeReq = {
      jsonrpc: "2.0" as const,
      id: 11,
      method: "tools/call",
      params: {
        name: "scaffold_apple_app_template",
        arguments: {
          app_name: "Awesome Apple Suite",
          identifier: "com.ahmad.suite",
          platforms: ["macos", "ipados", "ios"],
          accent_color: "#10b981",
          target_dir: tempDir,
          overwrite: false,
        },
      },
    };

    // Act
    const previewRes = await handleJsonRpcMessage(previewReq, defaultRegistry);
    const firstWriteRes = await handleJsonRpcMessage(writeReq, defaultRegistry);
    const secondWriteRes = await handleJsonRpcMessage(writeReq, defaultRegistry);
    fs.rmSync(tempDir, { recursive: true, force: true });

    // Assert
    const previewPayload = JSON.parse(
      (previewRes?.result as ToolCallResultPayload).content[0].text
    ) as { appName: string };
    expect(previewPayload.appName).toBe("Preview App");

    const firstPayload = JSON.parse(
      (firstWriteRes?.result as ToolCallResultPayload).content[0].text
    ) as { success: boolean; filesCreated: string[] };
    expect(firstPayload.success).toBe(true);
    expect(firstPayload.filesCreated.length).toBe(3);

    const secondPayload = secondWriteRes?.result as ToolCallResultPayload;
    expect(secondPayload.isError).toBe(true);
    expect(secondPayload.content[0].text).toContain("overwrite=false");
  });

  it("should_return_hig_rules_with_platform_note_and_compare_all_patterns", async () => {
    // Arrange & Act
    const higMismatchRes = await handleJsonRpcMessage(
      {
        jsonrpc: "2.0",
        id: 12,
        method: "tools/call",
        params: {
          name: "get_apple_hig_rule",
          arguments: { topic: "window_frame_canvas", platform: "ios" },
        },
      },
      defaultRegistry
    );
    const compareRes = await handleJsonRpcMessage(
      {
        jsonrpc: "2.0",
        id: 13,
        method: "tools/call",
        params: {
          name: "compare_platform_pattern",
          arguments: { pattern: "modality" },
        },
      },
      defaultRegistry
    );

    // Assert
    const higText = (higMismatchRes?.result as ToolCallResultPayload).content[0].text;
    expect(higText).toContain("dirancang khusus untuk platform");

    const compareParsed = JSON.parse(
      (compareRes?.result as ToolCallResultPayload).content[0].text
    ) as { pattern: string };
    expect(compareParsed.pattern).toBe("modality");
  });

  it("should_list_and_read_all_apple_and_legacy_desktop_resources_and_handle_missing_uri", async () => {
    // Arrange
    const resourceUris = [
      "desktop://guidelines/macos-hig",
      "desktop://geometry/zero-shift",
      "apple://hig/overview",
      "apple://hig/liquid-glass",
      "apple://hig/ipados",
      "apple://hig/ios",
    ];

    // Act
    const listRes = await handleJsonRpcMessage(
      { jsonrpc: "2.0", id: 14, method: "resources/list" },
      defaultRegistry
    );
    for (const uri of resourceUris) {
      const readRes = await handleJsonRpcMessage(
        { jsonrpc: "2.0", id: 15, method: "resources/read", params: { uri } },
        defaultRegistry
      );
      const contents = (readRes?.result as ResourceReadResultPayload).contents;
      expect(contents[0].uri).toBe(uri);
      expect(contents[0].text.length).toBeGreaterThan(10);
    }
    const missingUriRes = await handleJsonRpcMessage(
      {
        jsonrpc: "2.0",
        id: 16,
        method: "resources/read",
        params: { uri: "apple://hig/unknown" },
      },
      defaultRegistry
    );

    // Assert
    const resources = (listRes?.result as ResourcesListResultPayload).resources;
    expect(resources.length).toBe(6);
    expect(missingUriRes?.error?.code).toBe(-32602);
  });

  it("should_return_isError_true_for_invalid_arguments_across_tools", async () => {
    // Arrange & Act
    const invalidFormatRes = await handleJsonRpcMessage(
      {
        jsonrpc: "2.0",
        id: 17,
        method: "tools/call",
        params: { name: "get_design_tokens", arguments: { format: "xml" } },
      },
      defaultRegistry
    );
    const invalidEraRes = await handleJsonRpcMessage(
      {
        jsonrpc: "2.0",
        id: 18,
        method: "tools/call",
        params: { name: "get_design_tokens", arguments: { design_era: "retro" } },
      },
      defaultRegistry
    );
    const invalidPaletteRes = await handleJsonRpcMessage(
      {
        jsonrpc: "2.0",
        id: 19,
        method: "tools/call",
        params: { name: "get_design_tokens", arguments: { palette_mode: "neon" } },
      },
      defaultRegistry
    );
    const invalidPatternRes = await handleJsonRpcMessage(
      {
        jsonrpc: "2.0",
        id: 20,
        method: "tools/call",
        params: { name: "compare_platform_pattern", arguments: { pattern: "unknown" } },
      },
      defaultRegistry
    );

    // Assert
    expect((invalidFormatRes?.result as ToolCallResultPayload).isError).toBe(true);
    expect((invalidEraRes?.result as ToolCallResultPayload).isError).toBe(true);
    expect((invalidPaletteRes?.result as ToolCallResultPayload).isError).toBe(true);
    expect((invalidPatternRes?.result as ToolCallResultPayload).isError).toBe(true);
  });

  it("should_mask_pii_and_support_all_log_levels_in_structured_logger", () => {
    // Arrange
    const capturedLines: string[] = [];
    const customLogger = new StructuredLogger("apple-style-mcp", "tenant-1", (line) => {
      capturedLines.push(line);
    });

    // Act
    const infoEntry = customLogger.info(
      "Audit oleh ahmad@example.com di C:\\Users\\SecretUser\\project",
      {
        token: "secret-jwt-value",
        tags: ["user@domain.id", 123],
        nested: { path: "/Users/SecretMacUser/app" },
      }
    );
    customLogger.warn("Peringatan", { pin: "123456" });
    customLogger.error("Kesalahan", { password: "secret" });

    // Assert
    expect(infoEntry.message).toContain("[REDACTED_EMAIL]");
    expect(infoEntry.message).toContain("C:\\Users\\[REDACTED_USER]\\project");
    expect(infoEntry.metadata?.token).toBe("[REDACTED]");
    expect(sanitizeSensitiveText("4532-1111-2222-3333")).toBe("****-****-****-1234");
    expect(capturedLines.length).toBe(3);
  });

  it("should_handle_drain_timeout_and_cleanup_errors_in_graceful_shutdown", async () => {
    // Arrange 1: Happy path drain
    let cleanExitCode = -1;
    const noopLogger = new StructuredLogger("test", "t1", () => {});
    const cleanManager = new GracefulShutdownManager({
      drainTimeoutMs: 500,
      logger: noopLogger,
      onExit: (code) => {
        cleanExitCode = code;
      },
    });
    expect(cleanManager.beginOperation()).toBe(true);
    expect(cleanManager.getInFlightCount()).toBe(1);
    setTimeout(() => cleanManager.endOperation(), 20);
    await cleanManager.initiateShutdown("SIGINT");
    expect(cleanManager.isShuttingDown()).toBe(true);
    expect(cleanManager.beginOperation()).toBe(false);
    expect(cleanExitCode).toBe(0);

    // Arrange 2: Timeout & cleanup failure
    let timeoutExitCode = -1;
    const manager = new GracefulShutdownManager({
      drainTimeoutMs: 40,
      logger: noopLogger,
      onExit: (code) => {
        timeoutExitCode = code;
      },
    });
    manager.registerCleanupTask(() => {
      throw new Error("Simulated cleanup failure");
    });

    // Act
    manager.beginOperation();
    await manager.initiateShutdown("SIGTERM");
    await manager.initiateShutdown("SIGTERM");

    // Assert
    expect(timeoutExitCode).toBe(1);
  });

  it("should_process_incoming_stdio_line_for_valid_and_invalid_json", async () => {
    // Arrange
    const noopLogger = new StructuredLogger("test", "t1", () => {});
    const shutdownManager = new GracefulShutdownManager({
      logger: noopLogger,
      onExit: () => {},
    });

    // Act & Assert: Empty line, invalid JSON, and valid JSON-RPC ping
    await processIncomingStdioLine("   ", defaultRegistry, shutdownManager, noopLogger);
    await processIncomingStdioLine("{broken json", defaultRegistry, shutdownManager, noopLogger);
    await processIncomingStdioLine(
      JSON.stringify({ jsonrpc: "2.0", id: 55, method: "ping" }),
      defaultRegistry,
      shutdownManager,
      noopLogger
    );
    expect(shutdownManager.getInFlightCount()).toBe(0);
  });

  it("should_validate_detector_errors_and_sdk_server_creation", () => {
    // Arrange & Act & Assert
    expect(listAllPlatformProfiles().length).toBe(3);
    expect(getPlatformProfile("ipados").minHitTargetPt).toBe(44);
    expect(parseApplePlatform("IOS")).toBe("ios");
    expect(() => parseApplePlatform("android")).toThrow(InvalidArgumentError);

    expect(resolveTargetPlatforms("ipados", process.cwd())).toEqual(["ipados"]);
    expect(detectProjectPlatforms(path.join(os.tmpdir(), "non-existent-dir-xyz"))).toEqual([
      "macos",
    ]);

    const customRegistry = new ToolRegistry();
    expect(customRegistry.getTool("none")).toBeUndefined();
    expect(() => resolveSafeTargetDirectory("bad\0path")).toThrow(UnsafePathError);
    expect(() => resolveSafeTargetDirectory(path.parse(process.cwd()).root)).toThrow(
      UnsafePathError
    );
    expect(readTextFileSafely("non-existent-file.txt")).toBeNull();
    expect(() => assertFilesWritable(["non-existent.txt"], false)).not.toThrow();
    expect(() => assertFilesWritable([path.resolve("package.json")], true)).not.toThrow();

    const sdkServer = createMcpSdkServer(defaultRegistry);
    expect(sdkServer).toBeDefined();

    const err = new AppleStyleMcpError("msg", "INVALID_ARGUMENT");
    const toolErr = new ToolNotFoundError("x");
    const resErr = new ResourceNotFoundError("uri://x");
    expect(err.errorCode).toBe("INVALID_ARGUMENT");
    expect(toolErr.jsonRpcCode).toBe(-32601);
    expect(resErr.jsonRpcCode).toBe(-32602);
  });
});
