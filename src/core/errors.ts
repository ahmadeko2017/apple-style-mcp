/**
 * @file errors.ts
 * @description Definisi custom domain error classes untuk Apple Style MCP Server.
 *
 * Tanggung Jawab:
 * - Menyediakan hierarki error terstruktur dengan kode error spesifik domain.
 * - Memastikan setiap kegagalan validasi, pencarian tool/resource, dan keamanan file
 *   memiliki tipe error yang jelas dan mudah dilacak.
 */

/**
 * Kode error standar internal untuk domain Apple Style MCP.
 */
export type McpDomainErrorCode =
  | "INVALID_ARGUMENT"
  | "TOOL_NOT_FOUND"
  | "RESOURCE_NOT_FOUND"
  | "UNSAFE_PATH"
  | "FILE_SYSTEM_ERROR";

/**
 * Kelas dasar untuk seluruh error spesifik domain pada Apple Style MCP Server.
 */
export class AppleStyleMcpError extends Error {
  public readonly errorCode: McpDomainErrorCode;
  public readonly jsonRpcCode: number;
  public readonly contextDetails?: Record<string, unknown>;

  /**
   * Membuat instance AppleStyleMcpError baru.
   *
   * @param {string} message - Pesan deskriptif mengenai penyebab error
   * @param {McpDomainErrorCode} errorCode - Kode kategori error domain
   * @param {number} jsonRpcCode - Kode error standar JSON-RPC 2.0
   * @param {Record<string, unknown>} [contextDetails] - Metadata diagnostik tambahan
   */
  constructor(
    message: string,
    errorCode: McpDomainErrorCode,
    jsonRpcCode = -32603,
    contextDetails?: Record<string, unknown>
  ) {
    super(message);
    this.name = new.target.name;
    this.errorCode = errorCode;
    this.jsonRpcCode = jsonRpcCode;
    this.contextDetails = contextDetails;
  }
}

/**
 * Error yang dilempar ketika argumen input tool atau resource tidak valid.
 */
export class InvalidArgumentError extends AppleStyleMcpError {
  /**
   * Membuat instance InvalidArgumentError.
   *
   * @param {string} message - Penjelasan parameter yang tidak valid
   * @param {Record<string, unknown>} [contextDetails] - Detail field yang gagal divalidasi
   */
  constructor(message: string, contextDetails?: Record<string, unknown>) {
    super(message, "INVALID_ARGUMENT", -32602, contextDetails);
  }
}

/**
 * Error yang dilempar ketika tool yang diminta tidak terdaftar pada registry.
 */
export class ToolNotFoundError extends AppleStyleMcpError {
  /**
   * Membuat instance ToolNotFoundError.
   *
   * @param {string} toolName - Nama tool yang dicari
   */
  constructor(toolName: string) {
    super(`Tool "${toolName}" tidak ditemukan dalam registry`, "TOOL_NOT_FOUND", -32601, {
      toolName,
    });
  }
}

/**
 * Error yang dilempar ketika URI resource yang diminta tidak terdaftar pada registry.
 */
export class ResourceNotFoundError extends AppleStyleMcpError {
  /**
   * Membuat instance ResourceNotFoundError.
   *
   * @param {string} resourceUri - URI resource yang dicari
   */
  constructor(resourceUri: string) {
    super(
      `Resource "${resourceUri}" tidak ditemukan dalam registry`,
      "RESOURCE_NOT_FOUND",
      -32602,
      { resourceUri }
    );
  }
}

/**
 * Error yang dilempar ketika operasi file melanggar batas keamanan path atau perlindungan overwrite.
 */
export class UnsafePathError extends AppleStyleMcpError {
  /**
   * Membuat instance UnsafePathError.
   *
   * @param {string} message - Alasan penolakan path
   * @param {Record<string, unknown>} [contextDetails] - Konteks path yang ditolak
   */
  constructor(message: string, contextDetails?: Record<string, unknown>) {
    super(message, "UNSAFE_PATH", -32602, contextDetails);
  }
}
