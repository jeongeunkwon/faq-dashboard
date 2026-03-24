import { useMemo, useState } from "react";
import { exportCategoryIntentExcel, exportClickExcel } from "../utils/excelExport.js";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultDateRange = () => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 14);
  return {
    startDate: formatDate(start),
    endDate: formatDate(today),
  };
};

/** 카테고리명 가나다순 (한글·영문 혼합 시 locale 기준) */
const sortCategoriesKo = (a, b) => a.localeCompare(b, "ko");

// 클릭 데이터(별도 소스): 날짜 / Label / PATH / 이벤트수
const BUTTON_CLICK_SAMPLES = [
  { date: "2026-03-12", label: "매장찾기 바로가기", path: "tworld.co.kr/...", eventCount: 12 },
  { date: "2026-03-12", label: "요금제 확인", path: "tworld.co.kr/plan", eventCount: 9 },
  { date: "2026-03-12", label: "매장찾기 바로가기", path: "tworld.co.kr/...", eventCount: 6 },
  { date: "2026-03-10", label: "요금제 확인", path: "tworld.co.kr/plan", eventCount: 15 },
  { date: "2026-03-14", label: "로밍 안내", path: "tworld.co.kr/roaming", eventCount: 22 },
  { date: "2026-03-14", label: "요금제 확인", path: "tworld.co.kr/plan", eventCount: 18 },
  { date: "2026-03-16", label: "이메일 상담 접수 바로가기", path: "tworld.co.kr/aaa", eventCount: 8 },
  { date: "2026-03-16", label: "상담사 연결하기", path: "tel:114", eventCount: 6 },
  { date: "2026-03-20", label: "요금제 확인", path: "tworld.co.kr/plan", eventCount: 11 },
];

