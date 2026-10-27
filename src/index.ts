#!/usr/bin/env node
/**
 * @file index.ts
 * @description Entry point CLI untuk Apple Style MCP Server (@ahmad/apple-style-mcp).
 *
 * Tanggung Jawab:
 * - Menjalankan MCP server melalui stdio transport resmi.
 */

import { startStdioServer } from "./server.ts";

startStdioServer();
