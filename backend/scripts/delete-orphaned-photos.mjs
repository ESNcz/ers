/**
 * Delete photos no longer used by any entity, and photo files without a DB row.
 *
 * Referencing columns are read from foreign keys to the `photo` table, so new relations are respected automatically.
 * Photos newer than GRACE_PERIOD_MS are kept - upload saves the photo before linking it to a user/event.
 *
 * Usage (in the backend container):
 *   docker compose exec backend node scripts/delete-orphaned-photos.mjs [--dry-run]
 *
 * Usage (locally, from any directory, reads `backend/.env`):
 *   node backend/scripts/delete-orphaned-photos.mjs [--dry-run]
 */
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";

// Keep in sync with directories used by `PhotoService.save`
const PHOTO_DIRECTORIES = ["user_photo", "event_photo"];
const GRACE_PERIOD_MS = 60 * 60 * 1000;

const BACKEND_PATH = path.join(import.meta.dirname, "..");
const ENV_PATH = path.join(BACKEND_PATH, ".env");
// Local run - in container the env comes from compose, existing variables are not overridden
if (existsSync(ENV_PATH)) process.loadEnvFile(ENV_PATH);

const STORAGE_PATH = path.join(BACKEND_PATH, "storage");
const isDryRun = process.argv.includes("--dry-run");

const client = new pg.Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

const quote = (identifier) => `"${identifier.replaceAll('"', '""')}"`;
// Stored filenames always use forward slashes
const toStoredFilename = (filePath) => path.relative(STORAGE_PATH, filePath).split(path.sep).join("/");

/**
 * Find all columns referencing `photo.id`
 */
const getPhotoReferences = async () => {
  const { rows } = await client.query(`
    SELECT ns.nspname AS schema, cl.relname AS table, att.attname AS column
    FROM pg_constraint con
    JOIN pg_class cl ON cl.oid = con.conrelid
    JOIN pg_namespace ns ON ns.oid = cl.relnamespace
    JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = con.conkey[1]
    WHERE con.contype = 'f' AND con.confrelid = 'photo'::regclass
  `);
  return rows;
};

const deleteOrphanedRows = async (stats) => {
  const references = await getPhotoReferences();
  console.log(`Photo referenced by: ${references.map((ref) => `${ref.table}.${ref.column}`).join(", ") || "nothing"}`);

  const notReferenced = references
    .map(
      (ref) =>
        `NOT EXISTS (SELECT 1 FROM ${quote(ref.schema)}.${quote(ref.table)} r WHERE r.${quote(ref.column)} = p.id)`,
    )
    .join(" AND ");

  const { rows } = await client.query(
    `SELECT p.id, p.filename FROM photo p
     WHERE p.created_at < $1 ${notReferenced ? `AND ${notReferenced}` : ""}`,
    [new Date(Date.now() - GRACE_PERIOD_MS)],
  );
  console.log(`\nFound ${rows.length} unused photo row(s)`);

  for (const { id, filename } of rows) {
    try {
      if (!isDryRun) {
        // Row first - if file deletion fails, the file is picked up as orphaned file on the next run
        await client.query(`DELETE FROM photo WHERE id = $1`, [id]);
        await fs.rm(path.join(STORAGE_PATH, filename), { force: true });
      }
      console.log(`[row] ${id} ${filename}`);
      stats.rows++;
    } catch (error) {
      console.error(`[failed] ${id} ${filename}: ${error.message}`);
      stats.failed++;
    }
  }
};

const deleteOrphanedFiles = async (stats) => {
  const { rows } = await client.query(`SELECT filename FROM photo`);
  const knownFilenames = new Set(rows.map((row) => row.filename));
  const cutoff = Date.now() - GRACE_PERIOD_MS;

  const orphanedFiles = [];
  for (const directory of PHOTO_DIRECTORIES) {
    const entries = await fs.readdir(path.join(STORAGE_PATH, directory), { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const filePath = path.join(STORAGE_PATH, directory, entry.name);
      if (knownFilenames.has(toStoredFilename(filePath))) continue;

      const { mtimeMs, size } = await fs.stat(filePath);
      if (mtimeMs < cutoff) orphanedFiles.push({ filePath, size });
    }
  }
  console.log(`\nFound ${orphanedFiles.length} file(s) without photo row`);

  for (const { filePath, size } of orphanedFiles) {
    try {
      if (!isDryRun) await fs.rm(filePath, { force: true });
      console.log(`[file] ${toStoredFilename(filePath)} (${(size / 1024).toFixed(0)} kB)`);
      stats.files++;
      stats.bytes += size;
    } catch (error) {
      console.error(`[failed] ${toStoredFilename(filePath)}: ${error.message}`);
      stats.failed++;
    }
  }
};

const main = async () => {
  const missingEnv = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASS"].filter((name) => !process.env[name]);
  if (missingEnv.length > 0) throw new Error(`Missing environment variables: ${missingEnv.join(", ")}`);

  await client.connect();
  console.log(`Storage: ${STORAGE_PATH}${isDryRun ? " (dry run)" : ""}`);

  const stats = { rows: 0, files: 0, bytes: 0, failed: 0 };
  await deleteOrphanedRows(stats);
  await deleteOrphanedFiles(stats);

  console.log(
    `\n${isDryRun ? "Would delete" : "Deleted"} rows: ${stats.rows}, files without row: ${stats.files} ` +
      `(${(stats.bytes / 1024).toFixed(0)} kB), failed: ${stats.failed}`,
  );
  if (stats.failed > 0) process.exitCode = 1;
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
