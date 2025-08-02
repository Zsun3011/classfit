import React from "react";
import "../../styles/Timetable.css";

// 요일 배열, 시작/끝 시간, 셀 크기 설정
const days = ["월", "화", "수", "목", "금"];
const hourStart = 8;       // 수업 시작 시간
const hourEnd = 20;        // 수업 종료 시간
const rowHeight = 60;      // 한 시간당 세로 높이(px)
const colWidth = 120;      // 요일 한 칸의 가로 너비(px)
const labelWidth = 50;     // 시간 라벨용 왼쪽 여백
const labelHeight = 30;    // 요일 라벨용 상단 여백

// 예시 시간표 데이터
export const exampleData = [
  { subject: "자료구조(필수)", day: "월", start: "09:00", end: "10:30", color: "#8ecae6", type: "major" },
  { subject: "웹프로그래밍(선택)", day: "수", start: "13:00", end: "15:00", color: "#ffb703", type: "general" },
  { subject: "확률과 통계(필수)", day: "금", start: "10:30", end: "12:00", color: "#90be6d", type: "major" }
];



const Timetable = ({ data = exampleData, isModal = false, isMini = false }) => {
  const rowHeight = isMini ? 30 : 60;
  const timeFontSize = isMini ? 8 : 16;
  const labelWidth = isMini ? 30 : 50;
  const labelHeight = isMini ? 20 : 30;


  const colWidth = isMini ? 60 : isModal ? 90 : 120;
  const totalHours = hourEnd - hourStart;
  const height = totalHours * rowHeight + labelHeight;  // 총 세로 길이 (시간 + 라벨)
  const width = days.length * colWidth + labelWidth;    // 총 가로 길이 (요일 + 라벨)
  
  // 시간 문자열 ("09:30")을 y 좌표(px)로 변환
  function timeToY(time) {
    const [hour, minute] = time.split(":").map(Number);
    const totalMinutes = (hour - hourStart) * 60 + minute;
    return totalMinutes * (rowHeight / 60);
  }

  return (
    <svg className="timetable-svg" width={width} height={height}>
      
      {/* 시간 가로줄 + 시간 텍스트 (왼쪽 라벨) */}
      {Array.from({ length: totalHours + 1 }).map((_, i) => {
        const y = labelHeight + i * rowHeight;  // y 좌표는 labelHeight 아래부터 시작
        return (
          <g key={`time-${i}`}>
            <line
              x1={labelWidth} y1={y}
              x2={width} y2={y}
              className="timetable-line"
            />
            <text
              x={labelWidth - 5}
              y={y + 15}
              fontSize={timeFontSize}
              textAnchor="end"
              className="timetable-time-label"
            >
              {hourStart + i}:00
            </text>
          </g>
        );
      })}

      {/* 요일 세로줄 + 요일 라벨 텍스트 (상단) */}
      {days.map((day, i) => {
        const x = labelWidth + i * colWidth;
        return (
          <g key={`day-${day}`}>
            <line
              x1={x} y1={labelHeight}
              x2={x} y2={height}
              className="timetable-line"
            />
            <text
              x={x + colWidth / 2}
              y={labelHeight - 8}
              fontSize={timeFontSize}
              textAnchor="middle"
              className="timetable-day-label"
            >
              {day}
            </text>
          </g>
        );
      })}

      {/* 강의 블록 */}
      {data.map((course, index) => {
        const dayIndex = days.indexOf(course.day);
        if (dayIndex === -1) return null;

        // x, y 좌표 계산 (요일/시간 기반)
        const x = labelWidth + dayIndex * colWidth;
        const y = labelHeight + timeToY(course.start);
        const height = timeToY(course.end) - timeToY(course.start);

        const match = course.subject.match(/^(.+?)\((.+)\)$/);
        const mainTitle = match ? match[1] : course.subject;
        const detail = match ? `(${match[2]})` : "";

        return (
          <g key={`class-${index}`}>
            <rect
              x={x + 1}
              y={y + 1}
              width={colWidth - 2}
              height={height - 2}
              fill={course.color || "#ccc"}
              rx={6}  // 테두리
            />
            <text
              x={x + colWidth / 2}
              y={y + height / 2}
              fontSize={timeFontSize}
              textAnchor="middle"
              className="timetable-class-text"
            >
              <tspan x={x + colWidth / 2} dy="-5">{mainTitle}</tspan>
              {detail && (
                <tspan x={x + colWidth / 2} dy={isMini ? "12" : "25"}>{detail}</tspan>
              )}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default Timetable;
