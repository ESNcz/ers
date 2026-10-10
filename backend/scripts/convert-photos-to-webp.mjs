/**
 * Convert existing photos to WebP and downscale them to the maximal dimensions used on upload.
 *
 * Safe to re-run - photos already stored as `.webp` are skipped.
 * For each photo: write new `.webp` file -> update DB row -> delete original file.
 *
 * Usage (in the backend container):
 *   docker compose exec backend node scripts/convert-photos-to-webp.mjs [--dry-run]
 *
 * Usage (locally, from `backend/`):
 *   node --env-file=.env scripts/convert-photos-to-webp.mjs [--dry-run]
 */
import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import sharp from "sharp";

// Keep in sync with `PhotoMaxDimension` in apps/api/src/modules/photo/photo.service.ts
const MAX_DIMENSION_BY_DIRECTORY = {
  user_photo: 512,
  event_photo: 1920,
};
const DEFAULT_MAX_DIMENSION = 1920;
const WEBP_QUALITY = 80;

const STORAGE_PATH = path.join(process.cwd(), "storage");
const isDryRun = process.argv.includes("--dry-run");

const client = new pg.Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

const formatSize = (bytes) => `${(bytes / 1024).toFixed(0)} kB`;

const main = async () => {
  await client.connect();
  const { rows } = await client.query(`SELECT id, filename FROM photo WHERE filename NOT LIKE '%.webp'`);

  console.log(`Storage: ${STORAGE_PATH}`);
  console.log(`Found ${rows.length} photo(s) to convert${isDryRun ? " (dry run)" : ""}`);

  const stats = { converted: 0, missing: 0, failed: 0, sizeBefore: 0, sizeAfter: 0 };

  for (const { id, filename } of rows) {
    const sourcePath = path.join(STORAGE_PATH, filename);
    const targetFilename = `${filename}.webp`;
    const targetPath = path.join(STORAGE_PATH, targetFilename);
    const directory = filename.split(/[/\\]/)[0];
    const maxDimension = MAX_DIMENSION_BY_DIRECTORY[directory] ?? DEFAULT_MAX_DIMENSION;

    let source;
    try {
      source = await fs.readFile(sourcePath);
    } catch {
      console.warn(`[missing] ${id} ${filename}`);
      stats.missing++;
      continue;
    }

    try {
      const webp = await sharp(source)
        .rotate() // Apply EXIF orientation, metadata is stripped on output
        .resize(maxDimension, maxDimension, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      if (!isDryRun) {
        await fs.writeFile(targetPath, webp);
        try {
          await client.query(`UPDATE photo SET filename = $1 WHERE id = $2`, [targetFilename, id]);
        } catch (error) {
          await fs.rm(targetPath, { force: true });
          throw error;
        }
        await fs.rm(sourcePath, { force: true });
      }

      stats.converted++;
      stats.sizeBefore += source.length;
      stats.sizeAfter += webp.length;
      console.log(`[ok] ${id} ${filename}: ${formatSize(source.length)} -> ${formatSize(webp.length)}`);
    } catch (error) {
      console.error(`[failed] ${id} ${filename}: ${error.message}`);
      stats.failed++;
    }
  }

  console.log(
    `\nConverted: ${stats.converted}, missing: ${stats.missing}, failed: ${stats.failed}` +
      `\nSize: ${formatSize(stats.sizeBefore)} -> ${formatSize(stats.sizeAfter)}`,
  );
  if (stats.failed > 0) process.exitCode = 1;
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
