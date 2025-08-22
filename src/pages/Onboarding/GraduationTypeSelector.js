import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Onboarding.css";
import { post } from "../../api";
import config from "../../config";
import { useCookies } from "react-cookie";
import { toGradEnum, buildProfilePayload } from "./payload.js";
import { isProfileCompleted, readProfile, saveProfile } from "./commonutil";


const GraduationTypeSelector = () => {
    const navigate = useNavigate();
    const [cookies] = useCookies(["accessToken"]);

    const [typeKo, setTypeKo] = useState("");
    const [loading, setLoading] = useState(false);

    // 토큰 없으면 로그인으로
    useEffect(() => {
        if(!cookies.accessToken) {
            alert("로그인이 필요합니다.");
            navigate("/", { replace: true});
            return;
        }
        const prev = readProfile();
        if (!prev.university || !prev.major || !prev.enrollmentYear) {
            navigate("/AdmissionYearInput", { replace: true });
        }
        if (isProfileCompleted()) {
            navigate("/Home", {replace: true});
            return;
        }
    },[cookies.accessToken, navigate]);

    const handlePrevious = () => {
        navigate("/AdmissionYearInput")
    };
        
    const handleNext = async () => {
        
        if(!typeKo){
            alert("졸업 유형을 선택해 주세요.")
            return; // 조건에 맞지 않으면 다음으로 넘어가지 못 함.
        }

        // 서버 스키마로 페이로드 구성 (항상 UNDERGRAD로 전송)
        const gt = toGradEnum(typeKo);
        const payload = buildProfilePayload({
            graduationType: gt, // 로컬 기준 ENUM
            includeCourses: false,
        });

        try {
            await post (config.PROFILE.STEP3, payload);
            saveProfile({ graduationType: toGradEnum(typeKo), graduationTypeKo: typeKo});
            console.log("STEP3 성공");
            navigate("/CourseHistoryUploader", { replace: true });
        } catch (error) {
            const status = error.response?.status;
            const data = error.response?.data;
            console.error("STEP3 실패:", { status, data, payload });

            if (status === 400){
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
        } finally {
            setLoading(false);
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
                    {["일반 졸업", "복수 전공", "부전공"].map((type) => (
                        <button
                            key={type}
                            className={`type-button ${typeKo === type ? "active" : ""}`}
                            onClick={() => setTypeKo(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                <div className="sub-description">해당하는 졸업 유형을 선택해 주세요.</div>
                <div className="button-container">
                    <button className="previous-button" onClick={handlePrevious}>이전</button>
                    <button 
                    className="next-button1" 
                    onClick={handleNext}
                    disabled={loading}
                    >
                        {loading ? "처리중" : "다음"}
                    </button>
                </div>
            </div>
        </div>
        
    );
};

export default GraduationTypeSelector;
