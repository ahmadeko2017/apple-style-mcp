/**
 * @file registry.ts
 * @description Registry terpusat untuk mengelola pendaftaran dan eksekusi McpTool serta McpResource.
 *
 * Tanggung Jawab:
 * - Menyimpan koleksi McpTool dan McpResource secara terindeks.
 * - Mengeksekusi tool atau membaca resource dengan melempar domain error terstruktur
 *   (ToolNotFoundError / ResourceNotFoundError) apabila entitas tidak terdaftar.
 */

import { ResourceNotFoundError, ToolNotFoundError } from "./core/errors.ts";
import type { McpResource, McpTool, ToolDefinition } from "./types.ts";

/**
 * Registry untuk menyimpan dan mengeksekusi McpTool serta McpResource.
 */
export class ToolRegistry {
  private readonly tools = new Map<string, McpTool>();
  private readonly resources = new Map<string, McpResource>();

  /**
   * Mendaftarkan satu atau banyak McpTool ke dalam registry.
   *
   * @param {...McpTool[]} newTools - Daftar instance tool yang akan didaftarkan
   * @returns {this} Instance ToolRegistry untuk method chaining
   */
  public registerTool(...newTools: McpTool[]): this {
    for (const toolInstance of newTools) {
      this.tools.set(toolInstance.name, toolInstance);
    }
    return this;
  }

  /**
   * Mendaftarkan satu atau banyak McpResource ke dalam registry.
   *
   * @param {...McpResource[]} newResources - Daftar instance resource yang akan didaftarkan
   * @returns {this} Instance ToolRegistry untuk method chaining
   */
  public registerResource(...newResources: McpResource[]): this {
    for (const resourceInstance of newResources) {
      this.resources.set(resourceInstance.uri, resourceInstance);
    }
    return this;
  }

  /**
   * Mengambil daftar definisi seluruh tool untuk respon tools/list.
   *
   * @returns {ToolDefinition[]} Daftar metadata definisi tool
   */
  public listTools(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((toolInstance) => ({
      name: toolInstance.name,
      description: toolInstance.description,
      inputSchema: toolInstance.inputSchema,
    }));
  }

  /**
   * Mengambil daftar metadata seluruh resource untuk respon resources/list.
   *
   * @returns {Array<{ uri: string; name: string; description?: string; mimeType?: string }>} Daftar resource
   */
  public listResources(): Array<{
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
  }> {
    return Array.from(this.resources.values()).map((resourceInstance) => ({
      uri: resourceInstance.uri,
      name: resourceInstance.name,
      description: resourceInstance.description,
      mimeType: resourceInstance.mimeType,
    }));
  }

  /**
   * Mengeksekusi tool berdasarkan nama dan argumen yang diberikan.
   *
   * @param {string} name - Nama tool yang akan dieksekusi
   * @param {Record<string, unknown>} [args] - Argumen input untuk tool tersebut
   * @returns {Promise<string>} Output teks hasil eksekusi tool
   * @throws {ToolNotFoundError} Jika nama tool tidak ditemukan dalam registry
   */
  public async executeTool(name: string, args: Record<string, unknown> = {}): Promise<string> {
    const toolInstance = this.tools.get(name);
    if (!toolInstance) {
      throw new ToolNotFoundError(name);
    }
    return await toolInstance.execute(args);
  }

  /**
   * Membaca konten resource berdasarkan URI.
   *
   * @param {string} uri - URI resource yang diminta
   * @returns {Promise<string>} Konten teks dari resource
   * @throws {ResourceNotFoundError} Jika URI resource tidak terdaftar
   */
  public async readResource(uri: string): Promise<string> {
    const resourceInstance = this.resources.get(uri);
    if (!resourceInstance) {
      throw new ResourceNotFoundError(uri);
    }
    return await resourceInstance.read();
  }

  /**
   * Mengambil instance McpTool berdasarkan nama.
   *
   * @param {string} name - Nama tool
   * @returns {McpTool | undefined} Instance McpTool atau undefined
   */
  public getTool(name: string): McpTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Mengambil instance McpResource berdasarkan URI.
   *
   * @param {string} uri - URI resource
   * @returns {McpResource | undefined} Instance McpResource atau undefined
   */
  public getResource(uri: string): McpResource | undefined {
    return this.resources.get(uri);
  }
}
