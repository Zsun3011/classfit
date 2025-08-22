import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Onboarding.css";
import { post } from "../../api";
import config from "../../config";
import { useCookies } from "react-cookie";
import { buildProfilePayload } from "./payload";
import CourseHistoryManager from "../MyPage/CourseHistoryManager";
import { isProfileCompleted, readProfile, saveProfile, markProfileCompleted, readDisplayName } from "./commonutil";


const CourseHistoryUploader = () => {
    
    const navigate = useNavigate();
    const [cookies] = useCookies(["accessToken"]);
    const [loading, setLoading] = useState(false);
    const [list, setList] = useState([]);
    const [stats, setStats] = useState({ current: 0, total: 0 }); 

    const hasCurrent = stats.current > 0;
    const hasAny = useMemo(() => Array.isArray(list) && list.length > 0, [list]); 

    // 토큰 없으면 로그인으로, 온보딩 순서 가드
    useEffect (() => {
        if(!cookies.accessToken) {
            alert("로그인이 필요합니다.");
            navigate("/", { replace: true});
            return;
        }
        const prev = readProfile();
        if (!prev.university || !prev.major || !prev.enrollmentYear || !prev.graduationType) {
        navigate("/GraduationTypeSelector", { replace: true });
        return;
        }
        // 이미 온보딩 끝났으면 홈으로 가기 (URL 직접 입력 방지)
        if (isProfileCompleted()) {
            navigate("/Home", {replace: true});
        }
    },[cookies.accessToken, navigate]);

    // CourseHistoryManager 변경사항을 profileData에도 저장 -> 마이페이지/진척도페이지에 동기화
    const handleHistoryChange = useCallback((next) => {
        setList(next);
        saveProfile({courseHistory: next});
    },[]);

    const submit = async (isSkip = false) => {
        if (loading) return;
        setLoading(true);

        const payload = buildProfilePayload({
            includeCourses: !isSkip,
        });

        try {
            await post(config.PROFILE.STEP4, payload);
            const displayName = (readDisplayName() || readProfile().name || "").trim();
            saveProfile({completedCourses: payload.completedCourses ?? [], name: displayName});
            markProfileCompleted();
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
        saveProfile({courseHistory: list});
        submit(!hasAny);
    }

    return (
        <div className="CourseHistoryUploader-container">
            {/*왼쪽 부분*/}
            <div className="CourseHistoryUploader-left">
                <h1>기존 수강 이력</h1>
                <p>이전에 수강한 과목을 검색해 추가하거나, 나중에 할 수 있습니다.</p>
    
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
                <div className="CourseHistoryUploader-title">이전 수강 이력</div>
                {/* 마이페이지의 컴포넌트 재사용 */}
                <CourseHistoryManager onChange={handleHistoryChange} onStats={setStats} />
                {/*이전 수강 이력 입력*/}
                <div className="button-container">
                    <button className="previous-button" onClick={handlePrevious}>이전</button>
                    <button className="next-button1" onClick={handleSubmit} disabled={loading}>
                       {hasCurrent ? "추가하기" : "나중에하기"}
                    </button>
                </div>
            </div>
        </div>
    
    );
};

export default CourseHistoryUploader;
