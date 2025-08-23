import React, { useMemo } from "react";
import "../../styles/Dashboard.css";
import { getDashboardInfo } from "../../components/dashboardUtils";

const Dashboard = ({ data = [], totalCredit = "-" }) => {
  const { hasMorning, freeDays, majors, generals } = useMemo(
    () => getDashboardInfo(data),
    [data]
  );

  const renderList = (list) =>
    list.length ? (
      list.map((c, i) => (
        <li key={i}>
          • {c.subject} ({c.kind}, {c.credit}학점)
        </li>
      ))
    ) : (
      <li>• -</li>
    );

  return (
    <div className="dashboard-container">
      <div className="dashboard-section">
        <div className="dashboard-subtitle">수강 정보</div>
        <div className="dashboard-list">
          <div>
            • 학점: <span className="highlight">{totalCredit}학점</span>
          </div>
          <div>• 오전 수업 포함 여부: {hasMorning ? "O" : "X"}</div>
          <div>
            • 공강: <span className="highlight">
              {freeDays.length ? freeDays.join(", ") : "-"}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-section-container">
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
