/**
 * @file server.ts
 * @description Implementasi server MCP untuk Apple Style (macOS, iPadOS, iOS) menggunakan
 *   @modelcontextprotocol/sdk dan JSON-RPC 2.0 handler terintegrasi dengan StructuredLogger
 *   serta GracefulShutdownManager.
 *
 * Tanggung Jawab:
 * - Mendaftarkan seluruh tool utama v2.0.0 dan alias kompatibilitas v1.0.0.
 * - Menyediakan instance Server resmi dari @modelcontextprotocol/sdk.
 * - Menyediakan fungsi handleJsonRpcMessage untuk pemrosesan pesan langsung dan pengujian.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import readline from "node:readline";
import { ToolRegistry } from "./registry.ts";
import { ALL_MCP_RESOURCES } from "./resources/guidelines.resource.ts";
import { defaultLogger, type StructuredLogger } from "./server/logger.ts";
import { GracefulShutdownManager } from "./server/shutdown.ts";
import { appleAuditTool, desktopAuditTool } from "./tools/audit-desktop.tool.ts";
import { appleAppScaffoldTool, baseAppScaffoldTool } from "./tools/base-app-scaffold.tool.ts";
import { comparePlatformPatternTool } from "./tools/compare-pattern.tool.ts";
import { designTokensTool } from "./tools/design-tokens.tool.ts";
import { higRulesTool } from "./tools/hig-rules.tool.ts";
import {
  scaffoldAppleComponentTool,
  scaffoldComponentTool,
} from "./tools/scaffold-component.tool.ts";
import type { JsonRpcRequest, JsonRpcResponse } from "./types.ts";

export const SERVER_NAME = "apple-style-mcp";
export const SERVER_VERSION = "2.0.0";

export const defaultRegistry = new ToolRegistry()
  .registerTool(
    appleAuditTool,
    scaffoldAppleComponentTool,
    designTokensTool,
    appleAppScaffoldTool,
    higRulesTool,
    comparePlatformPatternTool,
    desktopAuditTool,
    scaffoldComponentTool,
    baseAppScaffoldTool
  )
  .registerResource(...ALL_MCP_RESOURCES);

/**
 * Membangun instance Server resmi menggunakan @modelcontextprotocol/sdk.
 *
 * @param {ToolRegistry} [registry] - Instance ToolRegistry yang digunakan
 * @returns {Server} Instance MCP SDK Server yang telah terkonfigurasi
 */
export function createMcpSdkServer(registry: ToolRegistry = defaultRegistry): Server {
  const sdkServer = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {}, resources: {} } }
  );

  sdkServer.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: registry.listTools(),
  }));

  sdkServer.setRequestHandler(CallToolRequestSchema, async (req) => {
    const toolName = String(req.params.name || "");
    const toolArgs = (req.params.arguments as Record<string, unknown>) || {};
    try {
      const textOutput = await registry.executeTool(toolName, toolArgs);
      return { content: [{ type: "text", text: textOutput }] };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return { isError: true, content: [{ type: "text", text: `Error: ${errorMessage}` }] };
    }
  });

  sdkServer.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: registry.listResources(),
  }));

  sdkServer.setRequestHandler(ReadResourceRequestSchema, async (req) => {
    const uri = String(req.params.uri || "");
    const textContent = await registry.readResource(uri);
    const resourceMeta = registry.getResource(uri);
    return {
      contents: [{ uri, mimeType: resourceMeta?.mimeType || "text/plain", text: textContent }],
    };
  });

  return sdkServer;
}

/**
 * Memproses satu request JSON-RPC 2.0 dan mengembalikan objek response yang sesuai.
 *
 * @param {JsonRpcRequest} request - Payload request JSON-RPC 2.0
 * @param {ToolRegistry} [registry] - Instance ToolRegistry yang digunakan
 * @returns {Promise<JsonRpcResponse | null>} Objek response JSON-RPC atau null untuk notifikasi
 */
