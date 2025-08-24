// src/pages/TimetableRecommendation/timetableFormat.js
export const dayMap  = { 1:"월", 2:"화", 3:"수", 4:"목", 5:"금", 6:"토", 7:"일" };
export const dayRev  = { "월":1, "화":2, "수":3, "목":4, "금":5, "토":6, "일":7 };
const palette = ["#8ecae6","#ffb703","#90be6d","#f94144","#f8961e","#43aa8b","#577590","#a05195"];

const toHHMM = (t) => (typeof t === "string" ? t.slice(0,5) : "");

// ✅ 4가지 코드만 취급
export const KIND_BY_CATEGORY = { 전선: "전공", 전필: "전공", 교선: "교양", 교필: "교양" };

// slots → blocks
export const slotsToBlocks = (timeSlots = [], { withColor = false, colorMap = null } = {}) =>
  (Array.isArray(timeSlots) ? timeSlots : []).map((s, i) => {
    const id = s.subjectId;

    const category = (s.category ?? s.courseType ?? s.discipline ?? "") || "";
    const kind = KIND_BY_CATEGORY[category] || ""; // ← 전공/교양 결정

    const base = {
      id,
      subject: s.subjectName || s.name || "-",
      day: dayMap[s.day] || "-",
      start: toHHMM(s.startTime),
      end: toHHMM(s.endTime),
      category,        // 전선/전필/교선/교필 (코드)
      kind,            // 전공/교양 (상위 분류)
      type: kind,      // (하위 호환) 기존 유틸이 type을 볼 수 있음
      credit: Number(s.credit ?? 0),
      professor: s.professor || "",
    };

    if (colorMap && id != null && colorMap[String(id)]) return { ...base, color: colorMap[String(id)] };
    if (withColor) return { ...base, color: palette[i % palette.length] };
    return base;
  });

// blocks → slots (저장 시 메타 같이 보존)
export const blocksToSlots = (blocks = []) =>
  (Array.isArray(blocks) ? blocks : []).map((b, i) => ({
    subjectId: Number(b.id ?? i),
    subjectName: b.subject || "",
    professor: b.professor || "",
    credit: Number(b.credit ?? 0),
    category: b.category || b.type || "", 
    courseType: b.category || b.type || "",
    startTime: b.start || "00:00",
    endTime: b.end || "00:00",
    day: b.dayNum ?? dayRev[b.day] ?? 1,
  }));
