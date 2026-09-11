import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSeed } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "../data");
const dataFile = path.join(dataDir, "store.json");

let db = null;

export async function loadStore() {
  try {
    const raw = await readFile(dataFile, "utf8");
    db = JSON.parse(raw);
  } catch {
    db = buildSeed();
    await persist();
  }
  return db;
}

export function getStore() {
  if (!db) throw new Error("Store not loaded");
  return db;
}

export async function persist() {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(db, null, 2));
}

export async function mutate(fn) {
  const result = fn(getStore());
  await persist();
  return result;
}

export async function resetStore() {
  db = buildSeed();
  await persist();
  return db;
}
