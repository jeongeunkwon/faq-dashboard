/**
 * faq_stats.csv의 exposedButton* 열만 button_clicks.csv의 (date, label, path)와 맞춤.
 * date/category/intentName/intentId/count는 변경하지 않음.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Papa from "papaparse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const faqPath = path.join(root, "public/data/faq_stats.csv");
const clicksPath = path.join(root, "public/data/button_clicks.csv");

function stripBom(s) {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

const clicksRaw = stripBom(fs.readFileSync(clicksPath, "utf8"));
const clicksParsed = Papa.parse(clicksRaw, { header: true, skipEmptyLines: "greedy" });

/** @type {Map<string, {label:string,path:string}[]>} */
const poolByDate = new Map();
/** @type {{label:string,path:string}[]} */
const globalPool = [];

for (const r of clicksParsed.data) {
  if (!r || !String(r.date || "").trim()) continue;
  const date = String(r.date).trim();
  const label = String(r.label ?? "").trim();
  const p = String(r.path ?? "").trim();
  if (!p) continue;
  const pair = { label, path: p };
  if (!poolByDate.has(date)) poolByDate.set(date, []);
  const arr = poolByDate.get(date);
  if (!arr.some((x) => x.path === p)) arr.push(pair);
  if (!globalPool.some((x) => x.path === p)) globalPool.push(pair);
}

const faqRaw = stripBom(fs.readFileSync(faqPath, "utf8"));
const faqParsed = Papa.parse(faqRaw, { header: true, skipEmptyLines: "greedy" });

const perDateCursor = new Map();

const outRows = faqParsed.data.map((row) => {
  if (!row || !String(row.date || "").trim()) return row;
  const date = String(row.date).trim();
  let pool = poolByDate.get(date);
  if (!pool || pool.length === 0) pool = globalPool;

  const idx = perDateCursor.get(date) ?? 0;
  perDateCursor.set(date, idx + 1);

  const n = pool.length;
  const a = pool[idx % n];
  const b = pool[(idx + 1) % n];
  const c = pool[(idx + 2) % n];

  return {
    date: row.date,
    category: row.category,
    intentName: row.intentName,
    intentId: row.intentId,
    exposedButton1Name: a.label,
    exposedButton1Path: a.path,
    exposedButton2Name: b.path !== a.path ? b.label : "",
    exposedButton2Path: b.path !== a.path ? b.path : "",
    exposedButton3Name: c.path !== a.path && c.path !== b.path ? c.label : "",
    exposedButton3Path: c.path !== a.path && c.path !== b.path ? c.path : "",
    count: row.count,
  };
});

const out = Papa.unparse(outRows, {
  columns: [
    "date",
    "category",
    "intentName",
    "intentId",
    "exposedButton1Name",
    "exposedButton1Path",
    "exposedButton2Name",
    "exposedButton2Path",
    "exposedButton3Name",
    "exposedButton3Path",
    "count",
  ],
});

fs.writeFileSync(faqPath, out, "utf8");
console.log("Updated", outRows.length, "rows →", faqPath);
