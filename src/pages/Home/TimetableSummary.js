import React from "react";
import { useNavigate } from "react-router-dom";
import BaseTimetable from "../../components/BaseTimetable";
import "../../styles/Home.css"

const TimetableSummary = () => {


    const info = {
        totalCredits: "",
        hasMorning: "",
        freeDay: "",
        major: [],
        general: []
    };

    const navigate = useNavigate();

    const handleCreateTable = () => {
        navigate("/aITimetable");
    }

    return (
            <div className="TimetableSummary-container">
                <div className="TimetableSummary-overlay"></div>
                <h1>나의 시간표</h1>
                <div className="TimetableSummary-section-top">
                    <BaseTimetable />
                </div>
                <div className="TimetableSummary-wrapper">
                    <div className="wrapper-label">
                        아직 나의 시간표가 만들어지지 않았어요.
                    </div>
                    <div className="wrapper-descriptor">
                        당신의 학업 요구에 맞는 시간표를 AI가 추천해드립니다.
                    </div>
                    <button className="wrapper-button" onClick={handleCreateTable}>AI 시간표 생성</button>
                </div>
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
                        <span className="dashboard-value">{info.hasMorning}</span>
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