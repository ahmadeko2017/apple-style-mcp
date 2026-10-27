# Panduan Kontribusi (Contributing Guide)

Terima kasih atas minat Anda untuk berkontribusi pada **`@ahmad/apple-style-mcp`**! Dokumen ini menjelaskan standar kualitas kode, arsitektur, dan alur pengujian yang wajib dipenuhi sebelum mengajukan Pull Request.

---

## 🛠️ Prasyarat Lingkungan

- **Node.js**: `>= 22.12.0` (direkomendasikan Node.js 24 LTS)
- **npm**: `>= 10.0.0`

---

## 🚀 Setup Pengembangan Lokal

```bash
# 1. Clone repositori
git clone https://github.com/ahmadeko2017/apple-style-mcp.git
cd apple-style-mcp

# 2. Instal dependensi
npm install

# 3. Jalankan seluruh verifikasi kualitas
npm run verify
```

---

## 🏛️ Standar Kualitas Kode (Clean Code & SOLID)

Proyek ini menerapkan aturan rekayasa perangkat lunak yang ketat:

1. **Single Responsibility & Fungsi Ringkas**:
   - Setiap fungsi melakukan tepat satu tugas dan memiliki panjang **maksimal 30 baris**.
   - Kedalaman percabangan (_nesting_) maksimal 3 level (gunakan _early return pattern_).
2. **Strict TypeScript (Zero `any`)**:
   - Penggunaan tipe `any` dilarang keras (`@typescript-eslint/no-explicit-any: error`).
   - Seluruh argumen input dari luar wajib divalidasi dan melempar subclass dari `AppleStyleMcpError` (`InvalidArgumentError`, `UnsafePathError`, dll.).
3. **Dokumentasi JSDoc**:
   - Setiap file wajib memiliki `@file` dan `@description` pada bagian header.
   - Setiap fungsi/method publik wajib memiliki JSDoc lengkap (`@param`, `@returns`, `@throws`).
4. **Testing & Coverage**:
   - Setiap fitur atau aturan audit baru wajib disertai unit test di `src/__tests__/server.test.ts` dengan pola **AAA (Arrange-Act-Assert)** dan penamaan `should_[expected_behavior]_when_[condition]`.
   - Ambang batas coverage minimum: **Lines >= 85%**, **Functions >= 85%**, **Statements >= 85%**, **Branches >= 80%**.

---

## 📝 Konvensi Commit & Pull Request

Gunakan format **Conventional Commits**:

- `feat(tokens): add visionOS glass depth tokens`
- `fix(audit): handle custom css media query spacing`
- `docs(readme): add cursor mcp configuration snippet`
- `test(shutdown): verify sigterm draining timeout`

Pastikan perintah `npm run verify` lulus 100% tanpa error sebelum membuka Pull Request.
