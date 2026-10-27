/**
 * @file server.test.ts
 * @description Unit test untuk Desktop Style MCP Server dan seluruh tools-nya (Pola AAA).
 */

import { describe, it, expect } from "vitest";
import { handleJsonRpcMessage, defaultRegistry } from "../server.ts";
import path from "node:path";

describe("Desktop Style MCP Server", () => {
  it("should_return_server_info_when_initialize_called", async () => {
    // Arrange
    const request = {
      jsonrpc: "2.0" as const,
      id: 1,
      method: "initialize",
      params: {},
    };

    // Act
    const response = await handleJsonRpcMessage(request, defaultRegistry);

    // Assert
    expect(response).toBeDefined();
    expect(response?.id).toBe(1);
    const result = response?.result as any;
    expect(result?.serverInfo?.name).toBe("desktop-style-mcp");
    expect(result?.protocolVersion).toBe("2024-11-05");
    expect(result?.capabilities?.tools).toBeDefined();
    expect(result?.capabilities?.resources).toBeDefined();
  });

  it("should_return_registered_tools_when_tools_list_called", async () => {
    // Arrange
    const request = {
      jsonrpc: "2.0" as const,
      id: 2,
      method: "tools/list",
    };

    // Act
    const response = await handleJsonRpcMessage(request, defaultRegistry);

    // Assert
    const result = response?.result as any;
    expect(result?.tools).toBeDefined();
    expect(Array.isArray(result?.tools)).toBe(true);
    const toolNames = result.tools.map((t: any) => t.name);
    expect(toolNames).toContain("audit_desktop_project");
    expect(toolNames).toContain("scaffold_macos_component");
    expect(toolNames).toContain("get_design_tokens");
    expect(toolNames).toContain("scaffold_base_app_template");
    expect(toolNames).toContain("get_apple_hig_rule");
  });

  it("should_audit_desktop_project_successfully_and_return_score", async () => {
    // Arrange
    const request = {
      jsonrpc: "2.0" as const,
      id: 3,
      method: "tools/call",
      params: {
        name: "audit_desktop_project",
        arguments: {
          project_path: path.resolve(process.cwd()),
        },
      },
    };

    // Act
    const response = await handleJsonRpcMessage(request, defaultRegistry);

    // Assert
    const result = response?.result as any;
    expect(result?.content?.[0]?.type).toBe("text");
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.complianceScore).toBeDefined();
    expect(parsed.totalChecks).toBeGreaterThan(0);
    expect(parsed.audits.length).toBeGreaterThan(0);
  });

  it("should_scaffold_traffic_lights_component_when_requested", async () => {
    // Arrange
    const request = {
      jsonrpc: "2.0" as const,
      id: 4,
      method: "tools/call",
      params: {
        name: "scaffold_macos_component",
        arguments: {
          component: "mac_traffic_lights",
        },
      },
    };

    // Act
    const response = await handleJsonRpcMessage(request, defaultRegistry);

    // Assert
    const result = response?.result as any;
    const text = result?.content?.[0]?.text;
    expect(text).toContain("MacTrafficLights");
    expect(text).toContain("#ff5f56");
    expect(text).toContain("#ffbd2e");
    expect(text).toContain("#27c93f");
  });

  it("should_scaffold_zero_shift_sidebar_with_constant_padding_and_justify", async () => {
    // Arrange
    const request = {
      jsonrpc: "2.0" as const,
      id: 5,
      method: "tools/call",
      params: {
        name: "scaffold_macos_component",
        arguments: {
          component: "zero_shift_sidebar",
        },
      },
    };

    // Act
    const response = await handleJsonRpcMessage(request, defaultRegistry);

    // Assert
    const result = response?.result as any;
    const text = result?.content?.[0]?.text;
    expect(text).toContain("ZeroShiftSidebar");
    expect(text).toContain("paddingLeft: 9");
    expect(text).toContain("width: isCollapsed ? 63 : 220");
  });

  it("should_return_design_tokens_in_css_and_json_format", async () => {
    // Arrange
    const cssReq = {
      jsonrpc: "2.0" as const,
      id: 6,
      method: "tools/call",
      params: {
        name: "get_design_tokens",
        arguments: { format: "css", accent_primary: "#0284c7" },
      },
    };
    const jsonReq = {
      jsonrpc: "2.0" as const,
      id: 7,
      method: "tools/call",
      params: {
        name: "get_design_tokens",
        arguments: { format: "json", accent_primary: "#0284c7" },
      },
    };

    // Act
    const cssRes = await handleJsonRpcMessage(cssReq, defaultRegistry);
    const jsonRes = await handleJsonRpcMessage(jsonReq, defaultRegistry);

    // Assert
    const cssText = (cssRes?.result as any)?.content?.[0]?.text;
    expect(cssText).toContain("--accent-primary: #0284c7;");
    expect(cssText).toContain("--titlebar-btn-height: 26px;");

    const jsonText = (jsonRes?.result as any)?.content?.[0]?.text;
    const jsonParsed = JSON.parse(jsonText);
    expect(jsonParsed.dark.accentPrimary).toBe("#0284c7");
    expect(jsonParsed.dimensions.sidebarCollapsedWidth).toBe("63px");
  });

  it("should_scaffold_base_app_template_payload_correctly", async () => {
    // Arrange
    const request = {
      jsonrpc: "2.0" as const,
      id: 8,
      method: "tools/call",
      params: {
        name: "scaffold_base_app_template",
        arguments: {
          app_name: "Awesome Analytics",
          identifier: "com.awesome.analytics",
          accent_color: "#10b981",
        },
      },
    };

    // Act
    const response = await handleJsonRpcMessage(request, defaultRegistry);

    // Assert
    const result = response?.result as any;
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.appName).toBe("Awesome Analytics");
    expect(parsed.identifier).toBe("com.awesome.analytics");
    expect(parsed.files["src-tauri/tauri.conf.json"].app.windows[0].decorations).toBe(false);
    expect(parsed.files["src-tauri/tauri.conf.json"].app.windows[0].transparent).toBe(true);
    expect(parsed.files["src-tauri/tauri.conf.json"].app.windows[0].shadow).toBe(false);
  });

  it("should_return_apple_hig_rule_for_zero_shift_geometry", async () => {
    // Arrange
    const request = {
      jsonrpc: "2.0" as const,
      id: 9,
      method: "tools/call",
      params: {
        name: "get_apple_hig_rule",
        arguments: { topic: "zero_shift_geometry" },
      },
    };

    // Act
    const response = await handleJsonRpcMessage(request, defaultRegistry);

    // Assert
    const result = response?.result as any;
    const text = result?.content?.[0]?.text;
    expect(text).toContain("Formula Zero-Shift Geometry");
    expect(text).toContain("21px");
    expect(text).toContain("63px");
  });

  it("should_list_and_read_mcp_resources", async () => {
    // Arrange
    const listReq = {
      jsonrpc: "2.0" as const,
      id: 10,
      method: "resources/list",
    };
    const readReq = {
      jsonrpc: "2.0" as const,
      id: 11,
      method: "resources/read",
      params: { uri: "desktop://geometry/zero-shift" },
    };

    // Act
    const listRes = await handleJsonRpcMessage(listReq, defaultRegistry);
    const readRes = await handleJsonRpcMessage(readReq, defaultRegistry);

    // Assert
    const resources = (listRes?.result as any)?.resources;
    expect(resources.length).toBeGreaterThanOrEqual(2);

    const contents = (readRes?.result as any)?.contents;
    expect(contents?.[0]?.uri).toBe("desktop://geometry/zero-shift");
    expect(contents?.[0]?.text).toContain("FORMULA ZERO-SHIFT GEOMETRY");
  });

  it("should_return_error_for_unknown_tool", async () => {
    // Arrange
    const request = {
      jsonrpc: "2.0" as const,
      id: 12,
      method: "tools/call",
      params: { name: "non_existent_tool" },
    };

    // Act
    const response = await handleJsonRpcMessage(request, defaultRegistry);

    // Assert
    const result = response?.result as any;
    expect(result?.isError).toBe(true);
    expect(result?.content?.[0]?.text).toContain("tidak ditemukan");
  });
});
