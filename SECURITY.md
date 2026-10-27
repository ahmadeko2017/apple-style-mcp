# Kebijakan Keamanan (Security Policy)

## Versi yang Didukung

| Versi   | Status Dukungan Keamanan                                 |
| :------ | :------------------------------------------------------- |
| `2.0.x` | ✅ Didukung penuh                                        |
| `1.0.x` | ⚠️ Maintenance terbatas (disarankan upgrade ke `v2.0.0`) |

---

## 🛡️ Fitur Keamanan Arsitektur Bawaan

`apple-style-mcp` dirancang dengan pendekatan _security-by-default_ untuk penggunaan bersama AI Coding Agents:

1. **Safe File System (`src/core/fs/safe-fs.ts`)**:
   - Mencegah _path traversal_ dan karakter _null byte_ ilegal (`\0`).
   - Menolak penulisan langsung ke direktori root sistem operasi.
   - Mengabaikan _symbolic links_ saat memindai proyek guna mencegah _infinite loop_ atau pembacaan file di luar proyek.
   - Membatasi kedalaman rekursi direktori (`maxDepth: 6`) dan ukuran file maksimum (`512 KB`) untuk mencegah serangan _Denial of Service_ (kehabisan memori).
   - Melindungi file pengguna dengan aturan default `overwrite: false` dan dukungan mode pratinjau `dry_run: true`.
2. **Sanitasi PII & Redaksi Path (`src/server/logger.ts`)**:
   - Seluruh log ditulis ke `stderr` dalam format JSON terstruktur dan secara otomatis menyensor alamat email, token JWT, nomor kartu/PAN, serta nama pengguna pada path direktori (`C:\Users\[REDACTED_USER]\...` atau `/Users/[REDACTED_USER]/...`).
3. **Analisis Statis Non-Destruktif**:
   - Mesin audit (`audit_apple_project`) melakukan analisis statis murni terhadap file konfigurasi dan stylesheet tanpa pernah mengeksekusi kode proyek target.

---

## 📬 Melaporkan Kerentanan

Jika Anda menemukan celah keamanan pada proyek ini, mohon jangan membuka publik issue secara langsung. Silakan laporkan melalui fitur **Report a vulnerability** (GitHub Private Vulnerability Reporting) pada tab **Security** di repositori ini.
