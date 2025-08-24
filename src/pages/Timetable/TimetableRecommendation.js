// src/pages/TimetableRecommendation/TimetableRecommendation.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import Banner from "./Banner";
import TableCard from "./TableCard";
import InputConditionForm from "./InputConditionForm";
import Timetable from "./Timetable";
import Dashboard from "./Dashboard";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import api, { get, post } from "../../api";
import config from "../../config";
import { slotsToBlocks, blocksToSlots } from "./timetableFormat";

const TimetableRecommendation = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [conditions, setConditions] = useState(null);
  const [latestBlocks, setLatestBlocks] = useState([]);
  const [latestSummary, setLatestSummary] = useState({ totalCredit: 0, count: 0 });
  const [mainTimetableId, setMainTimetableId] = useState(null);

  const itemsPerPage = 2;
  const savedTableRef = useRef(null);
  const navigate = useNavigate();

  // API 함수들
  const fetchMainTimetable = async () => {
    try {
      const res = await get(config.TIMETABLE.MAIN);
      const main = res?.result ?? res;
      setMainTimetableId(main?.timetableId ?? null);
    } catch (e) {
      console.error("Failed to get main timetable", e);
      setMainTimetableId(null);
    }
  };

  const refreshTimetables = async () => {
    try {
      const res = await get(config.TIMETABLE.LIST);
      const list = Array.isArray(res) ? res : (res?.result || []);
      const sortedList = list.sort((a, b) => (b.timetableId || 0) - (a.timetableId || 0));
      setTables(sortedList);
    } catch (e) {
      console.error("Failed to list timetables", e);
    }
  };

  useEffect(() => {
    refreshTimetables();
    fetchMainTimetable();
  }, []);

  const handleGenerated = useCallback(({ blocks, totalCredit, count }) => {
    setLatestBlocks(blocks);
    setLatestSummary({ totalCredit, count });
  }, []);

  const indexMap = React.useMemo(() => {
  const asc = [...tables].sort((a, b) => (a.timetableId || 0) - (b.timetableId || 0));
  const map = new Map();
  asc.forEach((t, i) => map.set(t.timetableId, i + 1)); // 오래된=1
  return map;
}, [tables]);

  // 저장
  const handleSaveTable = async ({ silent = false } = {}) => {
    if (!latestBlocks?.length || !conditions) {
      if (!silent) alert("먼저 시간표를 생성해 주세요.");
      return null;
    }
    try {
      const preferCredit = Number(conditions.credit || 0);
      const pt = conditions.preferredTimes || [];
      const preferTime = pt.length ? pt.join(",") : "오전,오후";

      const morningClassNum = latestBlocks.filter((b) => {
        const [h] = (b.start || "00:00").split(":").map(Number);
        return h < 12;
      }).length;

      const DAYS = ["월", "화", "수", "목", "금"];
      const occupied = new Set(latestBlocks.map((b) => b.day));
      const freePeriodNum = DAYS.filter((d) => !occupied.has(d)).length;

      const essentialCourse = Array.from(
        new Set(latestBlocks.filter((b) => b.required).map((b) => b.subject))
      ).join(",");

      const payload = {
        preferCredit,
        preferTime,
        morningClassNum,
        freePeriodNum,
        essentialCourse,
        graduationRate: 0,
        timeSlots: blocksToSlots(latestBlocks),
      };

      const created = await post(config.TIMETABLE.CREATE, payload);
      const newId = created?.timetableId ?? created?.result?.timetableId;

      if (newId) {
        const colorMap = Object.fromEntries(
          latestBlocks
            .filter((b) => b?.id != null && b?.color)
            .map((b) => [String(b.id), b.color])
        );
        localStorage.setItem(`timetableColors:${newId}`, JSON.stringify(colorMap));
      }

      await refreshTimetables();
      if (!silent) alert("시간표가 저장되었습니다.");
      return newId || null;
    } catch (e) {
      console.error("Failed to create timetable", e);
      if (!silent) alert("시간표 저장 중 오류가 발생했습니다.");
      return null;
    }
  };



  // 삭제
  const handleDeleteTable = async (timetableId) => {
    try {
      if (mainTimetableId && timetableId === mainTimetableId) {
        alert("확정된 시간표는 삭제할 수 없습니다.");
        return;
      }
      await api.delete(config.TIMETABLE.DELETE(timetableId));
      await refreshTimetables();
      setSelectedTable(null);
      alert("시간표가 삭제되었습니다.");
    } catch (e) {
      console.error("Failed to delete timetable", e);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 확정
  const handleConfirmTable = async (timetableIdOverride) => {
    let targetId = timetableIdOverride ?? selectedTable?.timetableId;

    // 아직 저장된 시간표가 없으면 자동 저장 시도
    if (!targetId) {
      const newId = await handleSaveTable({ silent: true });
      if (!newId) {
        alert("시간표가 없습니다. 조건 입력 후 생성해 주세요.");
        return;
      }
      targetId = newId;
    }

    if (mainTimetableId && targetId === mainTimetableId) {
      alert("이미 확정된 시간표입니다.");
      return;
    }

    try {
      await api.put(config.TIMETABLE.SET_MAIN(targetId));
      setMainTimetableId(targetId);
      await refreshTimetables();
      await fetchMainTimetable();
      alert("시간표를 저장 및 확정했습니다.");
      navigate("/home");
    } catch (e) {
      console.error("Failed to set main timetable", e);
      alert("확정 설정 중 오류가 발생했습니다.");
    }
  };


  // 페이지네이션
  const totalPages = Math.ceil(tables.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentProducts = tables.slice(startIdx, startIdx + itemsPerPage);

  // 뷰모델 생성
  const createTableViewModel = (t, displayIndex) => {
    const key = `timetableColors:${t.timetableId}`;
    const stored = localStorage.getItem(key);
    const colorMap = stored ? JSON.parse(stored) : null;

    const blocks = slotsToBlocks(t.timeSlots || [], { withColor: !colorMap, colorMap });
    const totalCredit = blocks.reduce((sum, b) => sum + (Number(b.credit) || 0), 0);
    const hasMorning = blocks.some((b) => Number((b.start || "00:00").slice(0, 2)) < 12);

    const occupiedDays = new Set(blocks.map((b) => b.day));
    const freeDays = ["월", "화", "수", "목", "금"].filter((d) => !occupiedDays.has(d));

    return {
      id: t.timetableId,
      // ✅ 여기만 인덱스로 표시
      name: `${mainTimetableId === t.timetableId ? "⭐ " : ""}시간표 ${displayIndex}`,
      point: `학점: ${totalCredit}`,
      morning: `오전 수업 포함 여부: ${hasMorning ? "O" : "X"}`,
      gbc: `공강: ${freeDays.join(", ") || "없음"}`,
      data: blocks,
      conditions: {
        preferredTimes: (t.preferTime || "").split(",").filter(Boolean),
        avoidDays: [],
      },
    };
  };

  return (
    <div>
      <Header />
      <Banner
        title="시간표 생성하기"
        text="당신의 학업 요구에 맞는 시간표를 추천해드립니다."
        buttonText="저장된 시간표"
        onButtonClick={() => savedTableRef.current?.scrollIntoView({ behavior: "smooth" })}
      />
      <InputConditionForm onGenerate={setConditions} />

      {conditions && (
        <div className="AiTimetable-container">
          <div className="AiTimetable-title">추천 시간표</div>
          <div className="AiTimetable-section">
            <Timetable conditions={conditions} onGenerated={handleGenerated} />
            <Dashboard
              data={latestBlocks}
              totalCredit={latestSummary.totalCredit}
              preferredTimes={conditions?.preferredTimes}
              avoidDays={conditions?.avoidDays}
            />
          </div>
          <div className="AiTimetable-button">
            <button className="button" onClick={handleSaveTable}>저장하기</button>
            <button className="button" onClick={() => handleConfirmTable(selectedTable?.timetableId)}>확정하기</button>
          </div>
          <div className="AiTimetable-buttonText">*저장하지 않으면 해당 시간표는 삭제됩니다.</div>
        </div>
      )}

      {/* 저장된 시간표 */}
      <div className="Savedtable-cotainer" ref={savedTableRef}>
        <div className="Savedtable-contianer-title">저장된 시간표</div>
        <div className="table-container">
          <div className="table-grid">
            {currentProducts.map((table) => {
              const displayIndex = indexMap.get(table.timetableId) ?? "-";
              const viewModel = createTableViewModel(table, displayIndex);
              return (
                <TableCard
                  key={table.timetableId}
                  table={viewModel}
                  onClick={() =>
                    setSelectedTable({
                      ...table,
                      __blocks: viewModel.data,
                      __vm: viewModel,
                    })
                  }
                />
              );
            })}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="paging">
              {currentPage > 1 && (
                <button className="paging-button" onClick={() => setCurrentPage(prev => prev - 1)}>Prev</button>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`paging-button ${currentPage === page ? "active" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              {currentPage < totalPages && (
                <button className="paging-button" onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
              )}
            </div>
          )}

          {/* 모달 */}
          {selectedTable && (
          <div className="modal-overlay" onClick={() => setSelectedTable(null)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedTable.__vm?.name}</h2>
                <button className="modal-close" onClick={() => setSelectedTable(null)}>×</button>
              </div>
              <div className="modal-content">
                <div className="modal-scroll">
                  <div className="AiTimetable-section-wrapper">
                    <div className="AiTimetable-section">
                      <Timetable data={selectedTable.__blocks || []} isModal={true} />
                      <Dashboard
                        data={selectedTable.__blocks || []}
                        totalCredit={(selectedTable.__blocks || []).reduce((s, b) => s + (Number(b.credit) || 0), 0)}
                        preferredTimes={(selectedTable?.preferTime || "").split(",").filter(Boolean)}
                        avoidDays={[]}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="button-remove"
                    onClick={() => handleDeleteTable(selectedTable.timetableId)}
                  >
                    삭제하기
                  </button>
                  <button
                    className="button"
                    onClick={() => handleConfirmTable(selectedTable?.timetableId)}
                  >
                    확정하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default TimetableRecommendation;
