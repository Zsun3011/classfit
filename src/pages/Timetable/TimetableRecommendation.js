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

const TimetableRecommendation = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [tables, setTables] = useState([]);      
  const [selectedTable, setSelectedTable] = useState(null);
  const [conditions, setConditions] = useState(null);
  const [latestBlocks, setLatestBlocks] = useState([]);
  const [latestSummary, setLatestSummary] = useState({ totalCredit: 0, count: 0 });

  const itemsPerPage = 2;
  const savedTableRef = useRef(null);
  const navigate = useNavigate();

  // 유틸리티 함수들
  const dayMap = { 1: "월", 2: "화", 3: "수", 4: "목", 5: "금", 6: "토", 7: "일" };
  const dayRev = { "월": 1, "화": 2, "수": 3, "목": 4, "금": 5, "토": 6, "일": 7 };
  
  const slotsToBlocks = (timeSlots = []) => {
    const palette = ["#8ecae6", "#ffb703", "#90be6d", "#f94144", "#f8961e", "#43aa8b", "#577590", "#a05195"];
    return timeSlots.map((s, i) => ({
      id: s.subjectId,
      subject: s.subjectName || "-",
      day: dayMap[s.day] || "-",
      start: (s.startTime || "").slice(0, 5),
      end: (s.endTime || "").slice(0, 5),
      category: s.category ?? s.courseType ?? s.discipline ?? s.type ?? "",
      credit: Number(s.credit ?? 0),
      color: palette[i % palette.length],
    }));
  };

  const blocksToSlots = (blocks = []) =>
    blocks.map((b) => ({
      subjectId: Number(b.id),
      startTime: b.start,
      endTime: b.end,
      day: b.dayNum ?? dayRev[b.day] ?? 1,
    }));

  // API 함수들
  const refreshTimetables = async () => {
    try {
      const res = await get(config.TIMETABLE.LIST);
      const list = Array.isArray(res) ? res : (res?.result || []);
      // 최신순 정렬 (timetableId 기준 내림차순)
      const sortedList = list.sort((a, b) => (b.timetableId || 0) - (a.timetableId || 0));
      setTables(sortedList);
    } catch (e) {
      console.error("Failed to list timetables", e);
    }
  };

  // 초기 로드
  useEffect(() => {
    refreshTimetables();
  }, []);

  // 생성 완료 콜백
  const handleGenerated = useCallback(({ blocks, totalCredit, count }) => {
    setLatestBlocks(blocks);
    setLatestSummary({ totalCredit, count });
  }, []);

  // 저장
  const handleSaveTable = async () => {
    if (!latestBlocks?.length || !conditions) return;
    
    try {
      const preferCredit = Number(conditions.credit || 0);
      const pt = conditions.preferredTimes || [];
      const preferTime = pt.includes("오전") && pt.includes("오후");

      const morningClassNum = latestBlocks.filter((b) => {
        const [h] = (b.start || "00:00").split(":").map(Number);
        return h < 12;
      }).length;

      const DAYS = ["월", "화", "수", "목", "금"];
      const occupied = new Set(latestBlocks.map((b) => b.day));
      const freePeriodNum = DAYS.filter((d) => !occupied.has(d)).length;

      const essentialCourse = latestBlocks
        .filter((b) => /\(필수\)$/.test(b.subject))
        .map((b) => b.subject.replace(/\(필수\)$/, ""))
        .join(",");

      const payload = {
        preferCredit,
        preferTime,
        morningClassNum,
        freePeriodNum,
        essentialCourse,
        graduationRate: 0,
        timeSlots: blocksToSlots(latestBlocks),
      };

      await post(config.TIMETABLE.CREATE, payload);
      await refreshTimetables();
      alert("시간표가 저장되었습니다.");
    } catch (e) {
      console.error("Failed to create timetable", e);
      alert("시간표 저장 중 오류가 발생했습니다.");
    }
  };

  // 삭제
  const handleDeleteTable = async (timetableId) => {
    try {
      await api.delete(config.TIMETABLE.DELETE(timetableId));
      await refreshTimetables();
      setSelectedTable(null);
      alert("시간표가 삭제되었습니다.");
    } catch (e) {
      console.error("Failed to delete timetable", e);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  //확정
  const handleConfirmTable = async () => {
    if (!latestBlocks?.length || !conditions) return alert("확정할 시간표가 없습니다.");
    const latest = tables[0];
    if (!latest) return alert("저장된 시간표가 없습니다.");

    const pt = conditions.preferredTimes || [];
    const preferTime = pt.length ? pt.join(",") : "오전,오후"; // 선택 없으면 기본값
    const payload = {
      preferCredit: Number(conditions.credit || 0),
      preferTime,
      morningClassNum: latestBlocks.filter(b => +((b.start||"00:00").split(":")[0]) < 12).length,
      freePeriodNum: ["월","화","수","목","금"].filter(d => !latestBlocks.some(b => b.day === d)).length,
      essentialCourse: latestBlocks.filter(b=>/\(필수\)$/.test(b.subject)).map(b=>b.subject.replace(/\(필수\)$/,"")).join(","),
      graduationRate: 0,
      timeSlots: blocksToSlots(latestBlocks),
    };

    await api.put(config.TIMETABLE.UPDATE(latest.timetableId), payload); // ✅ 서버에도 확정 반영
    sessionStorage.setItem("confirmedTable", JSON.stringify(payload));   // 로컬에서도 유지
    alert("시간표가 확정되었습니다.");
    navigate("/home");
  };


  // 페이지네이션 계산
  const totalPages = Math.ceil(tables.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentProducts = tables.slice(startIdx, startIdx + itemsPerPage);

  // 시간표 뷰모델 생성
  const createTableViewModel = (t) => {
    const blocks = slotsToBlocks(t.timeSlots || []);
    const totalCredit = blocks.reduce((sum, b) => sum + (Number(b.credit) || 0), 0);
    const hasMorning = blocks.some((b) => Number((b.start || "00:00").slice(0, 2)) < 12);
    const occupiedDays = new Set(blocks.map((b) => b.day));
    const freeDays = ["월", "화", "수", "목", "금"].filter((d) => !occupiedDays.has(d));

    return {
      id: t.timetableId,
      name: `시간표 ${t.timetableId}`,
      point: `학점: ${totalCredit}`,
      morning: `오전 수업 포함 여부: ${hasMorning ? "O" : "X"}`,
      gbc: `공강: ${freeDays.join(", ") || "없음"}`,
      data: blocks,
      conditions: { 
        preferredTimes: (t.preferTime || "").split(",").filter(Boolean), 
        avoidDays: [] 
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
            {currentProducts.map((table) => {
              const viewModel = createTableViewModel(table);
              return (
                <TableCard
                  key={table.timetableId}
                  table={viewModel}
                  onClick={() => setSelectedTable({ ...table, __blocks: viewModel.data, __vm: viewModel })}
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
                    <div className="AiTimetable-button">
                      <button className="button-remove" onClick={() => handleDeleteTable(selectedTable.timetableId)}>삭제하기</button>
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