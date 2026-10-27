/**
 * @file logger.ts
 * @description Structured JSON logger ke stderr dengan sanitasi PII dan redaksi path sensitif.
 *
 * Tanggung Jawab:
 * - Mencatat log dalam format JSON terstruktur ke stderr (agar tidak mencemari stdout MCP).
 * - Menyertakan trace_id, span_id, dan tenant_id secara otomatis pada setiap entri log.
 * - Melakukan masking otomatis terhadap PII (email, nomor kartu/PAN, JWT, NIK, nomor telepon,
 *   serta username pada path direktori pengguna).
 */

import crypto from "node:crypto";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface TelemetryContext {
  traceId?: string;
  spanId?: string;
  tenantId?: string;
}

export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  trace_id: string;
  span_id: string;
  tenant_id: string;
  metadata?: Record<string, unknown>;
}

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const JWT_PATTERN = /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g;
const CARD_PAN_PATTERN = /\b(?:\d[ -]*?){13,19}\b/g;
const WINDOWS_USER_PATH_PATTERN = /([A-Za-z]:\\Users\\)([^\\/]+)(\\)/g;
const UNIX_USER_PATH_PATTERN = /(\/(?:Users|home)\/)([^/]+)(\/)/g;
const SENSITIVE_KEY_PATTERN =
  /^(password|pin|cvv|token|secret|authorization|nik|phone|credit_card)$/i;

/**
 * Menyensor teks yang mengandung PII atau nama pengguna pada path direktori.
 *
 * @param {string} rawText - Teks asli sebelum sanitasi
 * @returns {string} Teks yang telah disanitasi dari PII
 *
 * @example
 * const safeText = sanitizeSensitiveText("User ahmad@paylabs.co.id di C:\\Users\\Paylabs\\app");
 */
export function sanitizeSensitiveText(rawText: string): string {
  return rawText
    .replace(JWT_PATTERN, "[REDACTED_TOKEN]")
    .replace(EMAIL_PATTERN, "[REDACTED_EMAIL]")
    .replace(CARD_PAN_PATTERN, "****-****-****-1234")
    .replace(WINDOWS_USER_PATH_PATTERN, "$1[REDACTED_USER]$3")
    .replace(UNIX_USER_PATH_PATTERN, "$1[REDACTED_USER]$3");
}

/**
 * Menyensor nilai metadata secara rekursif berdasarkan kunci sensitif dan pola PII.
 *
 * @param {unknown} rawValue - Nilai metadata yang akan disanitasi
 * @param {string} [fieldKey] - Nama properti dari nilai tersebut
 * @returns {unknown} Nilai yang telah aman dari kebocoran PII
 */
export function sanitizeMetadataValue(rawValue: unknown, fieldKey = ""): unknown {
  if (SENSITIVE_KEY_PATTERN.test(fieldKey)) {
    return "[REDACTED]";
  }
  if (typeof rawValue === "string") {
    return sanitizeSensitiveText(rawValue);
  }
  if (Array.isArray(rawValue)) {
    return rawValue.map((element) => sanitizeMetadataValue(element));
  }
  if (rawValue !== null && typeof rawValue === "object") {
    return sanitizeMetadataObject(rawValue as Record<string, unknown>);
  }
  return rawValue;
}

/**
 * Menyensor seluruh properti di dalam objek metadata.
 *
 * @param {Record<string, unknown>} rawRecord - Objek metadata asli
 * @returns {Record<string, unknown>} Objek metadata yang telah disanitasi
 */
function sanitizeMetadataObject(rawRecord: Record<string, unknown>): Record<string, unknown> {
  const sanitizedRecord: Record<string, unknown> = {};
  for (const [entryKey, entryValue] of Object.entries(rawRecord)) {
    sanitizedRecord[entryKey] = sanitizeMetadataValue(entryValue, entryKey);
  }
  return sanitizedRecord;
}

/**
 * Logger terstruktur yang menulis JSON satu baris ke stderr.
 */
export class StructuredLogger {
  private readonly serviceName: string;
  private readonly defaultTenantId: string;
  private readonly writer: (serializedLine: string) => void;

  /**
   * Membuat instance StructuredLogger.
   *
   * @param {string} [serviceName] - Nama layanan yang dicatat pada log
   * @param {string} [defaultTenantId] - Identitas tenant default
   * @param {(serializedLine: string) => void} [writer] - Fungsi penulis output (default: stderr)
   */
  constructor(
    serviceName = "apple-style-mcp",
    defaultTenantId = "default-tenant",
    writer: (serializedLine: string) => void = (line) => process.stderr.write(line + "\n")
  ) {
    this.serviceName = serviceName;
    this.defaultTenantId = defaultTenantId;
    this.writer = writer;
  }

  /**
   * Mencatat entri log dengan level tertentu dalam format JSON terstruktur.
   *
   * @param {LogLevel} level - Tingkat keparahan log
   * @param {string} message - Pesan utama log
   * @param {Record<string, unknown>} [metadata] - Data konteks tambahan
   * @param {TelemetryContext} [telemetry] - Konteks trace/span/tenant opsional
   * @returns {StructuredLogEntry} Entri log yang telah ditulis
   */
  public log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    telemetry?: TelemetryContext
  ): StructuredLogEntry {
    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message: sanitizeSensitiveText(message),
      trace_id: telemetry?.traceId || crypto.randomUUID(),
      span_id: telemetry?.spanId || crypto.randomBytes(8).toString("hex"),
      tenant_id: telemetry?.tenantId || this.defaultTenantId,
      ...(metadata ? { metadata: sanitizeMetadataObject(metadata) } : {}),
    };
    this.writer(JSON.stringify(entry));
    return entry;
  }

  /**
   * Mencatat log level info.
   *
   * @param {string} message - Pesan informasi
   * @param {Record<string, unknown>} [metadata] - Metadata tambahan
   * @param {TelemetryContext} [telemetry] - Konteks telemetri
   * @returns {StructuredLogEntry} Entri log yang ditulis
   */
  public info(
    message: string,
    metadata?: Record<string, unknown>,
    telemetry?: TelemetryContext
  ): StructuredLogEntry {
    return this.log("info", message, metadata, telemetry);
  }

  /**
   * Mencatat log level warn.
   *
   * @param {string} message - Pesan peringatan
   * @param {Record<string, unknown>} [metadata] - Metadata tambahan
   * @param {TelemetryContext} [telemetry] - Konteks telemetri
   * @returns {StructuredLogEntry} Entri log yang ditulis
   */
  public warn(
    message: string,
    metadata?: Record<string, unknown>,
    telemetry?: TelemetryContext
  ): StructuredLogEntry {
    return this.log("warn", message, metadata, telemetry);
  }

  /**
   * Mencatat log level error.
   *
   * @param {string} message - Pesan kesalahan
   * @param {Record<string, unknown>} [metadata] - Metadata kesalahan
   * @param {TelemetryContext} [telemetry] - Konteks telemetri
   * @returns {StructuredLogEntry} Entri log yang ditulis
   */
  public error(
    message: string,
    metadata?: Record<string, unknown>,
    telemetry?: TelemetryContext
  ): StructuredLogEntry {
    return this.log("error", message, metadata, telemetry);
  }
}

export const defaultLogger = new StructuredLogger();
