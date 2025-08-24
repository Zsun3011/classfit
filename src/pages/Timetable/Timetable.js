// src/pages/TimetableRecommendation/Timetable.jsx
import React, { useEffect, useState } from "react";
import "../../styles/Timetable.css";
import { get } from "../../api";
import config from "../../config";

const days = ["월", "화", "수", "목", "금"];
const hourStart = 8;
const hourEnd = 20;

const dayMap = { 1: "월", 2: "화", 3: "수", 4: "목", 5: "금", 6: "토", 7: "일" };
const dayRev = { "월":1, "화":2, "수":3, "목":4, "금":5, "토":6, "일":7 };

const toMin = (t) => (t ? t.split(":").map(Number)[0] * 60 + t.split(":").map(Number)[1] : null);
const overlap = (a, b) => a.day === b.day && Math.max(toMin(a.start), toMin(b.start)) < Math.min(toMin(a.end), toMin(b.end));
const palette = ["#8ecae6","#ffb703","#90be6d","#f94144","#f8961e","#43aa8b","#577590","#a05195"];

/** 과목 한 개 → 1~2개의 미팅 블록 배열로 변환 */
const extractMeetings = (s) => {
  const m = [];
  const add = (dayNum, start, end) => {
    if (!dayNum || !start || !end) return;
    m.push({
      dayNum,
      day: dayMap[dayNum] || null,
      start: (start || "").slice(0,5),
      end: (end || "").slice(0,5),
    });
  };
  add(s.dayOfWeek, s.start, s.end);
  add(s.dayOfWeek2nd, s.start2nd, s.end2nd);
  return m.filter(x => x.day);
};

/** DETAIL 한 건 조회(학점/교수/카테고리 보정용) */
async function fetchDetail(id) {
  const res = await get(config.SUBJECTS.DETAIL(id));
  return res?.result ?? {};
}

