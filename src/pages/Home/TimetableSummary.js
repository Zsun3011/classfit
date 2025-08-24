import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BaseTimetable from "../../components/BaseTimetable";
import "../../styles/Home.css";
import Timetable from "../Timetable/Timetable";
import { getDashboardInfo } from "../../components/dashboardUtils";
import { get } from "../../api";
import config from "../../config";
import { slotsToBlocks } from "../Timetable/timetableFormat";

const TimetableSummary = () => {
  const [confirmedTable, setConfirmedTable] = useState(null);
  const [info, setInfo] = useState({
    totalCredits: 0,
    hasMorning: false,
    freeDay: "-",
    major: [],
    general: [],
  });
  const navigate = useNavigate();

  const handleCreateTable = () => {
    navigate("/Timetable");
  };

  useEffect(() => {
    async function fetchConfirmed() {
      try {
        const res = await get(config.TIMETABLE.MAIN);
        const main = res?.result ?? res;
        if (main) setConfirmedTable(main);
      } catch (e) {
        console.error("시간표 불러오기 실패", e);
      }
    }
    fetchConfirmed();
  }, []);

  const handleGenerated = useCallback(({ blocks, totalCredit }) => {
    const { hasMorning, freeDays, majors, generals } = getDashboardInfo(blocks);
    setInfo({
      totalCredits: totalCredit ?? 0,
      hasMorning,
      freeDay: freeDays.length ? freeDays.join(", ") : "-",
      major: majors.map((m) => `${m.subject} (${m.kind}, ${m.credit}학점)`),
      general: generals.map((g) => `${g.subject} (${g.kind}, ${g.credit}학점)`),
    });
  }, []);

  const blocks = useMemo(() => {
    const id = confirmedTable?.timetableId;
    const stored = id ? localStorage.getItem(`timetableColors:${id}`) : null;
    const colorMap = stored ? JSON.parse(stored) : null;
    return slotsToBlocks(confirmedTable?.timeSlots || [], { withColor: !colorMap, colorMap });
  }, [confirmedTable]);

  useEffect(() => {
    if (!blocks.length) return;
    const totalCredit = blocks.reduce((s, b) => s + (Number(b.credit) || 0), 0);
    handleGenerated({ blocks, totalCredit });
  }, [blocks, handleGenerated]);

  return (
    <div className="TimetableSummary-container">
      {!confirmedTable && <div className="TimetableSummary-overlay"></div>}
      <div className="TimetableSummary-container-title">나의 시간표</div>
      <div className="TimetableSummary-section-top">
        {confirmedTable ? (
          <Timetable data={blocks} onGenerated={handleGenerated} />
        ) : (
          <BaseTimetable />
        )}
      </div>
      {!confirmedTable && (
        <div className="TimetableSummary-wrapper">
          <div className="wrapper-label">아직 나의 시간표가 만들어지지 않았어요.</div>
          <div className="wrapper-descriptor">
            당신의 학업 요구에 맞는 시간표를 AI가 추천해드립니다.
          </div>
          <button className="wrapper-button" onClick={handleCreateTable}>
            시간표 생성
          </button>
        </div>
      )}
      <div className="TimetableSummary-section-bottom">
        <div className="dashboard-section1">
          <div className="dashboard-subtitle">수강 정보</div>
          <div className="dashboard-list1">
            <div>
              <span className="dashboard-label">• 학점:</span>{" "}
              <span className="dashboard-value highlight">{info.totalCredits}</span>
            </div>
            <div>
              <span className="dashboard-label">• 오전 수업 포함 여부:</span>{" "}
              <span className="dashboard-value">{info.hasMorning ? "O" : "X"}</span>
            </div>
            <div>
              <span className="dashboard-label">• 공강:</span>{" "}
              <span className="dashboard-value highlight">{info.freeDay}</span>
            </div>
          </div>
        </div>
        <div className="dashboardsection-container">
          <div className="dashboard-section">
            <div className="dashboard-subtitle">전공</div>
            <ul className="dashboard-list">
              {info.major.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="dashboard-section">
            <div className="dashboard-subtitle">교양</div>
            <ul className="dashboard-list">
              {info.general.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableSummary;
