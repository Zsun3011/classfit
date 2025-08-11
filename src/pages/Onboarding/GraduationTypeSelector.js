import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Onboarding.css";
import { post } from "../../api";
import config from "../../config";
import { useCookies } from "react-cookie";

const graduationType = {
    "일반 졸업": "UNDERADE", 
    "복수 전공": "DOUBLE_MAJOR", 
    "부전공": "MINOR"
};

const GraduationTypeSelector = () => {
    const navigate = useNavigate();
    const [cookies] = useCookies(["accessToken"]);
        
    const [graduationtype, setGraduationtype] = useState("");
    
    const handlePrevious = () => {
        navigate("/AdmissionYearInput")
    };
        
    const handleNext = async () => {
        
        if(!graduationtype){
            alert("졸업 유형을 선택해 주세요.")
            return; // 조건에 맞지 않으면 다음으로 넘어가지 못 함.
        }

        try {
            await post (
                config.PROFILE.STEP3,
                { graduationType: graduationType[graduationtype]},
                {
                    headers: {
                        Authorization: `Bearer ${cookies.accessToken}`
                    }
                }
            );
            console.log("STEP3 성공");
            navigate("/CourseHistoryUploader", { replace: true });
        } catch (error) {
            console.error("STEP3 실패:", error);
        }
    };
        
    return (
        <div className="GraduationTypeSelector-container">
            {/*왼쪽 부분*/}
            <div className="GraduationTypeSelector-left">
                <h1>졸업 유형 선택</h1>
                <p>진행하실 졸업 유형을 선택해 주세요.</p>
        
                {/*진행 표시바*/}
                <div className="progress-bar">
                    <div className="progress-step active"></div>
                    <div className="progress-step active"></div>
                    <div className="progress-step active"></div>
                    <div className="progress-step"></div>
                </div>
            </div>
        
            {/*오른쪽 부분*/}
            <div className="GraduationTypeSelector-right">
                {/*졸업 유형 선택*/}
                <div className="type-button-group">
                    {Object.keys(graduationType).map((type) => (
                        <button
                            key={type}
                            className={`type-button ${graduationtype === type ? "active" : ""}`}
                            onClick={() => setGraduationtype(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                <div className="sub-description">해당하는 졸업 유형을 선택해 주세요.</div>
                <div className="button-container">
                    <button className="previous-button" onClick={handlePrevious}>이전</button>
                    <button className="next-button1" onClick={handleNext}>다음</button>
                </div>
            </div>
        </div>
        
    );
};

export default GraduationTypeSelector;
