// src/pages/TimetableRecommendation/Timetable.jsx
import React, { useEffect, useState } from "react";
import "../../styles/Timetable.css";
import { get } from "../../api";
import config from "../../config";

const days = ["월", "화", "수", "목", "금"];
const hourStart = 8;
const hourEnd = 20;

const dayMap = { 1: "월", 2: "화", 3: "수", 4: "목", 5: "금", 6: "토", 7: "일" };
const toMin = (t) => (t ? t.split(":").map(Number)[0] * 60 + t.split(":").map(Number)[1] : null);
const overlap = (a, b) => a.day === b.day && Math.max(toMin(a.start), toMin(b.start)) < Math.min(toMin(a.end), toMin(b.end));

/** DETAIL 한 건 조회(학점/교수용) */
async function fetchDetail(id) {
  const res = await get(config.SUBJECT.DETAIL(id));
  return res?.result ?? {};
}

/** 조건 → 시간표 블록 생성 */
async function buildSchedule(conditions) {
  const { selectedSubjects = [], credit: targetRaw, preferredTimes = [], avoidDays = [] } = conditions || {};
  const target = Number(targetRaw) || 0;

  // 1) LIST 로드(이제 dayOfWeek/start/end/카테고리 포함됨)
  const listRes = await get(config.SUBJECT.LIST, { sortBy: "id", direction: "asc" });
  const list = Array.isArray(listRes?.result) ? listRes.result : [];

  // 2) 후보 정리
  const avoidSet = new Set(avoidDays.map((d) => d.replace("요일", "").trim())); // "월요일" -> "월"
  const base = list
    .map((s) => ({
      id: s.id,
      name: s.name,
      day: dayMap[s.dayOfWeek] || null,
      start: (s.start || "").slice(0, 5),
      end: (s.end || "").slice(0, 5),
      courseType: s.courseType || "",
      category: s.category || s.discipline || "",
    }))
    .filter((s) => s.day && !avoidSet.has(s.day)); // 요일 없음/회피 요일 제외

  const requiredIds = new Set(selectedSubjects.map((x) => Number(x)));
  const required = base.filter((s) => requiredIds.has(Number(s.id)));
  const optional = base.filter((s) => !requiredIds.has(Number(s.id)));

  // 3) 필수 선배치(충돌 검사)
  const chosen = [];
  for (const r of required) {
    if (chosen.some((c) => overlap(c, r))) throw new Error(`필수 과목 시간 충돌: ${r.name}`);
    chosen.push(r);
  }

  // 4) 필수/선택 학점 합산(필수 먼저 DETAIL로 신뢰 학점 확보)
  let totalCredit = 0;
  const creditMap = new Map();
  for (const r of chosen) {
    const d = await fetchDetail(r.id);
    const cr = Number(d.credit || 0);
    creditMap.set(r.id, cr);
    totalCredit += cr;
  }
  if (target && totalCredit > target) throw new Error(`필수 과목 학점(${totalCredit})이 희망 학점(${target}) 초과`);

  // 5) 가점 정렬(오전/오후 선호)
  const preferMorning = preferredTimes.includes("오전");
  const preferAfternoon = preferredTimes.includes("오후");
  const scored = optional
    .map((s) => {
      let score = 0;
      const sm = toMin(s.start);
      if (sm != null) {
        if (preferMorning && sm < 12 * 60) score += 2;
        if (preferAfternoon && sm >= 12 * 60) score += 2;
      }
      return { ...s, score, startMin: sm };
    })
    .sort((a, b) => b.score - a.score || (a.startMin ?? 0) - (b.startMin ?? 0));

  // 6) 충돌 없이 채우기(필요할 때만 DETAIL로 학점 조회)
  for (const s of scored) {
    if (target && totalCredit >= target) break;
    if (chosen.some((c) => overlap(c, s))) continue;

    let cr = creditMap.get(s.id);
    if (cr == null) {
      const d = await fetchDetail(s.id);
      cr = Number(d.credit || 0);
      creditMap.set(s.id, cr);
    }
    if (target && totalCredit + cr > target) continue;

    chosen.push(s);
    totalCredit += cr;
  }

  const palette = ["#8ecae6", "#ffb703", "#90be6d", "#f94144", "#f8961e", "#43aa8b", "#577590", "#a05195"];
  let idx = 0;
  
  // 7) 블록 변환
  const blocks = chosen.map((c) => ({
    subject: c.name + (requiredIds.has(Number(c.id)) ? "(필수)" : ""),
    day: c.day,
    start: c.start,
    end: c.end,
    type: c.category,
    color: requiredIds.has(Number(c.id)) ? "#8ecae6" : palette[idx++ % palette.length],
  }));

  return { blocks, totalCredit, count: chosen.length };
}