export default function FaqDashboard() {
  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);

  const applyPreset = (preset) => {
    const today = new Date();
    const end = formatDate(today);

    if (preset === "today") {
      setStartDate(end);
      setEndDate(end);
      return;
    }

    if (preset === "last7Days") {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      setStartDate(formatDate(start));
      setEndDate(end);
      return;
    }

    if (preset === "thisMonth") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(formatDate(start));
      setEndDate(end);
    }
  };

  // 단일 입력 데이터(예시)
  // 사용자가 활용할 데이터 포맷:
  // - date
  // - category
  // - intentName
  // - intentId
  // - exposedButton1Name / exposedButton1Path
  // - exposedButton2Name / exposedButton2Path
  // - exposedButton3Name / exposedButton3Path
  // - count
  //
  // 버튼 식별자(key)는 기본적으로 `path`를 우선 사용합니다.
  const statsRows = [
    {
      date: "2026-03-12",
      category: "유선",
      intentName: "T 통화중대기",
      intentId: "scint00000001",
      exposedButton1Name: "매장찾기 바로가기",
      exposedButton1Path: "tworld.co.kr/...",
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 50,
    },
    {
      date: "2026-03-12",
      category: "안내",
      intentName: "5G커버리지",
      intentId: "scint00000002",
      exposedButton1Name: "요금제 확인",
      exposedButton1Path: "tworld.co.kr/plan",
      exposedButton2Name: "매장찾기 바로가기",
      exposedButton2Path: "tworld.co.kr/...",
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 30,
    },
    {
      date: "2026-03-10",
      category: "가입변경신청",
      intentName: "명의변경",
      intentId: "scint00000003",
      exposedButton1Name: "요금제 확인",
      exposedButton1Path: "tworld.co.kr/plan",
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 40,
    },
    {
      date: "2026-03-11",
      category: "결합문의",
      intentName: "T가족모아데이터공유방법",
      intentId: "scint00000004",
      exposedButton1Name: null,
      exposedButton1Path: null,
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 19,
    },
    {
      date: "2026-03-13",
      category: "구독상품",
      intentName: "구독구독",
      intentId: "scint00000100",
      exposedButton1Name: null,
      exposedButton1Path: null,
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 19,
    },
    {
      date: "2026-03-14",
      category: "요금제문의",
      intentName: "0틴5G요금제",
      intentId: "scint00000005",
      exposedButton1Name: "로밍 안내",
      exposedButton1Path: "tworld.co.kr/roaming",
      exposedButton2Name: "요금제 확인",
      exposedButton2Path: "tworld.co.kr/plan",
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 60,
    },
    {
      date: "2026-03-17",
      category: "Tworld",
      intentName: "Tworld에서처리가능한업무",
      intentId: "scint00003004",
      exposedButton1Name: null,
      exposedButton1Path: null,
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 87,
    },
    {
      date: "2026-03-22",
      category: "서비스이용문의",
      intentName: "플로앤데이터사용방법",
      intentId: "scint00050004",
      exposedButton1Name: null,
      exposedButton1Path: null,
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 123,
    },
    {
      date: "2026-03-16",
      category: "프로모션",
      intentName: "26년3월프로모션",
      intentId: "scint00000405",
      exposedButton1Name: null,
      exposedButton1Path: null,
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 90,
    },
    {
      date: "2026-03-19",
      category: "플랫폼",
      intentName: "플랫폼1234",
      intentId: "scint00005004",
      exposedButton1Name: null,
      exposedButton1Path: null,
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 55,
    },
    {
      date: "2026-03-15",
      category: "통화품질",
      intentName: "휴대폰5G데이터접속불가조치방법",
      intentId: "scint00000006",
      exposedButton1Name: null,
      exposedButton1Path: null,
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 32,
    },
    {
      date: "2026-03-18",
      category: "법인",
      intentName: "법인법인법인",
      intentId: "scint00008006",
      exposedButton1Name: null,
      exposedButton1Path: null,
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 39,
    },
    {
      date: "2026-03-16",
      category: "안내",
      intentName: "T다이렉트샵상담센터",
      intentId: "scint00000007",
      exposedButton1Name: "이메일 상담 접수 바로가기",
      exposedButton1Path: "tworld.co.kr/aaa",
      exposedButton2Name: "상담사 연결하기",
      exposedButton2Path: "tel:114",
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 30,
    },
    {
      date: "2026-03-17",
      category: "고객우대혜택",
      intentName: "specialT",
      intentId: "scint00000008",
      exposedButton1Name: null,
      exposedButton1Path: null,
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 8,
    },
    {
      date: "2026-03-24",
      category: "고객정보조회",
      intentName: "고객정보조회1234",
      intentId: "scint00000204",
      exposedButton1Name: null,
      exposedButton1Path: null,
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 77,
    },
    {
      date: "2026-03-23",
      category: "약정할인제도",
      intentName: "선택약정가입방법",
      intentId: "scint00600004",
      exposedButton1Name: null,
      exposedButton1Path: null,
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 101,
    },
    {
      date: "2026-03-18",
      category: "로밍",
      intentName: "로밍완전차단",
      intentId: "scint00000009",
      exposedButton1Name: null,
      exposedButton1Path: null,
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 40,
    },
    {
      date: "2026-03-11",
      category: "통화품질",
      intentName: "통화음질불량조치방법",
      intentId: "scint00001234",
      exposedButton1Name: null,
      exposedButton1Path: null,
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 55,
    },
    {
      date: "2026-03-18",
      category: "서비스이용문의",
      intentName: "휴대폰보험문의",
      intentId: "scint01000006",
      exposedButton1Name: null,
      exposedButton1Path: null,
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 99,
    },
    {
      date: "2026-03-19",
      category: "약정할인제도",
      intentName: "약정가입방법",
      intentId: "scint02000006",
      exposedButton1Name: null,
      exposedButton1Path: null,
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 88,
    },
    {
      date: "2026-03-20",
      category: "통화품질",
      intentName: "통화품질1234",
      intentId: "scint07000006",
      exposedButton1Name: null,
      exposedButton1Path: null,
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 67,
    },
    {
      date: "2026-03-20",
      category: "로밍",
      intentName: "로밍요금제변경문의",
      intentId: "scint06000006",
      exposedButton1Name: "요금제 확인",
      exposedButton1Path: "tworld.co.kr/plan",
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 55,
    },
    {
      date: "2026-03-19",
      category: "법인",
      intentName: "법인세신고용서류",
      intentId: "scint00030006",
      exposedButton1Name: null,
      exposedButton1Path: null,
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 144,
    },
    {
      date: "2026-03-19",
      category: "요금관련문의",
      intentName: "타인요금즉시납부방법",
      intentId: "scint00000010",
      exposedButton1Name: null,
      exposedButton1Path: null,
      exposedButton2Name: null,
      exposedButton2Path: null,
      exposedButton3Name: null,
      exposedButton3Path: null,
      count: 10,
    },
  ];

  const normalizeButtonParts = (name, path) => {
    if (!name && !path) return null;
    const safeName = name ?? "";
    const safePath = path ?? "";
    const key = safePath || safeName;
    return {
      key,
      label: safeName || safePath,
      path: safePath || safeName,
    };
  };
  const getUniqueButtonsFromRow = (row) => {
    const buttons = [
      normalizeButtonParts(row.exposedButton1Name, row.exposedButton1Path),
      normalizeButtonParts(row.exposedButton2Name, row.exposedButton2Path),
      normalizeButtonParts(row.exposedButton3Name, row.exposedButton3Path),
    ].filter(Boolean);
    return Array.from(new Map(buttons.map((btn) => [btn.key, btn])).values());
  };

  const isInRange = (date) => {
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  };

  const allCategories = [...new Set(statsRows.map((r) => r.category))].sort(sortCategoriesKo);

  const [selectedCategories, setSelectedCategories] = useState(() =>
    [...new Set(statsRows.map((r) => r.category))].sort(sortCategoriesKo)
  );

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat].sort(sortCategoriesKo)
    );
  };

  const selectAllCategories = () => setSelectedCategories([...allCategories]);
  const clearAllCategories = () => setSelectedCategories([]);

  const filteredStatsRows = useMemo(
    () =>
      statsRows.filter(
        (row) =>
          isInRange(row.date) &&
          selectedCategories.length > 0 &&
          selectedCategories.includes(row.category)
      ),
    [startDate, endDate, selectedCategories]
  );

  const totalFaqCount = filteredStatsRows.reduce((sum, row) => sum + row.count, 0);

  // Category 집계
  const categoryGroupedMap = new Map();
  for (const row of filteredStatsRows) {
    const prev = categoryGroupedMap.get(row.category) ?? 0;
    categoryGroupedMap.set(row.category, prev + row.count);
  }
  const categorySummaryBase = Array.from(categoryGroupedMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const maxCategoryValue =
    categorySummaryBase.length > 0 ? Math.max(...categorySummaryBase.map((i) => i.value)) : 0;
  const categorySummary = categorySummaryBase.map((item) => ({
    ...item,
    ratio: totalFaqCount > 0 ? (item.value / totalFaqCount) * 100 : 0,
    barWidth: maxCategoryValue > 0 ? (item.value / maxCategoryValue) * 100 : 0,
  }));

  // Intent 집계 (화면에는 최대 20개만 노출)
  const MAX_INTENT_ROWS = 20;
  const intentGroupedMap = new Map();
  for (const row of filteredStatsRows) {
    const prev = intentGroupedMap.get(row.intentId);
    if (prev) {
      intentGroupedMap.set(row.intentId, { id: row.intentId, name: row.intentName, value: prev.value + row.count });
    } else {
      intentGroupedMap.set(row.intentId, { id: row.intentId, name: row.intentName, value: row.count });
    }
  }
  const intentSummaryAll = Array.from(intentGroupedMap.values()).sort((a, b) => b.value - a.value);
  const totalIntentCount = intentSummaryAll.reduce((sum, item) => sum + item.value, 0);
  const intentSummary = intentSummaryAll.slice(0, MAX_INTENT_ROWS);
  const maxIntentValue = intentSummary.length > 0 ? Math.max(...intentSummary.map((i) => i.value)) : 0;
  const intentSummaryWithRatio = intentSummary.map((item) => ({
    ...item,
    ratio: totalIntentCount > 0 ? (item.value / totalIntentCount) * 100 : 0,
    barWidth: maxIntentValue > 0 ? (item.value / maxIntentValue) * 100 : 0,
  }));

  const filteredButtonClicks = useMemo(
    () => BUTTON_CLICK_SAMPLES.filter((c) => isInRange(c.date)),
    [startDate, endDate]
  );

  const totalButtonClickEvents = filteredButtonClicks.reduce((sum, c) => sum + c.eventCount, 0);

  const buttonClickedMap = new Map();
  for (const c of filteredButtonClicks) {
    const parts = normalizeButtonParts(c.label, c.path);
    if (!parts) continue;
    const prev = buttonClickedMap.get(parts.key) ?? 0;
    buttonClickedMap.set(parts.key, prev + c.eventCount);
  }

  // 버튼 노출 이벤트수 / 버튼별 노출건수 집계
  const buttonExposureEventCount = filteredStatsRows.reduce((sum, row) => {
    const b1 = normalizeButtonParts(row.exposedButton1Name, row.exposedButton1Path);
    const b2 = normalizeButtonParts(row.exposedButton2Name, row.exposedButton2Path);
    const b3 = normalizeButtonParts(row.exposedButton3Name, row.exposedButton3Path);
    const hasAnyButton = Boolean(b1 || b2 || b3);
    return sum + (hasAnyButton ? row.count : 0);
  }, 0);

  const buttonExposureMap = new Map(); // buttonKey -> {label,path, exposedEvents}
  for (const row of filteredStatsRows) {
    const buttons = getUniqueButtonsFromRow(row);
    for (const btn of buttons) {
      const prev = buttonExposureMap.get(btn.key);
      if (prev) {
        buttonExposureMap.set(btn.key, { ...prev, exposedEvents: prev.exposedEvents + row.count });
      } else {
        buttonExposureMap.set(btn.key, { key: btn.key, label: btn.label, path: btn.path, exposedEvents: row.count });
      }
    }
  }

  const MAX_BUTTON_TABLE_ROWS = 30;
  const filteredButtonEvents = Array.from(buttonExposureMap.values())
    .map((b) => ({
      label: b.label,
      path: b.path,
      exposedEvents: b.exposedEvents,
      clickedEvents: buttonClickedMap.get(b.key) ?? 0,
    }))
    .sort((a, b) => {
      if (b.clickedEvents !== a.clickedEvents) return b.clickedEvents - a.clickedEvents;
      return b.exposedEvents - a.exposedEvents;
    });
  const buttonTableRows = filteredButtonEvents.slice(0, MAX_BUTTON_TABLE_ROWS);

  const kpis = [
    { label: "전체 FAQ 응답", value: totalFaqCount.toLocaleString() },
    { label: "Intent ID 수", value: intentSummaryAll.length.toLocaleString() },
    { label: "버튼 노출 응답 수", value: buttonExposureEventCount.toLocaleString() },
    { label: "버튼 클릭 수", value: totalButtonClickEvents.toLocaleString() },
  ];

  const handleDownloadCategoryIntent = () => {
    if (filteredStatsRows.length === 0) {
      window.alert("다운로드할 데이터가 없습니다. 날짜·카테고리를 확인해 주세요.");
      return;
    }
    const intentByCategoryKey = new Map();
    for (const row of filteredStatsRows) {
      const key = `${row.category}|${row.intentId}`;
      const prev = intentByCategoryKey.get(key);
      if (prev) {
        intentByCategoryKey.set(key, { ...prev, 건수: prev.건수 + row.count });
      } else {
        intentByCategoryKey.set(key, {
          Category: row.category,
          IntentID: row.intentId,
          Intent명: row.intentName,
          건수: row.count,
        });
      }
    }
    const total = totalFaqCount;
    const intentRows = Array.from(intentByCategoryKey.values())
      .map((r) => ({
        ...r,
        비율: total > 0 ? Number(((r.건수 / total) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => {
        const cat = a.Category.localeCompare(b.Category, "ko");
        if (cat !== 0) return cat;
        return b.건수 - a.건수;
      });
    exportCategoryIntentExcel({
      categorySummary,
      intentRows,
      filenamePrefix: "faq_카테고리_Intent",
    });
  };

  const handleDownloadClicks = () => {
    const exposureByButtonMap = new Map();
    for (const row of filteredStatsRows) {
      const buttons = getUniqueButtonsFromRow(row);
      for (const btn of buttons) {
        const key = btn.key;
        const prev = exposureByButtonMap.get(key);
        if (prev) {
          exposureByButtonMap.set(key, { ...prev, exposedEvents: prev.exposedEvents + row.count });
        } else {
          exposureByButtonMap.set(key, {
            label: btn.label,
            path: btn.path,
            exposedEvents: row.count,
          });
        }
      }
    }

    const clickByButtonMap = new Map();
    for (const c of filteredButtonClicks) {
      const parts = normalizeButtonParts(c.label, c.path);
      if (!parts) continue;
      const key = parts.key;
      const prev = clickByButtonMap.get(key);
      if (prev) {
        clickByButtonMap.set(key, { ...prev, clickedEvents: prev.clickedEvents + c.eventCount });
      } else {
        clickByButtonMap.set(key, {
          label: parts.label,
          path: parts.path,
          clickedEvents: c.eventCount,
        });
      }
    }

    const allKeys = new Set([
      ...exposureByButtonMap.keys(),
      ...clickByButtonMap.keys(),
    ]);
    const clickRows = Array.from(allKeys)
      .map((key) => {
        const exposure = exposureByButtonMap.get(key);
        const click = clickByButtonMap.get(key);
        const exposedEvents = exposure?.exposedEvents ?? 0;
        const clickedEvents = click?.clickedEvents ?? 0;
        return {
          label: exposure?.label ?? click?.label ?? "",
          path: exposure?.path ?? click?.path ?? "",
          exposedEvents,
          clickedEvents,
          ctr: exposedEvents > 0 ? Number(((clickedEvents / exposedEvents) * 100).toFixed(2)) : 0,
        };
      })
      .sort((a, b) => {
        if (b.clickedEvents !== a.clickedEvents) return b.clickedEvents - a.clickedEvents;
        return b.exposedEvents - a.exposedEvents;
      });

    if (clickRows.length === 0) {
      window.alert("다운로드할 클릭 데이터가 없습니다. 날짜 범위를 확인해 주세요.");
      return;
    }
    exportClickExcel({
      clickRows,
      filenamePrefix: "faq_클릭",
    });
  };

  return (
    <div style={{ padding: 24, background: "#F7F8FA", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        FAQ 통계 대시보드
      </h1>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "end",
          background: "#fff",
          padding: 16,
          borderRadius: 12,
          border: "1px solid #eee",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 12, color: "#666" }}>시작일</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #ddd" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 12, color: "#666" }}>종료일</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #ddd" }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <button
            type="button"
            onClick={() => applyPreset("today")}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            오늘
          </button>
          <button
            type="button"
            onClick={() => applyPreset("last7Days")}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            최근 7일
          </button>
          <button
            type="button"
            onClick={() => applyPreset("thisMonth")}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            이번 달
          </button>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          padding: 16,
          borderRadius: 12,
          border: "1px solid #eee",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600 }}>카테고리</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={selectAllCategories}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: "#fff",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              전체 선택
            </button>
            <button
              type="button"
              onClick={clearAllCategories}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: "#fff",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              전체 해제
            </button>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 16px",
            fontSize: 12,
          }}
        >
          {allCategories.map((cat) => (
            <label
              key={cat}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
              />
              {cat}
            </label>
          ))}
        </div>
        {selectedCategories.length === 0 && (
          <div style={{ fontSize: 12, color: "#c2410c", marginTop: 10 }}>
            카테고리를 하나 이상 선택하면 데이터가 표시됩니다.
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
          background: "#fff",
          padding: "12px 16px",
          borderRadius: 12,
          border: "1px solid #eee",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, marginRight: 4 }}>엑셀 다운로드</span>
        <button
          type="button"
          onClick={handleDownloadCategoryIntent}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #2563eb",
            background: "#eff6ff",
            color: "#1d4ed8",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          1. Category + Intent
        </button>
        <button
          type="button"
          onClick={handleDownloadClicks}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #16a34a",
            background: "#f0fdf4",
            color: "#15803d",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          2. 버튼
        </button>
        <span style={{ fontSize: 11, color: "#64748b" }}>
          Category+Intent는 날짜·카테고리 필터, 버튼은 날짜 필터만 적용됩니다. 건수 제한 없이 전체 데이터 다운로드되게 해주세요.
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              flex: "1 1 160px",
              minWidth: 140,
              background: "#fff",
              padding: 16,
              borderRadius: 12,
              border: "1px solid #eee",
            }}
          >
            <div style={{ fontSize: 12, color: "#666" }}>{kpi.label}</div>
            <div style={{ fontSize: 24, fontWeight: "bold" }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "stretch" }}>
        <div style={{ flex: 1, minWidth: 0, background: "#fff", padding: 20, borderRadius: 12 }}>
          <h3 style={{ margin: 0, marginBottom: 8, fontSize: 18, fontWeight: "bold" }}>
            Category별 건수
          </h3>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
              총 {categorySummary.length}개 카테고리 · 총 {totalFaqCount.toLocaleString()}건
            </div>
            <div
              style={{
                fontSize: 11,
                lineHeight: 1.35,
                visibility: "hidden",
                userSelect: "none",
                pointerEvents: "none",
              }}
              aria-hidden="true"
            >
              최대 20개까지 노출
            </div>
          </div>

          {categorySummary.length === 0 && (
            <div style={{ fontSize: 13, color: "#777", marginTop: 16 }}>
              선택한 날짜 범위·카테고리에 해당하는 데이터가 없습니다.
            </div>
          )}

          {categorySummary.map((item) => (
            <div key={item.name} style={{ marginTop: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                <span>{item.name}</span>
                <span style={{ color: "#555" }}>
                  {item.value.toLocaleString()}건 ({item.ratio.toFixed(1)}%)
                </span>
              </div>
              <div style={{ height: 10, background: "#ddd", borderRadius: 6 }}>
                <div
                  style={{
                    width: `${item.barWidth}%`,
                    height: "100%",
                    background: "#333",
                    borderRadius: 6,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0, background: "#fff", padding: 20, borderRadius: 12 }}>
          <h3 style={{ margin: 0, marginBottom: 8, fontSize: 18, fontWeight: "bold" }}>
            Intent별 건수
          </h3>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
              총 {intentSummaryAll.length}개 Intent · 총 {totalIntentCount.toLocaleString()}건
            </div>
            <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.35 }}>
              (최대 20개까지 노출)
            </div>
          </div>

          {intentSummaryWithRatio.length === 0 && (
            <div style={{ fontSize: 13, color: "#777", marginTop: 16 }}>
              선택한 날짜 범위·카테고리에 해당하는 Intent 데이터가 없습니다.
            </div>
          )}

          {intentSummaryWithRatio.map((item) => (
            <div key={item.id} style={{ marginTop: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                <span>{`${item.name} (${item.id})`}</span>
                <span style={{ color: "#555" }}>
                  {item.value.toLocaleString()}건 ({item.ratio.toFixed(1)}%)
                </span>
              </div>
              <div style={{ height: 10, background: "#ddd", borderRadius: 6 }}>
                <div
                  style={{
                    width: `${item.barWidth}%`,
                    height: "100%",
                    background: "#333",
                    borderRadius: 6,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", padding: 20, borderRadius: 12 }}>
        <h3 style={{ margin: 0, marginBottom: 8, fontSize: 18, fontWeight: "bold" }}>버튼 분석</h3>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>
          클릭 수 기준 정렬 · 최대 {MAX_BUTTON_TABLE_ROWS}개까지 노출
        </div>
        <table style={{ width: "100%", marginTop: 0 }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: 12 }}>
              <th>Label</th>
              <th>PATH</th>
              <th>노출</th>
              <th>클릭</th>
              <th>CTR</th>
            </tr>
          </thead>
          <tbody>
            {buttonTableRows.map((item) => (
              <tr key={`${item.label}-${item.path}`}>
                <td>{item.label}</td>
                <td>{item.path}</td>
                <td>{item.exposedEvents.toLocaleString()}</td>
                <td>{item.clickedEvents.toLocaleString()}</td>
                <td>
                  {item.exposedEvents > 0
                    ? ((item.clickedEvents / item.exposedEvents) * 100).toFixed(1)
                    : "0.0"}
                  %
                </td>
              </tr>
            ))}
            {filteredButtonEvents.length === 0 && (
              <tr>
                <td colSpan={5} style={{ color: "#777", paddingTop: 8 }}>
                  선택한 날짜 범위·카테고리에 해당하는 버튼 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}