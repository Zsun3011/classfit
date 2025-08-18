import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Onboarding.css";
import { post } from "../../api";
import config from "../../config";
import { useCookies } from "react-cookie";
import { isProfileCompleted, readProfile, saveProfile } from "./commonutil";
import { buildProfilePayload } from "./payload.js";


const AdmissionYearInput = () => {
    
    const navigate = useNavigate();
    const [cookies] = useCookies(["accessToken"]);
    const [admissionYear, setAdmissionYear] = useState("");

    // 토큰없으면 로그인으로, 온보딩 완료면 홈으로
    useEffect(() => {
        if(!cookies.accessToken) {
            alert("로그인이 필요합니다.");
            navigate("/", { replace: true});
            return;
        }
        const prev = readProfile();
        if (!prev.university || !prev.major) {
            navigate("/SchoolSelector", { replace: true });
        }
        if (isProfileCompleted()) {
            navigate("/Home", {replace: true});
            return;
        }
    },[cookies.accessToken, navigate]);

    const handlePrevious = () => {
        navigate("/SchoolSelector")
    };
    
    const handleNext = async () => {

        if(!admissionYear || !/^\d{4}$/.test(admissionYear)){
            alert("입학년도를 숫자 4자리로 입력해 주세요.")
            return; // 조건에 맞지 않으면 다음으로 넘어가지 못 함.
        }

        const yearNum = Number(admissionYear);
        if (yearNum < 2016 || yearNum > 2025) {
            alert("입학년도는 2016~2025 범위로 입력해 주세요.");
            return;
        }

        const payload = buildProfilePayload({
            includeCourses: false,
            override: {enrollmentYear: yearNum},
        });

        try {
            await post (config.PROFILE.STEP2, payload);
            saveProfile({enrollmentYear: yearNum});
            console.log("STEP2 성공");
            navigate("/GraduationTypeSelector", { replace: true });
        } catch (error) {
            const status = error.response?.status;
            const data = error.response?.data;
            console.error("STEP2 실패:", {status, data, message: error.message});

            if(status === 400) {
                alert(data?.message || "입력 형식이 올바르지 않습니다. 다시 확인해 주세요.");
            } else if (status === 401) {
                alert("로그인이 필요합니다. 다시 로그인해 주세요.");
                navigate("/", { replace: true});
            } else if (status === 403) {
                alert("접근 권한이 없습니다.");
            } else if (status === 500) {
                alert("서버 오류입니다. 잠시 후 다시 시도해 주세요.");
            } else {
                alert(data?.message || "요청에 실패했습니다.");
            }
        }
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
                    type="text" 
                    placeholder="숫자 4자리로 입력해주세요."
                    value={admissionYear}
                    onChange={(e) => setAdmissionYear(e.target.value)} 
                    maxLength={4}
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