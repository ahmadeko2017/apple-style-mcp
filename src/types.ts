/**
 * @file types.ts
 * @description Tipe dan interface untuk MCP Server Desktop Style (macOS Native & Cross-Platform).
 */

export interface ToolInputSchema {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  [key: string]: unknown;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
}

export interface McpTool {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: ToolInputSchema;
  execute(args: Record<string, unknown>): Promise<string> | string;
}

export interface McpResource {
  readonly uri: string;
  readonly name: string;
  readonly description?: string;
  readonly mimeType?: string;
  read(): Promise<string> | string;
}

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id?: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}
