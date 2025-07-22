import React, {useState, useRef} from "react";
import Banner from "./Banner";
import TableCard from "./TableCard";
import InputConditionForm from "./InputConditionForm";
import Timetable from "./Timetable";
import Dashboard from "./Dashboard";
import Header from "../../components/Header";

const AITimetable = () => {

    const tables = [
        {
            id: 1,
            name: "시간표1",
            point: "학점:",
            morning: "오전 수업 포함 여부:",
            gbc: "공강:",
            
        },
        {
            id: 1,
            name: "시간표2",
            point: "학점:",
            morning: "오전 수업 포함 여부:",
            gbc: "공강:",
            
        },
        {
            id: 1,
            name: "시간표3",
            point: "학점:",
            morning: "오전 수업 포함 여부:",
            gbc: "공강:",
            
        },
        {
            id: 1,
            name: "시간표4",
            point: "학점:",
            morning: "오전 수업 포함 여부:",
            gbc: "공강:",
            
        },
        
    ];

    const [currentPage, setCurrentPage] = useState(1);

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
            <div className="AiTimetable-container">
                <div className="AiTimetable-title">추천 시간표</div>
                <div className="AiTimetable-section">
                    <Timetable />
                    <Dashboard />
                </div>
            </div>
            <div className="Savedtable-cotainer" ref={savedTableRef}>
                <div className="Savedtable-contianer-title">저장된 시간표</div>
                <div className="table-container">
                    <div className="table-grid">
                        {currentProducts.map((table) => (
                            <TableCard 
                                key={table.id} 
                                table={table} 
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
                </div>
            </div>
        </div>
    );
};

export default AITimetable;