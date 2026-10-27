/**
 * @file server.ts
 * @description Implementasi server MCP JSON-RPC 2.0 stdio stream untuk Desktop Style & Scaffolding.
 */

import readline from "node:readline";
import { ToolRegistry } from "./registry.ts";
import { desktopAuditTool } from "./tools/audit-desktop.tool.ts";
import { scaffoldComponentTool } from "./tools/scaffold-component.tool.ts";
import { designTokensTool } from "./tools/design-tokens.tool.ts";
import { baseAppScaffoldTool } from "./tools/base-app-scaffold.tool.ts";
import { higRulesTool } from "./tools/hig-rules.tool.ts";
import { macosHigResource, zeroShiftResource } from "./resources/guidelines.resource.ts";
import type { JsonRpcRequest, JsonRpcResponse } from "./types.ts";

export const SERVER_NAME = "desktop-style-mcp";
export const SERVER_VERSION = "1.0.0";

export const defaultRegistry = new ToolRegistry()
  .registerTool(
    desktopAuditTool,
    scaffoldComponentTool,
    designTokensTool,
    baseAppScaffoldTool,
    higRulesTool
  )
  .registerResource(macosHigResource, zeroShiftResource);

/**
 * Memproses satu request JSON-RPC 2.0 dan mengembalikan response.
 */
export async function handleJsonRpcMessage(
  request: JsonRpcRequest,
  registry: ToolRegistry = defaultRegistry
): Promise<JsonRpcResponse | null> {
  const { id, method, params } = request;

  switch (method) {
    case "initialize":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: {
            name: SERVER_NAME,
            version: SERVER_VERSION,
          },
          capabilities: {
            tools: {},
            resources: {},
          },
        },
      };

    case "notifications/initialized":
      // Notifikasi client tanpa balasan
      return null;

    case "tools/list":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          tools: registry.listTools(),
        },
      };

    case "tools/call": {
      const toolName = String(params?.name || "");
      const toolArgs = (params?.arguments as Record<string, unknown>) || {};
      try {
        const textResult = await registry.executeTool(toolName, toolArgs);
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: textResult,
              },
            ],
          },
        };
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        return {
          jsonrpc: "2.0",
          id,
          result: {
            isError: true,
            content: [
              {
                type: "text",
                text: `Error: ${errorMessage}`,
              },
            ],
          },
        };
      }
    }

    case "resources/list":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          resources: registry.listResources(),
        },
      };

    case "resources/read": {
      const uri = String(params?.uri || "");
      try {
        const textContent = await registry.readResource(uri);
        const resourceMeta = registry.getResource(uri);
        return {
          jsonrpc: "2.0",
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: resourceMeta?.mimeType || "text/plain",
                text: textContent,
              },
            ],
          },
        };
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32602,
            message: errorMessage,
          },
        };
      }
    }

    case "ping":
      return {
        jsonrpc: "2.0",
        id,
        result: {},
      };

    default:
      if (id !== undefined && id !== null) {
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: `Method "${method}" tidak didukung oleh ${SERVER_NAME}`,
          },
        };
      }
      return null;
  }
}

/**
 * Menjalankan server melalui stdio.
 */
export function startStdioServer(registry: ToolRegistry = defaultRegistry): void {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on("line", async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    try {
      const request = JSON.parse(trimmed) as JsonRpcRequest;
      const response = await handleJsonRpcMessage(request, registry);
      if (response) {
        process.stdout.write(JSON.stringify(response) + "\n");
      }
    } catch {
      const errorResp: JsonRpcResponse = {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: "Parse error: format JSON tidak valid",
        },
      };
      process.stdout.write(JSON.stringify(errorResp) + "\n");
    }
  });

  process.stderr.write(`[${SERVER_NAME}] Server v${SERVER_VERSION} berjalan pada stdio\n`);
}
