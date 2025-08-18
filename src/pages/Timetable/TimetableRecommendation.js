// src/pages/TimetableRecommendation/TimetableRecommendation.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import Banner from "./Banner";
import TableCard from "./TableCard";
import InputConditionForm from "./InputConditionForm";
import Timetable from "./Timetable";
import Dashboard from "./Dashboard";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

const TimetableRecommendation = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [tables, setTables] = useState(() => JSON.parse(localStorage.getItem("savedTables") || "[]"));
  const [lastId, setLastId] = useState(() => parseInt(localStorage.getItem("lastTableId") || "0"));
  const [selectedTable, setSelectedTable] = useState(null);

  const [conditions, setConditions] = useState(null);
  const [latestBlocks, setLatestBlocks] = useState([]);
  const [latestSummary, setLatestSummary] = useState({ totalCredit: 0, count: 0 });

  const itemsPerPage = 2;
  const totalPages = Math.ceil(tables.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentProducts = tables.slice(startIdx, startIdx + itemsPerPage);

  const savedTableRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Timetable에서 생성 완료 시 한 번만 호출되도록 고정
  const handleGenerated = useCallback(({ blocks, totalCredit, count }) => {
    setLatestBlocks(blocks);
    setLatestSummary({ totalCredit, count });
  }, []);

  const handleSaveTable = () => {
    if (!latestBlocks?.length || !conditions) return;
    const newId = lastId + 1;
    const t = {
      id: Date.now(),
      name: `시간표${newId}`,
      point: `학점: ${latestSummary.totalCredit}`,
      morning: `오전 수업 포함 여부: ${conditions.preferredTimes?.includes("오전") ? "O" : "X"}`,
      gbc: `공강: ${conditions.avoidDays?.join(", ") || "없음"}`,
      conditions,
      data: latestBlocks,
      isNew: true,
    };
    setTables([t, ...tables]);
    setLastId(newId);
  };

  const handleConfirmTable = () => {
    if (!conditions) return;
    sessionStorage.setItem("confirmedTable", JSON.stringify({ timetable: conditions }));
    alert("확정된 시간표가 저장되었습니다.");
    navigate("/home");
  };

  const handleDeleteTable = (id) => {
    const next = tables.filter((t) => t.id !== id);
    setTables(next);
    setSelectedTable(null);
    if (next.length === 0) setLastId(0);
  };

  const scrollToSavedTable = () => savedTableRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    localStorage.setItem("savedTables", JSON.stringify(tables));
    localStorage.setItem("lastTableId", String(lastId));
  }, [tables, lastId]);

  return (
    <div>
      <Header />
      <Banner
        title="시간표 생성하기"
        text="당신의 학업 요구에 맞는 시간표를 추천해드립니다."
        buttonText="저장된 시간표"
        onButtonClick={scrollToSavedTable}
      />

      <InputConditionForm onGenerate={(c) => setConditions(c)} />

      {conditions && (
        <div className="AiTimetable-container">
          <div className="AiTimetable-title">추천 시간표</div>
          <div className="AiTimetable-section">
            {/* ✅ JSX 안에서 함수 선언하지 말고, 위에서 useCallback으로 고정한 핸들러 전달 */}
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
            <button className="button" onClick={handleConfirmTable}>확정하기</button>
          </div>
          <div className="AiTimetable-buttonText">*저장하지 않으면 해당 시간표는 삭제됩니다.</div>
        </div>
      )}

      {/* 저장된 시간표 */}
      <div className="Savedtable-cotainer" ref={savedTableRef}>
        <div className="Savedtable-contianer-title">저장된 시간표</div>
        <div className="table-container">
          <div className="table-grid">
            {currentProducts.map((table) => (
              <TableCard key={table.id} table={table} onClick={() => setSelectedTable(table)} />
            ))}
          </div>

          <div className="paging">
            {currentPage > 1 && (
              <button className="paging-button" onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`paging-button ${currentPage === n ? "active" : ""}`}
                onClick={() => setCurrentPage(n)}
              >
                {n}
              </button>
            ))}
            {currentPage < totalPages && (
              <button className="paging-button" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
            )}
          </div>

          {selectedTable && (
            <div className="modal-overlay" onClick={() => setSelectedTable(null)}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{selectedTable.name}</h2>
                  <button className="modal-close" onClick={() => setSelectedTable(null)}>×</button>
                </div>
                <div className="modal-content">
                  <div className="AiTimetable-section-wrapper">
                    <div className="AiTimetable-section">
                      <Timetable data={selectedTable.data || []} isModal={true} />
                      <Dashboard
                        data={selectedTable.data || []}
                        totalCredit={selectedTable?.point?.replace(/\D/g, "") || "-"}
                        preferredTimes={selectedTable?.conditions?.preferredTimes}
                        avoidDays={selectedTable?.conditions?.avoidDays}
                      />
                    </div>
                    <div className="AiTimetable-button">
                      <button className="button-remove" onClick={() => handleDeleteTable(selectedTable.id)}>삭제하기</button>
                      <button className="button" onClick={handleConfirmTable}>확정하기</button>
                    </div>
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
