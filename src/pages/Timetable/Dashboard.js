// src/pages/TimetableRecommendation/Dashboard.jsx
import React, { useMemo } from "react";
import "../../styles/Dashboard.css";

const toMin = (t) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const DAYS = ["월", "화", "수", "목", "금"];

const Dashboard = ({ data = [], totalCredit = "-", preferredTimes = [], avoidDays = [] }) => {
  const { hasMorning, freeDays, majors, generals } = useMemo(() => {
    const morning = data.some((c) => {
      const m = toMin(c.start);
      return m != null && m < 12 * 60;
    });

    const occupied = new Set(data.map((c) => c.day).filter(Boolean));
    const free = DAYS.filter((d) => !occupied.has(d));

    const majors = data
      .filter((c) => c.type?.includes("전"))
      .map((c) => ({
        subject: c.subject,
        credit: c.credit ?? "-",
        kind: c.type.includes("필") ? "필수" : "선택",
      }));

    const generals = data
      .filter((c) => c.type?.includes("교"))
      .map((c) => ({
        subject: c.subject,
        credit: c.credit ?? "-",
        kind: c.type.includes("필") ? "필수" : "선택",
      }));

    return { hasMorning: morning, freeDays: free, majors, generals };
  }, [data]);

  const renderList = (list) =>
    list.length
      ? list.map((c, i) => (
          <li key={i}>
            • {c.subject} ({c.kind}, {c.credit}학점)
          </li>
        ))
      : <li>• -</li>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-section">
        <div className="dashboard-subtitle">수강 정보</div>
        <div className="dashboard-list">
          <div>• 학점: <span className="highlight">{totalCredit}학점</span></div>
          <div>• 오전 수업 포함 여부: {hasMorning ? "O" : "X"}</div>
          <div>• 공강: <span className="highlight">{freeDays.length ? freeDays.join(", ") : "-"}</span></div>
        </div>
      </div>

      <div className="dashboardsection-container">
        <div className="dashboard-section">
          <div className="dashboard-subtitle">전공</div>
          <ul className="dashboard-list">{renderList(majors)}</ul>
        </div>
        <div className="dashboard-section">
          <div className="dashboard-subtitle">교양</div>
          <ul className="dashboard-list">{renderList(generals)}</ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
