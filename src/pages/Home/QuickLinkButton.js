import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Home.css"

const QuickLinkButton = () => {

    const navigate = useNavigate();

    const handleAiTimetable = () => {
        navigate("/aITimetable");
    };

    const handleSavedTimetable = () => {
        navigate("/");
    };

    const handleBookmarksubject = () => {
        navigate("/");
    };

    const handleAlarmsubject = () => {
        navigate("/");
    };

    
    return (
        <div className="QuickLinkButton-container">
            <h1>바로가기</h1>
                <button className="QuickLinkButton" onClick={handleAiTimetable}>
                    AI시간표 생성
                </button>
                <button className="QuickLinkButton" onClick={handleSavedTimetable}>
                    나의 저장된 시간표
                </button>
                <button className="QuickLinkButton" onClick={handleBookmarksubject}>
                    즐겨찾기 과목 목록
                </button>
                <button className="QuickLinkButton" onClick={handleAlarmsubject}>
                    과목 알림설정
                </button>
        </div>
    )
}

export default QuickLinkButton;