export async function handleJsonRpcMessage(
  request: JsonRpcRequest,
  registry: ToolRegistry = defaultRegistry
): Promise<JsonRpcResponse | null> {
  const { id, method, params } = request;

  switch (method) {
    case "initialize":
      return createInitializeResponse(id);
    case "notifications/initialized":
      return null;
    case "tools/list":
      return { jsonrpc: "2.0", id, result: { tools: registry.listTools() } };
    case "tools/call":
      return await executeToolCallRpc(id, params, registry);
    case "resources/list":
      return { jsonrpc: "2.0", id, result: { resources: registry.listResources() } };
    case "resources/read":
      return await executeResourceReadRpc(id, params, registry);
    case "ping":
      return { jsonrpc: "2.0", id, result: {} };
    default:
      return createUnsupportedMethodResponse(id, method);
  }
}

/**
 * Membuat response JSON-RPC untuk method initialize.
 *
 * @param {string | number | null | undefined} id - ID request JSON-RPC
 * @returns {JsonRpcResponse} Response initialize standar MCP
 */
function createInitializeResponse(id: string | number | null | undefined): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id,
    result: {
      protocolVersion: "2024-11-05",
      serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
      capabilities: { tools: {}, resources: {} },
    },
  };
}

/**
 * Mengeksekusi pemanggilan tools/call melalui JSON-RPC.
 *
 * @param {string | number | null | undefined} id - ID request
 * @param {Record<string, unknown> | undefined} params - Parameter pemanggilan tool
 * @param {ToolRegistry} registry - Instance registry
 * @returns {Promise<JsonRpcResponse>} Response hasil eksekusi tool
 */
async function executeToolCallRpc(
  id: string | number | null | undefined,
  params: Record<string, unknown> | undefined,
  registry: ToolRegistry
): Promise<JsonRpcResponse> {
  const toolName = String(params?.name || "");
  const toolArgs = (params?.arguments as Record<string, unknown>) || {};
  try {
    const textOutput = await registry.executeTool(toolName, toolArgs);
    return {
      jsonrpc: "2.0",
      id,
      result: { content: [{ type: "text", text: textOutput }] },
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      jsonrpc: "2.0",
      id,
      result: { isError: true, content: [{ type: "text", text: `Error: ${errorMessage}` }] },
    };
  }
}

/**
 * Mengeksekusi pembacaan resources/read melalui JSON-RPC.
 *
 * @param {string | number | null | undefined} id - ID request
 * @param {Record<string, unknown> | undefined} params - Parameter URI resource
 * @param {ToolRegistry} registry - Instance registry
 * @returns {Promise<JsonRpcResponse>} Response isi resource atau error
 */
