import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BaseTimetable from "../../components/BaseTimetable";
import "../../styles/Home.css";
import Timetable from "../Timetable/Timetable";
import { getDashboardInfo } from "../../components/dashboardUtils";
import { get } from "../../api";
import config from "../../config";

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
        // 내 시간표 목록 가져오기
        const res = await get(config.TIMETABLE.LIST);
        const list = Array.isArray(res) ? res : res?.result || [];

        // timetableId 기준 최신 하나 선택
        const latest = list.sort((a,b)=> (b.timetableId||0)-(a.timetableId||0))[0];
        if (latest) {
          setConfirmedTable(latest);
        }
      } catch (e) {
        console.error("시간표 불러오기 실패", e);
      }
    }
    fetchConfirmed();
  }, []);

  // Timetable 생성 결과(blocks 등)를 받아 요약 갱신
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

  return (
    <div className="TimetableSummary-container">
      {!confirmedTable && <div className="TimetableSummary-overlay"></div>}
      <div className="TimetableSummary-container-title">나의 시간표</div>

      <div className="TimetableSummary-section-top">
        {confirmedTable ? (
          <Timetable data={confirmedTable.timeSlots} onGenerated={handleGenerated} />
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
