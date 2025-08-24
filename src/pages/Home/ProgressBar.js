import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Home.css";
import { get } from "../../api";
import config from "../../config";

const ProgressBar = ( { progressItems = [] }) => {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(null);

    const handleInput = () => {
        navigate("/mypage");
    }

    useEffect(() => {
        const fetchProgress = async () => {
            try {
            // 기존 진행도 + 과목별 진척도 + 졸업요건 + 수강이력
            const [grad, subject, list, history] = await Promise.all([
                get(config.GRADUATION.PROGRESS_ME),
                get(config.SUBJECT_PROGRESS.ME),
                get(config.GRADUATION.LIST),
                get(config.COURSE.LIST),
            ]);

            const req = Array.isArray(list) ? list[0] : list;
            const histories = Array.isArray(history) ? history : [];

            // ✅ 전공/교양 이수 학점 합산
            const majorEarned = histories
              .filter(h => h?.category === "전선" || h?.category === "전필")
              .reduce((sum, h) => sum + (Number(h?.credit) || 0), 0);

            const generalEarned = histories
              .filter(h => h?.category === "교선" || h?.category === "교필")
              .reduce((sum, h) => sum + (Number(h?.credit) || 0), 0);

            setProgress({
                ...grad,
                totalEarnedCredits: subject?.totalCredits ?? grad?.totalEarnedCredits, // ✅ 여기만 교체
                majorCredits: req?.majorCredits ?? null,
                generalCredits: req?.generalCredits ?? null,
                requiresEnglishTest: req?.requiresEnglishTest ?? null,
                // ✅ 내가 이수한 전공/교양 학점
                majorEarned,
                generalEarned,
            });
            } catch (e) {
            console.error("졸업 진행도 불러오기 실패", e);
            }
        };
        fetchProgress();
    }, []);

    const { totalEarnedCredits, totalRequiredCredits } = progress || {};
    const earned = Number(totalEarnedCredits) || 0;
    const required = Number(totalRequiredCredits) || 0;
    const percent = required ? Math.floor((earned / required) * 100) : 0;
    const remain = required ? Math.max(0, required - earned) : 0;

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
            <div className="ProgressBar-section">
                <div className="CourseInfoBox">
                    <div className="Box-title">전공 학점</div>
                    {/* ✅ 내 전공 이수 / 총 전공 요건 */}
                    <div className="Box-content">
                      {(progress?.majorEarned ?? 0)}/{progress?.majorCredits ?? "-"}
                    </div>
                </div>
                <div className="CourseInfoBox">
                    <div className="Box-title">교양 학점</div>
                    {/* ✅ 내 교양 이수 / 총 교양 요건 */}
                    <div className="Box-content">
                      {(progress?.generalEarned ?? 0)}/{progress?.generalCredits ?? "-"}
                    </div>
                </div>
                <div className="CourseInfoBox">
                    <div className="Box-title">영어시험 여부</div>
                    <div className="Box-content">
                        {progress?.requiresEnglishTest === true
                        ? "필수"
                        : progress?.requiresEnglishTest === false
                        ? "불필요"
                        : "-"}
                    </div>
                </div>
            </div>  

        </div>
    )
}

export default ProgressBar;
