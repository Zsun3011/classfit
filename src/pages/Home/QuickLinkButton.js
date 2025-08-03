import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Home.css"

const QuickLinkButton = () => {

    const navigate = useNavigate();

    const handleAiTimetable = () => {
        navigate("/aiTimetable");
    };

    const handleSavedTimetable = () => {
        navigate("/aiTimetable");
    };

    const handleBookmarksubject = () => {
        navigate("/courseList");
    };
    
    return (
        <div className="QuickLinkButton-container">
            <div className="QuickLinkButton-container-title">바로가기</div>
                <button className="QuickLinkButton" onClick={handleAiTimetable}>
                    AI시간표 생성
                </button>
                <button className="QuickLinkButton" onClick={handleSavedTimetable}>
                    나의 저장된 시간표
                </button>
                <button className="QuickLinkButton" onClick={handleBookmarksubject}>
                    즐겨찾기 과목 목록
                </button>
        </div>
    )
}

export default QuickLinkButton;