/** 조건 → 시간표 블록 생성 (두 요일 지원) */
async function buildSchedule(conditions) {
  const { selectedSubjects = [], credit: targetRaw, preferredTimes = [], avoidDays = [] } = conditions || {};
  const target = Number(targetRaw) || 0;

  // 1) 전체 과목 목록 로드
  const listRes = await get(config.SUBJECTS.LIST, { sortBy: "id", direction: "asc" });
  const list = Array.isArray(listRes?.result) ? listRes.result : [];

  // 2) 회피 요일, 선호 시간 준비
  const avoidSet = new Set(avoidDays.map((d) => d.replace("요일", "").trim())); // "월요일" -> "월"
  const preferMorning = preferredTimes.includes("오전");
  const preferAfternoon = preferredTimes.includes("오후");

  // 3) 후보 과목 정리(과목 단위; 과목마다 meetings=1~2개)
  const allCourses = list.map((s) => {
    const meetings = extractMeetings(s).filter(m => !avoidSet.has(m.day)); // 회피 요일 제거
    return {
      id: s.id,
      name: s.name,
      category: s.category || s.courseType || s.discipline || "",
      courseType: s.courseType || "",
      meetings, // [{day,dayNum,start,end}, ...]
    };
  }).filter(c => c.meetings.length > 0); // 미팅이 하나도 없으면 제외

  const requiredSet = new Set((selectedSubjects || []).map(Number));
  const requiredCourses = allCourses.filter(c => requiredSet.has(Number(c.id)));
  const optionalCourses = allCourses.filter(c => !requiredSet.has(Number(c.id)));

  // 4) 충돌 검사 헬퍼(과목 단위로 미팅 전체 확인)
  const hasConflict = (course, chosenMeetings) => {
    for (const m of course.meetings) {
      for (const cm of chosenMeetings) {
        if (overlap(
          { day: m.day, start: m.start, end: m.end },
          { day: cm.day, start: cm.start, end: cm.end }
        )) return true;
      }
    }
    return false;
  };

  // 5) 선택 결과(과목 단위) 및 학점 집계
  const chosenCourses = [];
  const chosenMeetings = []; // 모든 선택 과목의 meeting들을 평탄화해서 보관
  let totalCredit = 0;

  // 학점을 캐시해 불필요한 DETAIL 호출 줄이기
  const creditCache = new Map();
  const getCredit = async (courseId) => {
    if (creditCache.has(courseId)) return creditCache.get(courseId);
    const d = await fetchDetail(courseId);
    const cr = Number(d.credit || 0);
    creditCache.set(courseId, cr);
    return cr;
  };

  // 6) 필수 과목부터 배치
  for (const c of requiredCourses) {
    if (hasConflict(c, chosenMeetings)) {
      throw new Error(`필수 과목 시간 충돌: ${c.name}`);
    }
    const cr = await getCredit(c.id);
    chosenCourses.push({ ...c, required: true, credit: cr });
    chosenMeetings.push(...c.meetings);
    totalCredit += cr;
  }
  if (target && totalCredit > target) throw new Error(`필수 과목 학점(${totalCredit})이 희망 학점(${target}) 초과`);

  // 7) 선택 과목 스코어링(오전/오후 선호)
  const scoredOptional = optionalCourses.map(c => {
    // 과목의 '대표' 시작시간(가장 이른 미팅의 시작)을 기준으로 가점
    const starts = c.meetings.map(m => toMin(m.start)).filter(x => x != null);
    const first = starts.length ? Math.min(...starts) : null;
    let score = 0;
    if (first != null) {
      if (preferMorning && first < 12 * 60) score += 2;
      if (preferAfternoon && first >= 12 * 60) score += 2;
    }
    return { ...c, score, first };
  }).sort((a,b)=> b.score - a.score || (a.first ?? 0) - (b.first ?? 0));

  // 8) 충돌 없이 채우기(+ 목표 학점 고려)
  for (const c of scoredOptional) {
    if (target && totalCredit >= target) break;
    if (hasConflict(c, chosenMeetings)) continue;
    const cr = await getCredit(c.id);
    if (target && totalCredit + cr > target) continue;
    chosenCourses.push({ ...c, required: false, credit: cr });
    chosenMeetings.push(...c.meetings);
    totalCredit += cr;
  }

  // 9) 색상: 과목 단위로 하나의 색을 배정(두 블록도 동일 색)
  const colorMap = new Map();
  let colorIdx = 0;
  const pickColor = (cid) => {
    if (!colorMap.has(cid)) colorMap.set(cid, palette[colorIdx++ % palette.length]);
    return colorMap.get(cid);
  };

  // 10) 화면용 블록으로 변환(과목→1~2 블록)
  const blocks = [];
  for (const c of chosenCourses) {
    const color = pickColor(c.id);
    for (const m of c.meetings) {
      blocks.push({
        id: c.id,
        subject: c.name,           // ✅ 제목에 "(필수)" 붙이지 않음
        day: m.day,
        dayNum: m.dayNum || dayRev[m.day] || 1,
        start: m.start,
        end: m.end,
        category: c.category,
        type: c.category,
        credit: c.credit ?? 0,
        professor: "",             // 필요 시 DETAIL에서 추가 가능
        color,
        required: !!c.required,    // ✅ 필수 여부는 별도 플래그로 관리
      });
    }
  }

  return { blocks, totalCredit, count: chosenCourses.length };
}

const Timetable = ({ conditions, data: dataProp, onGenerated, isModal = false, isMini = false }) => {
  const [data, setData] = useState([]);
  const [, setSummary] = useState({ totalCredit: 0, count: 0 });
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

  const onGeneratedRef = React.useRef(onGenerated);
  useEffect(() => { onGeneratedRef.current = onGenerated; }, [onGenerated]);

  useEffect(() => {
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

          // 줄바꿈 처리
          const main = course.subject;
          const maxChars = Math.max(4, Math.floor(colWidth / (timeFontSize * 0.8)));
          const lines = main.match(new RegExp(`.{1,${maxChars}}`, "g")) || [main];
          const lineGap = isMini ? 12 : 18;
          const startY = y + h / 2 - ((lines.length - 1) * lineGap) / 2;

          return (
            <g key={`class-${idx}`}>
              <rect x={x+1} y={y+1} width={colWidth-2} height={h-2} fill={course.color||"#ccc"} rx={6}/>
              <text x={x+colWidth/2} y={startY} fontSize={timeFontSize} textAnchor="middle" className="timetable-class-text">
                {lines.map((line,i)=>
                  <tspan key={i} x={x+colWidth/2} dy={i?lineGap:0}>{line}</tspan>
                )}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default Timetable;
