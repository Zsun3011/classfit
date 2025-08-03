import React from "react";
import { useNavigate } from "react-router-dom";
import ProgressDashboard from "../../components/ProgressDashboard";
import "../../styles/Home.css";


const ProgressBar = ( { progressItems = [] }) => {

    const navigate = useNavigate();

    //수강 이력 입력하기 페이징
    const handleInput = () => {
        navigate("/graduationDetail");
    }

    return (
        <div className="ProgressBar-container">
            <h1>졸업 진척률</h1>
            {progressItems.every(item => item.percent === 0) && (
                <p>아직 수강 이력이 입력되지 않았어요.</p>
            )}
            {progressItems.every(item => item.percent === 0) && (
                <button className="CourseHistoryInput-button" onClick={handleInput}>
                    +수강 이력 입력하기
                </button>
            )}
            <div className="ProgressBar-section">
                <div className="CourseInfoBox">
                    <div className="Box-title">총 이수 학점</div>
                    <div className="Box-content">{progressItems[0].score.replace("학점", "")}</div>
                </div>
                <div className="CourseInfoBox">
                    <div className="Box-title">진행률</div>
                    <div className="Box-content">{progressItems[0].percent}%</div>
                </div>
                <div className="CourseInfoBox">
                    <div className="Box-title">잔여 학점</div>
                    <div className="Box-content">{120 - parseInt(progressItems[0].score.split("/")[0])}</div>
                </div>
            </div>
            <div className="ProgressBar-section">
                <ProgressDashboard progressItems={progressItems} />
            </div>
        </div>
    )
}

export default ProgressBar;