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
    const kind = KIND_BY_CATEGORY[category] || "";

    const base = {
      id,
      subject: s.subjectName || s.name || "-",
      day: dayMap[s.day] || "-",
      start: toHHMM(s.startTime),
      end: toHHMM(s.endTime),
      category,
      kind,
      type: kind,      // 하위 호환
      credit: Number(s.credit ?? 0),
      professor: s.professor || "",
    };

    if (colorMap && id != null && colorMap[String(id)]) return { ...base, color: colorMap[String(id)] };
    if (withColor) return { ...base, color: palette[i % palette.length] };
    return base;
  });

// blocks → slots
export const blocksToSlots = (blocks = []) =>
  (Array.isArray(blocks) ? blocks : [])
    .filter(b => (b.dayNum && b.dayNum >= 1) || dayRev[b.day]) // ✅ 사이버/무스케줄 제거
    .map((b, i) => ({
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

/* -------------------- 코스 → 블록 / 스케줄 문자열 -------------------- */

// 과목 상세(merge된 course 객체) → blocks (요일2, 시간2 지원)
export const courseToBlocks = (c = {}) => {
  const normalizeDay = (d) => (typeof d === "number" ? (dayMap[d] || "-") : (d || "-"));
  const category = (c.category ?? c.courseType ?? c.discipline ?? "") || "";
  const kind = KIND_BY_CATEGORY[category] || "";

  const mk = (day, start, end) => ({
    id: c.id ?? c.subjectId,
    subject: c.name ?? c.subjectName ?? "-",
    day: normalizeDay(day),
    start: toHHMM(start),
    end: toHHMM(end),
    category,
    kind,
    type: kind,
    credit: Number(c.credit ?? 0),
    professor: c.professor || "",
  });

  const blocks = [];
  if (c.dayOfWeek && c.start && c.end) blocks.push(mk(c.dayOfWeek, c.start, c.end));
  if (c.dayOfWeek2nd && c.start2nd && c.end2nd) blocks.push(mk(c.dayOfWeek2nd, c.start2nd, c.end2nd));
  return blocks;
};

// blocks → "요일/시간" 문자열
export const blocksToScheduleString = (blocks = []) => {
  const b = (Array.isArray(blocks) ? blocks : []).filter(x => x?.day);
  if (b.length === 0) return "- / -";
  if (b.length === 1) return `${b[0].day} / ${b[0].start && b[0].end ? `${b[0].start}~${b[0].end}` : "-"}`;

  const sameTime = b.length === 2 && b[0].start === b[1].start && b[0].end === b[1].end;
  if (sameTime) return `${b[0].day}, ${b[1].day} / ${b[0].start}~${b[0].end}`;

  return b.map(x => `${x.day} ${x.start && x.end ? `${x.start}~${x.end}` : "-"}`).join(" / ");
};

// 과목 객체 → "요일/시간" 문자열 (편의)
export const scheduleFromCourse = (course) => blocksToScheduleString(courseToBlocks(course));