const Timetable = ({ conditions, data: dataProp, onGenerated, isModal = false, isMini = false }) => {
  const [data, setData] = useState([]); // ✅ 누락된 상태 추가
  const [summary, setSummary] = useState({ totalCredit: 0, count: 0 });
  const [loading, setLoading] = useState(false);
  const displayOnly = Array.isArray(dataProp);

  const rowHeight = isMini ? 30 : 60;
  const timeFontSize = isMini ? 8 : 16;
  const labelWidth = isMini ? 30 : 50;
  const labelHeight = isMini ? 20 : 30;
  const colWidth = isMini ? 60 : isModal ? 90 : 120;
  const totalHours = hourEnd - hourStart;
  const height = totalHours * rowHeight + labelHeight;
  const width = days.length * colWidth + labelWidth;

  const timeToY = (time) => {
    const [h, m] = time.split(":").map(Number);
    return ((h - hourStart) * 60 + m) * (rowHeight / 60);
  };

  // 최신 onGenerated를 보관하는 ref (의존성에서 제외)
  const onGeneratedRef = React.useRef(onGenerated);
  useEffect(() => {
    onGeneratedRef.current = onGenerated;
  }, [onGenerated]);

  useEffect(() => {
    // ✅ 표시 전용: 저장된 data로 즉시 세팅하고 종료
    if (displayOnly) {
      setLoading(false);
      setData(dataProp);
      return;
    }
    if (!conditions) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const { blocks, totalCredit, count } = await buildSchedule(conditions);
        if (cancelled) return;
        setData(blocks);
        setSummary({ totalCredit, count });
        onGeneratedRef.current?.({ blocks, totalCredit, count });
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setData([]);
        setSummary({ totalCredit: 0, count: 0 });
        alert(e.message || "시간표 생성 중 오류가 발생했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [conditions, displayOnly, dataProp]);

  if (loading) return <div style={{ padding: 8 }}>시간표 생성 중…</div>;
  if (!data.length) return <div style={{ padding: 8 }}>조건에 맞는 시간표가 없습니다.</div>;

  return (
    <div>
      <svg className="timetable-svg" width={width} height={height}>
        {/* 시간 라인 */}
        {Array.from({ length: totalHours + 1 }).map((_, i) => {
          const y = labelHeight + i * rowHeight;
          return (
            <g key={`time-${i}`}>
              <line x1={labelWidth} y1={y} x2={width} y2={y} className="timetable-line" />
              <text x={labelWidth - 5} y={y + 15} fontSize={timeFontSize} textAnchor="end" className="timetable-time-label">
                {hourStart + i}:00
              </text>
            </g>
          );
        })}

        {/* 요일 라인 */}
        {days.map((day, i) => {
          const x = labelWidth + i * colWidth;
          return (
            <g key={`day-${day}`}>
              <line x1={x} y1={labelHeight} x2={x} y2={height} className="timetable-line" />
              <text x={x + colWidth / 2} y={labelHeight - 8} fontSize={timeFontSize} textAnchor="middle" className="timetable-day-label">
                {day}
              </text>
            </g>
          );
        })}

        {/* 블록 */}
        {data.map((course, idx) => {
          const dayIndex = days.indexOf(course.day);
          if (dayIndex === -1) return null;
          const x = labelWidth + dayIndex * colWidth;
          const y = labelHeight + timeToY(course.start);
          const h = timeToY(course.end) - timeToY(course.start);
          const m = course.subject.match(/^(.+?)\((.+)\)$/);
          const main = m ? m[1] : course.subject;
          const sub = m ? `(${m[2]})` : "";

          return (
            <g key={`class-${idx}`}>
              <rect x={x + 1} y={y + 1} width={colWidth - 2} height={h - 2} fill={course.color || "#ccc"} rx={6} />
              <text x={x + colWidth / 2} y={y + h / 2} fontSize={timeFontSize} textAnchor="middle" className="timetable-class-text">
                <tspan x={x + colWidth / 2} dy="-5">{main}</tspan>
                {sub && <tspan x={x + colWidth / 2} dy={isMini ? "12" : "25"}>{sub}</tspan>}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default Timetable;
