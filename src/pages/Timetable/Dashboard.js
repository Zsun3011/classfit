import React, { useMemo } from "react";
import "../../styles/Dashboard.css";
import { getDashboardInfo } from "../../components/dashboardUtils";
import { slotsToBlocks } from "./timetableFormat"; 

const Dashboard = ({ data = [], totalCredit }) => {
  // 1) 들어온 data가 slots인지 blocks인지 감지해서 blocks로 정규화
  const blocks = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    const first = data[0] ?? {};
    // slots signature: startTime/endTime 존재 or day가 숫자(1~7)
    const looksLikeSlots = "startTime" in first || typeof first?.day === "number";
    return looksLikeSlots ? slotsToBlocks(data) : data;
  }, [data]);

  // 2) 요약 정보 계산(오전 포함/공강 등은 블록 기준 유지)
  const { hasMorning, freeDays, majors, generals } = useMemo(
    () => getDashboardInfo(blocks),
    [blocks]
  );

  // 3) 학점 자동 계산 (prop 우선, 없으면 과목 단위 dedupe 합산)
  const credit = useMemo(() => {
    if (typeof totalCredit === "number") return totalCredit;
    // key: id 우선, 없으면 subject
    return Array.from(
      new Map(
        (blocks || []).map((b) => [String(b?.id ?? b?.subject ?? ""), Number(b?.credit ?? 0)])
      ).values()
    ).reduce((s, c) => s + c, 0);
  }, [blocks, totalCredit]);

  // 4) 렌더링 시점에 리스트 중복 제거(과목 단위)
  const renderList = (list) =>
    (list && list.length
      ? Array.from(
          new Map(
            list.map((c) => [String(c?.id ?? c?.subject ?? ""), c])
          ).values()
        ).map((c) => (
          <li key={c.id ?? c.subject}>
            • {c.subject} ({c.kind}, {c.credit}학점)
          </li>
        ))
      : [<li key="empty">• -</li>]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-section">
        <div className="dashboard-subtitle">수강 정보</div>
        <div className="dashboard-list">
          <div>
            • 학점: <span className="highlight">{credit}학점</span>
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
