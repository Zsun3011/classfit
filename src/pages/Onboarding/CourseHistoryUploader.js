import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Onboarding.css";
import { post } from "../../api";
import config from "../../config";
import { useCookies } from "react-cookie";

const CourseHistoryUploader = () => {
    
    const navigate = useNavigate();
    const [cookies] = useCookies(["accessToken"]);
    
    const [coursehistory, setCoursehistory] = useState("");
    const [loading, setLoading] = useState(false);

    // 토큰 없으면 로그인으로
    useEffect (() => {
        if(!cookies.accessToken) {
            alert("로그인이 필요합니다.");
            navigate("/", { replace: true});
            return;
        }
        const prev = JSON.parse(localStorage.getItem("profileData") || "{}");
        if (!prev.university || !prev.major || !prev.enrollmentYear || !prev.graduationType) {
        navigate("/GraduationTypeSelector", { replace: true });
        }
    },[cookies.accessToken, navigate]);

    const buildPayload = (isSkip = false) => {
        const prev = JSON.parse(localStorage.getItem("profileData") || "{}");
        const trimmed = coursehistory.trim();
        // 나중에 제출하기 하면 빈 배열로 아니면 과목 코드랑 타이틀 전송
        const completedCourses = isSkip || !trimmed ? [] : [{ courseCode: "TEMP_CODE", courseTitle: trimmed }];
        return {...prev, completedCourses};
        };

    const submit = async (isSkip = false) => {
        if (loading) return;
        setLoading(true);

        const payload = buildPayload(isSkip);

        try {
            await post(config.PROFILE.STEP4, payload);
            localStorage.setItem("profileData", JSON.stringify(payload));
            console.log("STEP4 성공");
            navigate("/Home", { replace: true });
        } catch(error) {
            const status = error.response?.status;
            const data = error.response?.data;
            console.error("STEP4 실패:", {status, data, message: error.message});

            if (status === 400) {
                alert(data?.message || "입력 형식이 올바르지 않습니다. 다시 확인해 주세요.");
              } else if (status === 401) {
                alert("로그인이 필요합니다. 다시 로그인해 주세요.");
                navigate("/", { replace: true });
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
    }

    const handlePrevious = () => {
        navigate("/GraduationTypeSelector")
    };
     
    const handleSubmit =  () => {
        submit(false); // 과목 입력해서 제출
    }

    const handleSkip = () => {
        submit(true); // 나중에 하기 (빈 배열)
    }
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
                    <button className="next-button1" onClick={handleSkip}>나중에하기</button>
                </div>
                <div className="submit-container">
                    <button 
                    className="submit-button" 
                    onClick={handleSubmit}
                    disabled={loading}
                    >
                        {loading ? "처리중" : "제출"}
                    </button>
                </div>
            </div>
        </div>
    
    );
};

export default CourseHistoryUploader;
