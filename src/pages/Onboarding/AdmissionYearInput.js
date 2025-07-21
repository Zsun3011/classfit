import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Onboarding.css";

const AdmissionYearInput = () => {
    
    const navigate = useNavigate();
    
    const [admissionYear, setAdmissionYear] = useState("");

    const handlePrevious = () => {
        navigate("/SchoolSelector")
    };
    
    const handleNext = () => {
    
        if(!admissionYear){
            alert("입학년도를 입력해 주세요.")
            return; // 조건에 맞지 않으면 다음으로 넘어가지 못 함.
        }
        navigate("/GraduationTypeSelector")
    };
    
    return (
        <div className="AdmissionYearInput-container">
            {/*왼쪽 부분*/}
            <div className="AdmissionYearInput-left">
                <h1>입학년도 입력</h1>
                <p>정확한 졸업요건 분석을 위해 입학년도를 입력해 주세요.</p>
    
                {/*진행 표시바*/}
                <div className="progress-bar">
                    <div className="progress-step active"></div>
                    <div className="progress-step active"></div>
                    <div className="progress-step"></div>
                    <div className="progress-step"></div>
                </div>
            </div>
    
            {/*오른쪽 부분*/}
            <div className="AdmissionYearInput-right">
                {/*입학년도 입력*/}
                <div className="AdmissionYearInput-title">입학년도</div>
                <input 
                    type="admissionYear" 
                    placeholder="숫자 4자리로 입력해주세요."
                    value={admissionYear}
                    onChange={(e) => setAdmissionYear(e.target.value)} 
                />
                <div className="ExampleYear">예: 2021</div>
                <div className="button-container">
                    <button className="previous-button" onClick={handlePrevious}>이전</button>
                    <button className="next-button1" onClick={handleNext}>다음</button>
                </div>
            </div>
        </div>
    
    );
};

export default AdmissionYearInput;