/**
 * @file registry.ts
 * @description Registry terpusat untuk mengelola McpTool dan McpResource.
 */

import type { McpTool, McpResource, ToolDefinition } from "./types.ts";

export class ToolRegistry {
  private readonly tools = new Map<string, McpTool>();
  private readonly resources = new Map<string, McpResource>();

  /**
   * Mendaftarkan satu atau banyak McpTool.
   */
  public registerTool(...newTools: McpTool[]): this {
    for (const tool of newTools) {
      this.tools.set(tool.name, tool);
    }
    return this;
  }

  /**
   * Mendaftarkan satu atau banyak McpResource.
   */
  public registerResource(...newResources: McpResource[]): this {
    for (const resource of newResources) {
      this.resources.set(resource.uri, resource);
    }
    return this;
  }

  /**
   * Mendapatkan daftar definisi tool untuk respon tools/list.
   */
  public listTools(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));
  }

  /**
   * Mendapatkan daftar resource untuk respon resources/list.
   */
  public listResources(): Array<{ uri: string; name: string; description?: string; mimeType?: string }> {
    return Array.from(this.resources.values()).map((r) => ({
      uri: r.uri,
      name: r.name,
      description: r.description,
      mimeType: r.mimeType,
    }));
  }

  /**
   * Mengeksekusi tool berdasarkan nama dan argumen.
   */
  public async executeTool(name: string, args: Record<string, unknown> = {}): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool "${name}" tidak ditemukan dalam registry`);
    }
    return await tool.execute(args);
  }

  /**
   * Membaca konten resource berdasarkan URI.
   */
  public async readResource(uri: string): Promise<string> {
    const resource = this.resources.get(uri);
    if (!resource) {
      throw new Error(`Resource "${uri}" tidak ditemukan dalam registry`);
    }
    return await resource.read();
  }

  /**
   * Mengambil tool berdasarkan nama.
   */
  public getTool(name: string): McpTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Mengambil resource berdasarkan URI.
   */
  public getResource(uri: string): McpResource | undefined {
    return this.resources.get(uri);
  }
}
