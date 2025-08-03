import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import BaseTimetable from "../../components/BaseTimetable";
import "../../styles/Home.css"
import Timetable from "../AITimetable/Timetable"; 
import Dashboard from "../AITimetable/Dashboard"; 

const TimetableSummary = () => {
    const [confirmedTable, setConfirmedTable] = useState(null);
    const [info, setInfo] = useState({
        totalCredits: "",
        hasMorning: "",
        freeDay: "",
        major: [],
        general: [],
    });

    const navigate = useNavigate();

    const handleCreateTable = () => { 
        navigate("/aITimetable"); 
    }

    // 무한 업데이트 방지를 위한 useEffect 수정
    useEffect(() => {
        const stored = sessionStorage.getItem("confirmedTable");
        if (stored) {
            const parsed = JSON.parse(stored);
            setConfirmedTable(parsed.timetable);
        }
    }, []); // 빈 의존성 배열로 마운트 시에만 실행

    // info 업데이트를 위한 별도 함수 (무한 루프 방지)
    const handleSubjectsParsed = (parsedInfo) => {
        setInfo(prevInfo => {
            // 이전 값과 비교하여 실제로 변경된 경우에만 업데이트
            if (JSON.stringify(prevInfo) !== JSON.stringify(parsedInfo)) {
                return parsedInfo;
            }
            return prevInfo;
        });
    };

    return (
        <div className="TimetableSummary-container">
            {!confirmedTable && <div className="TimetableSummary-overlay"></div>}
            <div className="TimetableSummary-container-title">나의 시간표</div>

            <div className="TimetableSummary-section-top">
                {confirmedTable ? (
                    <>
                        <Timetable conditions={confirmedTable} />
                        <div style={{ display: "none" }}>
                            <Dashboard 
                                conditions={confirmedTable}
                                onSubjectsParsed={handleSubjectsParsed}
                            />
                        </div>
                    </>
                ) : (
                    <BaseTimetable />
                )}
            </div>

            {!confirmedTable && (
                <div className="TimetableSummary-wrapper">
                    <div className="wrapper-label">
                        아직 나의 시간표가 만들어지지 않았어요.
                    </div>
                    <div className="wrapper-descriptor">
                        당신의 학업 요구에 맞는 시간표를 AI가 추천해드립니다.
                    </div>
                    <button className="wrapper-button" onClick={handleCreateTable}>AI 시간표 생성</button>
                </div>
            )}

            <div className="TimetableSummary-section-bottom">
                <div className="dashboard-section">
                    <div className="dashboard-subtitle">수강 정보</div>
                    <div className="dashboard-list">
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
    )
}

export default TimetableSummary;