import Papa from "papaparse";

const FAQ_STATS_URL = import.meta.env.VITE_FAQ_STATS_CSV ?? "/data/faq_stats.csv";
const BUTTON_CLICKS_URL = import.meta.env.VITE_BUTTON_CLICKS_CSV ?? "/data/button_clicks.csv";

function emptyToNull(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

export function mapFaqStatsRow(r) {
  return {
    date: String(r.date ?? "").trim(),
    category: String(r.category ?? "").trim(),
    intentName: String(r.intentName ?? "").trim(),
    intentId: String(r.intentId ?? "").trim(),
    exposedButton1Name: emptyToNull(r.exposedButton1Name),
    exposedButton1Path: emptyToNull(r.exposedButton1Path),
    exposedButton2Name: emptyToNull(r.exposedButton2Name),
    exposedButton2Path: emptyToNull(r.exposedButton2Path),
    exposedButton3Name: emptyToNull(r.exposedButton3Name),
    exposedButton3Path: emptyToNull(r.exposedButton3Path),
    count: Number(r.count) || 0,
  };
}

export function mapButtonClickRow(r) {
  const nbsp = /\u00a0/g;
  return {
    date: String(r.date ?? "").trim(),
    label: String(r.label ?? "").replace(nbsp, " ").trim(),
    path: String(r.path ?? "").replace(nbsp, "").trim(),
    eventCount: Number(r.eventCount) || 0,
  };
}

function stripBom(s) {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

function parseCsv(text, mapper) {
  const parsed = Papa.parse(stripBom(text), {
    header: true,
    skipEmptyLines: "greedy",
  });
  if (parsed.errors?.length) {
    const serious = parsed.errors.find((e) => e.type !== "TooManyFields" && e.type !== "TooFewFields");
    if (serious) throw new Error(serious.message || "CSV 파싱 오류");
  }
  return (parsed.data || []).map(mapper);
}

export async function loadFaqStatsCsv(url = FAQ_STATS_URL) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FAQ CSV 로드 실패 (${res.status})`);
  const text = await res.text();
  return parseCsv(text, mapFaqStatsRow).filter((r) => r.category && r.intentId);
}

export async function loadButtonClicksCsv(url = BUTTON_CLICKS_URL) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`버튼 클릭 CSV 로드 실패 (${res.status})`);
  const text = await res.text();
  return parseCsv(text, mapButtonClickRow).filter((r) => r.label && r.path);
}

export async function loadDashboardCsvData() {
  const [statsRows, buttonClickRows] = await Promise.all([
    loadFaqStatsCsv(),
    loadButtonClicksCsv(),
  ]);
  return { statsRows, buttonClickRows };
}
