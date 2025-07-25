import React from "react";
import "../styles/Timetable.css";

// 요일 배열, 시작/끝 시간, 셀 크기 설정
const days = ["월", "화", "수", "목", "금"];
const hourStart = 8;  //수업 시작 시간
const hourEnd = 20; // 수업 종료 시간
const rowHeight = 50; // 한 시간당 세로 높이(px)
const colWidth = 115; // 요일 한 칸의 가로 너비(px)
const labelWidth = 50; // 시간 라벨용 왼쪽 여백
const labelHeight = 30; // 요일 라벨용 상단 여백

// 시간 문자열 ("09:30")을 y 좌표(px)로 변환
function timeToY(time) {
  const [hour, minute] = time.split(":").map(Number);
  const totalMinutes = (hour - hourStart) * 60 + minute;
  return totalMinutes * (rowHeight / 60);
}

const BaseTimetable = ({ data = [] }) => {
  const totalHours = hourEnd - hourStart;
  const height = totalHours * rowHeight + labelHeight;
  const width = days.length * colWidth + labelWidth;

  return (
    <svg className="timetable-svg" width={width} height={height}>
      {/* 시간 가로줄 + 시간 텍스트 */}
      {Array.from({ length: totalHours + 1 }).map((_, i) => {
        const y = labelHeight + i * rowHeight;
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
              textAnchor="end"
              className="timetable-time-label"
            >
              {hourStart + i}:00
            </text>
          </g>
        );
      })}

      {/* 요일 세로줄 + 요일 라벨 */}
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
              textAnchor="middle"
              className="timetable-day-label"
            >
              {day}
            </text>
          </g>
        );
      })}

      {/* 강의 블록 (현재는 빈 배열이라 렌더링 안 됨) */}
      {data.map((course, index) => {
        const dayIndex = days.indexOf(course.day);
        if (dayIndex === -1) return null;

        const x = labelWidth + dayIndex * colWidth;
        const y = labelHeight + timeToY(course.start);
        const height = timeToY(course.end) - timeToY(course.start);

        return (
          <g key={`class-${index}`}>
            <rect
              x={x + 1}
              y={y + 1}
              width={colWidth - 2}
              height={height - 2}
              fill={course.color || "#ccc"}
              rx={6}
            />
            <text
              x={x + colWidth / 2}
              y={y + height / 2}
              textAnchor="middle"
              className="timetable-class-text"
            >
              {course.subject}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default BaseTimetable;