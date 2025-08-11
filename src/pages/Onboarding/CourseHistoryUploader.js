import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Onboarding.css";
import { post } from "../../api";
import config from "../../config";
import { useCookies } from "react-cookie";

const CourseHistoryUploader = () => {
    
    const navigate = useNavigate();
    const [cookies] = useCookies(["accessToken"]);
    
    const [coursehistory, setCoursehistory] = useState("");

    const handlePrevious = () => {
        navigate("/GraduationTypeSelector")
    };
     
    const handleSubmit = async () => {

        try {
            await post (
                config.PROFILE.STEP4,
                {
                    completedCourses: [
                        {
                            courseCode: "TEMP_CODE", // 필요 시 검색 기능으로 대체
                            courseTitle: coursehistory
                        }
                    ]
                },
                {
                    headers: {
                        Authorization: `Bearer ${cookies.accessToken}`
                    }
                }
            );
            console.log("STEP4 성공");
            navigate("/Home", { replace: true });
        } catch (error) {
            console.error("STEP4 실패:", error);
        }
    };

    return (
        <div className="CourseHistoryUploader-container">
            {/*왼쪽 부분*/}
            <div className="CourseHistoryUploader-left">
                <h1>기존 수강 이력</h1>
                <p>이전에 수강한 과목을 검색해 추가하거나, 이 단계를 건너뛸 수 있습니다.</p>
    
                {/*진행 표시바*/}
                <div className="progress-bar">
                    <div className="progress-step active"></div>
                    <div className="progress-step active"></div>
                    <div className="progress-step active"></div>
                    <div className="progress-step active"></div>   
                </div>
            </div>
    
            {/*오른쪽 부분*/}
            <div className="CourseHistoryUploader-right">
                {/*이전 수강 이력 입력*/}
                <div className="CourseHistoryUploader-title">이전 수강 이력</div>
                <input 
                    type="text" 
                    placeholder="과목명을 검색해 추가하세요."
                    value={coursehistory}
                    onChange={(e) => setCoursehistory(e.target.value)} 
                />
                <div className="sub-description1">과거에 수강한 과목을 입력하거나 건너뛰세요.</div>
                <div className="button-container">
                    <button className="previous-button" onClick={handlePrevious}>이전</button>
                    <button className="next-button1" onClick={handleSubmit}>나중에하기</button>
                </div>
                <div className="submit-container">
                    <button className="submit-button" onClick={handleSubmit}>제출</button>
                </div>
            </div>
        </div>
    
    );
};

export default CourseHistoryUploader;
