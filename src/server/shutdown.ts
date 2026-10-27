/**
 * @file shutdown.ts
 * @description Manajer graceful shutdown untuk menangani SIGTERM/SIGINT dan request draining.
 *
 * Tanggung Jawab:
 * - Melacak jumlah request asinkron yang sedang berjalan (in-flight).
 * - Menangani sinyal terminasi dengan batas waktu connection draining (default 15 detik).
 * - Memastikan semua cleanup hook dieksekusi dengan aman sebelum proses berhenti.
 */

import type { StructuredLogger } from "./logger.ts";
import { defaultLogger } from "./logger.ts";

export type CleanupTask = () => Promise<void> | void;

export interface GracefulShutdownOptions {
  drainTimeoutMs?: number;
  logger?: StructuredLogger;
  onExit?: (exitCode: number) => void;
}

const DEFAULT_DRAIN_TIMEOUT_MS = 15_000;
const POLL_INTERVAL_MS = 25;

/**
 * Mengelola siklus hidup graceful shutdown dan pelacakan request in-flight.
 */
export class GracefulShutdownManager {
  private inFlightCount = 0;
  private shuttingDown = false;
  private readonly cleanupTasks: CleanupTask[] = [];
  private readonly drainTimeoutMs: number;
  private readonly logger: StructuredLogger;
  private readonly onExit: (exitCode: number) => void;

  /**
   * Membuat instance GracefulShutdownManager.
   *
   * @param {GracefulShutdownOptions} [options] - Konfigurasi timeout, logger, dan callback exit
   */
  constructor(options: GracefulShutdownOptions = {}) {
    this.drainTimeoutMs = options.drainTimeoutMs ?? DEFAULT_DRAIN_TIMEOUT_MS;
    this.logger = options.logger ?? defaultLogger;
    this.onExit = options.onExit ?? ((code) => process.exit(code));
  }

  /**
   * Mendaftarkan fungsi pembersihan resource yang akan dijalankan saat shutdown.
   *
   * @param {CleanupTask} task - Fungsi cleanup yang akan dieksekusi
   * @returns {this} Instance manajer untuk chaining
   */
  public registerCleanupTask(task: CleanupTask): this {
    this.cleanupTasks.push(task);
    return this;
  }

  /**
   * Menandai dimulainya satu operasi in-flight.
   *
   * @returns {boolean} True jika server masih menerima operasi, false jika sedang shutdown
   */
  public beginOperation(): boolean {
    if (this.shuttingDown) {
      return false;
    }
    this.inFlightCount += 1;
    return true;
  }

  /**
   * Menandai selesainya satu operasi in-flight.
   */
  public endOperation(): void {
    if (this.inFlightCount > 0) {
      this.inFlightCount -= 1;
    }
  }

  /**
   * Memeriksa apakah proses shutdown sedang berlangsung.
   *
   * @returns {boolean} Status shutdown saat ini
   */
  public isShuttingDown(): boolean {
    return this.shuttingDown;
  }

  /**
   * Mengambil jumlah operasi in-flight yang sedang aktif.
   *
   * @returns {number} Jumlah operasi aktif
   */
  public getInFlightCount(): number {
    return this.inFlightCount;
  }

  /**
   * Menjalankan proses graceful shutdown dengan menunggu request in-flight selesai.
   *
   * @param {string} signalName - Nama sinyal pemicu (misal: SIGTERM, SIGINT, STDIN_EOF)
   * @returns {Promise<void>} Promise yang selesai ketika proses shutdown tuntas
   */
  public async initiateShutdown(signalName: string): Promise<void> {
    if (this.shuttingDown) {
      return;
    }
    this.shuttingDown = true;
    this.logger.info("Memulai graceful shutdown", {
      signal: signalName,
      inFlightCount: this.inFlightCount,
      drainTimeoutMs: this.drainTimeoutMs,
    });

    const drainedCleanly = await this.waitForInFlightOperations();
    await this.runCleanupTasks();

    const exitCode = drainedCleanly ? 0 : 1;
    this.logger.info("Graceful shutdown selesai", { signal: signalName, exitCode });
    this.onExit(exitCode);
  }

  /**
   * Menunggu hingga seluruh operasi in-flight selesai atau batas waktu terlampaui.
   *
   * @returns {Promise<boolean>} True jika seluruh operasi selesai sebelum timeout
   */
  private async waitForInFlightOperations(): Promise<boolean> {
    const startTime = Date.now();
    while (this.inFlightCount > 0) {
      if (Date.now() - startTime >= this.drainTimeoutMs) {
        this.logger.warn("Batas waktu connection draining terlampaui", {
          remainingInFlight: this.inFlightCount,
        });
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
    return true;
  }

  /**
   * Mengeksekusi seluruh cleanup task yang telah terdaftar secara berurutan.
   */
  private async runCleanupTasks(): Promise<void> {
    for (const cleanupTask of this.cleanupTasks) {
      try {
        await cleanupTask();
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.error("Kegagalan saat menjalankan cleanup task", { error: errorMessage });
      }
    }
  }
}
