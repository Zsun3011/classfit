import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Home.css";
import { get } from "../../api";
import config from "../../config";

const ProgressBar = ( { progressItems = [] }) => {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(null);
    //수강 이력 입력하기 페이징
    const handleInput = () => {
        navigate("/mypage");
    }

    useEffect(() => {
        const fetchProgress = async () => {
        try {
            const res = await get(config.GRADUATION.PROGRESS_ME);
            setProgress(res);
        } catch (e) {
            console.error("졸업 진행도 불러오기 실패", e);
        }
        };
        fetchProgress();
    }, []);

    const { totalEarnedCredits, totalRequiredCredits } = progress;
    const percent = Math.floor((totalEarnedCredits / totalRequiredCredits) * 100);
    const remain = totalRequiredCredits - totalEarnedCredits;

    return (
        <div className="ProgressBar-container">
            <div className="ProgressBar-container-title">졸업 진척률</div>
            <p>정확한 계산을 위해 수강 이력을 모두 입력해 주세요!</p>
            <button className="CourseHistoryInput-button" onClick={handleInput}>
                +수강 이력 입력하기
            </button>
            <div className="ProgressBar-section">
                <div className="CourseInfoBox">
                    <div className="Box-title">총 이수 학점</div>
                    <div className="Box-content">{totalEarnedCredits}/{totalRequiredCredits}</div>
                </div>
                <div className="CourseInfoBox">
                    <div className="Box-title">진행률</div>
                    <div className="Box-content">{percent}%</div>
                </div>
                <div className="CourseInfoBox">
                    <div className="Box-title">잔여 학점</div>
                    <div className="Box-content">{remain}</div>
                </div>
            </div>  
        </div>
    )
}

export default ProgressBar;