async function executeResourceReadRpc(
  id: string | number | null | undefined,
  params: Record<string, unknown> | undefined,
  registry: ToolRegistry
): Promise<JsonRpcResponse> {
  const uri = String(params?.uri || "");
  try {
    const textContent = await registry.readResource(uri);
    const resourceMeta = registry.getResource(uri);
    return {
      jsonrpc: "2.0",
      id,
      result: {
        contents: [{ uri, mimeType: resourceMeta?.mimeType || "text/plain", text: textContent }],
      },
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return { jsonrpc: "2.0", id, error: { code: -32602, message: errorMessage } };
  }
}

/**
 * Membuat response error ketika method JSON-RPC tidak dikenali.
 *
 * @param {string | number | null | undefined} id - ID request
 * @param {string} method - Nama method yang dipanggil
 * @returns {JsonRpcResponse | null} Objek error JSON-RPC atau null jika tanpa ID
 */
function createUnsupportedMethodResponse(
  id: string | number | null | undefined,
  method: string
): JsonRpcResponse | null {
  if (id === undefined || id === null) {
    return null;
  }
  return {
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method "${method}" tidak didukung oleh ${SERVER_NAME}` },
  };
}

/**
 * Menjalankan server menggunakan StdioServerTransport resmi dari @modelcontextprotocol/sdk.
 *
 * @param {ToolRegistry} [registry] - Instance ToolRegistry yang digunakan
 * @param {StructuredLogger} [logger] - Instance logger terstruktur
 * @returns {Promise<Server>} Instance MCP Server yang telah terhubung ke stdio
 */
export async function startSdkStdioServer(
  registry: ToolRegistry = defaultRegistry,
  logger: StructuredLogger = defaultLogger
): Promise<Server> {
  const sdkServer = createMcpSdkServer(registry);
  const transport = new StdioServerTransport();
  const shutdownManager = new GracefulShutdownManager({ logger });
  shutdownManager.registerCleanupTask(async () => {
    await sdkServer.close();
  });

  process.once("SIGTERM", () => void shutdownManager.initiateShutdown("SIGTERM"));
  process.once("SIGINT", () => void shutdownManager.initiateShutdown("SIGINT"));

  await sdkServer.connect(transport);
  logger.info("Apple Style MCP Server berjalan pada stdio via MCP SDK", {
    serverName: SERVER_NAME,
    version: SERVER_VERSION,
  });
  return sdkServer;
}

/**
 * Menjalankan server JSON-RPC baris-per-baris melalui readline stdio dengan pemisahan parse error
 * dan runtime error yang akurat.
 *
 * @param {ToolRegistry} [registry] - Instance ToolRegistry yang digunakan
 * @param {StructuredLogger} [logger] - Instance logger terstruktur
 */
export function startStdioServer(
  registry: ToolRegistry = defaultRegistry,
  logger: StructuredLogger = defaultLogger
): void {
  const shutdownManager = new GracefulShutdownManager({ logger });
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  shutdownManager.registerCleanupTask(() => readlineInterface.close());
  process.once("SIGTERM", () => void shutdownManager.initiateShutdown("SIGTERM"));
  process.once("SIGINT", () => void shutdownManager.initiateShutdown("SIGINT"));

  readlineInterface.on("line", (rawLine) => {
    void processIncomingStdioLine(rawLine, registry, shutdownManager, logger);
  });

  logger.info("Server berjalan pada stdio", { version: SERVER_VERSION });
}

/**
 * Mem-parse baris JSON-RPC atau menulis error -32700 ke stdout jika format JSON rusak.
 *
 * @param {string} trimmedLine - Baris teks yang telah di-trim
 * @param {StructuredLogger} logger - Logger terstruktur
 * @returns {JsonRpcRequest | null} Objek request atau null jika gagal parse
 */
function parseIncomingJsonLine(
  trimmedLine: string,
  logger: StructuredLogger
): JsonRpcRequest | null {
  try {
    return JSON.parse(trimmedLine) as JsonRpcRequest;
  } catch (parseErr: unknown) {
    logger.warn("Gagal mem-parse JSON dari stdin", {
      error: parseErr instanceof Error ? parseErr.message : String(parseErr),
    });
    process.stdout.write(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Parse error: format JSON tidak valid" },
      }) + "\n"
    );
    return null;
  }
}

/**
 * Memproses satu baris teks dari stdin dengan memisahkan error JSON.parse dan error eksekusi.
 *
 * @param {string} rawLine - Satu baris JSON-RPC dari stdin
 * @param {ToolRegistry} registry - Instance registry
 * @param {GracefulShutdownManager} shutdownManager - Manajer graceful shutdown
 * @param {StructuredLogger} logger - Logger terstruktur
 */
export async function processIncomingStdioLine(
  rawLine: string,
  registry: ToolRegistry,
  shutdownManager: GracefulShutdownManager,
  logger: StructuredLogger
): Promise<void> {
  const trimmed = rawLine.trim();
  if (!trimmed || !shutdownManager.beginOperation()) return;

  const parsedRequest = parseIncomingJsonLine(trimmed, logger);
  if (!parsedRequest) {
    shutdownManager.endOperation();
    return;
  }

  try {
    const rpcResponse = await handleJsonRpcMessage(parsedRequest, registry);
    if (rpcResponse) {
      process.stdout.write(JSON.stringify(rpcResponse) + "\n");
    }
  } catch (execErr: unknown) {
    const errMsg = execErr instanceof Error ? execErr.message : String(execErr);
    logger.error("Kegagalan internal saat memproses request JSON-RPC", { error: errMsg });
    process.stdout.write(
      JSON.stringify({
        jsonrpc: "2.0",
        id: parsedRequest.id ?? null,
        error: { code: -32603, message: `Internal error: ${errMsg}` },
      }) + "\n"
    );
  } finally {
    shutdownManager.endOperation();
  }
}
