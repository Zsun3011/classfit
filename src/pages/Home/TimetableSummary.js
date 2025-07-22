import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Home.css"

const TimetableSummary = () => {

    const navigate = useNavigate();

    const handleCreateTable = () => {
        navigate("/aITimetable");
    }

    return (
        <div className="TimetableSummary-container">
            <h1>나의 시간표</h1>
            <div className="TimetableSummary-section">
                <p>시간표</p>
            </div>
            <div className="TimetableSummary-section">
                <p>수강 정보</p>
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
        </div>

    )
}

export default TimetableSummary;