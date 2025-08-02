import React, {useState, useRef, useEffect} from "react";
import Banner from "./Banner";
import TableCard from "./TableCard";
import InputConditionForm from "./InputConditionForm";
import Timetable from "./Timetable";
import Dashboard from "./Dashboard";
import Header from "../../components/Header";

const getInitialTables = () => {
    const stored = localStorage.getItem("savedTables");
    return stored ? JSON.parse(stored) : [];
};

const getLastTableId = () => {
    const storedId = localStorage.getItem("lastTableId");
    return storedId ? parseInt(storedId) : 0;
};


const AITimetable = () => {

    const [currentPage, setCurrentPage] = useState(1);
    
    const [tables, setTables] = useState(getInitialTables);
    const [lastId, setLastId] = useState(getLastTableId);
    const [selectedTable, setSelectedTable] = useState(null);

    const itemsPerPage = 2;
    const totalPages = Math.ceil(tables.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = tables.slice(startIndex, endIndex);

    const savedTableRef = useRef(null);

    const [selectedConditions, setSelectedConditions] = useState(null);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const scrollToSavedTable = () => {
        if(savedTableRef.current){
            savedTableRef.current.scrollIntoView({behavior: "smooth"});
        }
    };

    const handleDeleteTable = (id) => {
        const updatedTables = tables.filter((table) => table.id !== id);
        setTables(updatedTables);
        setSelectedTable(null); // 모달 닫기

        if (updatedTables.length === 0) {
            setLastId(0);
        }
    };

    useEffect(() => {
        localStorage.setItem("savedTables", JSON.stringify(tables));
        localStorage.setItem("lastTableId", String(lastId));
    }, [tables, lastId]);

    
    return(
        <div>
            <Header />
            <Banner 
                title="AI 시간표 생성하기"
                text="당신의 학업 요구에 맞는 시간표를 AI가 추천해드립니다."
                buttonText="저장된 시간표"
                onButtonClick={scrollToSavedTable}
            />
            <InputConditionForm
                onGenerate={(conditions) => {
                    setSelectedConditions(conditions);
                }}
            />
            {selectedConditions && (
                <div className="AiTimetable-container">
                    <div className="AiTimetable-title">추천 시간표</div>
                    <div className="AiTimetable-section">
                        <Timetable conditions={selectedConditions} />
                        <Dashboard conditions={selectedConditions} />
                    </div>  
                    <div className="AiTimetable-button">
                        <button className="button" onClick={() => {
                            if (selectedConditions) {
                                const newId = lastId + 1;
                                const newTable = {
                                    id: Date.now(), // 고유 ID
                                    name: `시간표${newId}`,
                                    point: `학점: ${selectedConditions.credit}`,
                                    morning: `오전 수업 포함 여부: ${selectedConditions.preferredTimes.includes("오전") ? "있음" : "없음"}`,
                                    gbc: `공강: ${selectedConditions.avoidDays.join(", ") || "없음"}`,
                                    conditions: selectedConditions,
                                    isNew: true
                                };
                                setTables([newTable, ...tables]);
                                setLastId(newId);
                            }
                        }}>저장하기</button>
                        <button className="button" >확정하기</button>
                    </div>
                    <div className="AiTimetable-buttonText">*저장하지 않으면 해당 시간표는 삭제됩니다.</div>
                </div>
            )}
            <div className="Savedtable-cotainer" ref={savedTableRef}>
                <div className="Savedtable-contianer-title">저장된 시간표</div>
                <div className="table-container">
                    <div className="table-grid">
                        {currentProducts.map((table) => (
                            <TableCard
                            key={table.id}
                            table={table}
                            onClick={() => setSelectedTable(table)}
                            />
                        ))}
                    </div>
                    <div className="paging">
                        {currentPage > 1 && (
                            <button 
                                className='paging-button'
                                onClick={()=> handlePageChange(currentPage - 1 )}
                            >
                                Prev
                            </button>
                        )}
                        {Array.from({ length: totalPages}, (_, i) => i + 1).map(
                            (pageNumber) => (
                                <button 
                                    className={`paging-button ${currentPage === pageNumber ? "active": ""}`}
                                    key={pageNumber}
                                    onClick={()=> handlePageChange(pageNumber)}
                                >
                                    {pageNumber}
                                </button>
                            )
                        )}
                        {currentPage < totalPages && (
                            <button 
                                className='paging-button'
                                onClick={()=> handlePageChange(currentPage + 1 )}
                            >
                                Next
                            </button>
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
                                        <Timetable conditions={selectedTable.conditions} isModal={true}/>
                                        <Dashboard conditions={selectedTable.conditions} />
                                    </div>
                                    <div className="AiTimetable-button">
                                            <button className="button-remove" 
                                                onClick={() => handleDeleteTable(selectedTable.id)}
                                            >
                                                삭제하기
                                            </button>
                                            <button className="button" >확정하기</button>
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

export default AITimetable;