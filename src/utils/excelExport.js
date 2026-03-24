import * as XLSX from "xlsx";

function triggerDownload(buffer, filename) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 카테고리 요약 + Intent (Category, IntentID, Intent명, 건수, 비율)
 */
export function exportCategoryIntentExcel({
  categorySummary,
  intentRows,
  filenamePrefix = "faq_category_intent",
}) {
  const wb = XLSX.utils.book_new();

  const categorySheet = XLSX.utils.json_to_sheet(
    categorySummary.map((c) => ({
      카테고리: c.name,
      건수: c.value,
      "비율(%)": Number(c.ratio.toFixed(2)),
    }))
  );
  XLSX.utils.book_append_sheet(wb, categorySheet, "카테고리");

  const intentSheet = XLSX.utils.json_to_sheet(
    intentRows.map((r) => ({
      Category: r.Category,
      IntentID: r.IntentID,
      Intent명: r.Intent명,
      건수: r.건수,
      비율: r.비율,
    }))
  );
  XLSX.utils.book_append_sheet(wb, intentSheet, "Intent");

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const safePrefix = filenamePrefix.replace(/[^\w\uAC00-\uD7A3\-_.]/g, "_");
  triggerDownload(out, `${safePrefix}_${formatTimestamp()}.xlsx`);
}

/**
 * 클릭 이벤트(필터 적용 결과, 날짜 미구분 집계)
 */
export function exportClickExcel({ clickRows, filenamePrefix = "faq_clicks" }) {
  const wb = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(
    clickRows.map((c) => ({
      카테고리: c.category,
      Label: c.label,
      PATH: c.path,
      노출: c.exposedEvents,
      클릭: c.clickedEvents,
      CTR: c.ctr,
    }))
  );
  XLSX.utils.book_append_sheet(wb, sheet, "클릭");

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const safePrefix = filenamePrefix.replace(/[^\w\uAC00-\uD7A3\-_.]/g, "_");
  triggerDownload(out, `${safePrefix}_${formatTimestamp()}.xlsx`);
}

function formatTimestamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}
