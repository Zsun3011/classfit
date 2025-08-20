export const DAYS = ["월", "화", "수", "목", "금"];
export const dayName = (n) => ({ 1:"월",2:"화",3:"수",4:"목",5:"금",6:"토",7:"일" }[n] ?? n);

export const toMin = (t) => {
  if (!t || typeof t !== "string") return null;
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

// 서버/블록 데이터 -> 화면용 통합 레코드로 정규화
export const normalize = (c) => {
  const subject = c.subject ?? c.subjectName ?? c.name ?? "-";
  const dayRaw = c.day ?? c.dayOfWeek;
  const dayStr = typeof dayRaw === "number" ? dayName(dayRaw) : dayRaw;

  const start = c.start ?? c.startTime ?? null;
  const end = c.end ?? c.endTime ?? null;

  const cat = (c.category ?? c.courseType ?? c.discipline ?? c.type ?? "").toString();
  const isMajor = /전공/i.test(cat);
  const isGeneral = /교양|일반/i.test(cat) || (!isMajor && /교/i.test(cat));
  const kind = /필/i.test(cat) ? "필수" : "선택";

  return {
    subject,
    credit: c.credit ?? "-",
    day: dayStr,
    start,
    end,
    isMajor,
    isGeneral,
    kind,
  };
};

// 대시보드에 필요한 요약 계산
export const getDashboardInfo = (data = []) => {
  const rows = data.map(normalize);

  const hasMorning = rows.some((r) => {
    const m = toMin(r.start);
    return m !== null && m < 12 * 60;
  });

  const occupied = new Set(rows.map((r) => r.day).filter(Boolean));
  const freeDays = DAYS.filter((d) => !occupied.has(d));

  const majors = rows
    .filter((r) => r.isMajor)
    .map((r) => ({ subject: r.subject, credit: r.credit, kind: r.kind }));

  const generals = rows
    .filter((r) => r.isGeneral || (!r.isMajor && !r.isGeneral))
    .map((r) => ({ subject: r.subject, credit: r.credit, kind: r.kind }));

  const totalCredit = rows.reduce((sum, r) => sum + (Number(r.credit) || 0), 0);

  return { hasMorning, freeDays, majors, generals, totalCredit };
};

//Dashboard/TimetableSummary 모두에서 사용