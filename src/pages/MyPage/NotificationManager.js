import React, {useEffect, useRef, useState} from "react";
import "../../styles/MyPage.css";
import {useNavigate} from "react-router-dom";
import { useCookies } from "react-cookie";
import CourseHistoryManager from "./CourseHistoryManager";
import { readProfile, saveProfile } from "../Onboarding/commonutil";

const graduationLabel = {
    UNDERGRAD: "일반 졸업", 
    DOUBLE_MAJOR: "복수 전공",
    MINOR: "부전공",
};

const enumByLabel = {
    "일반 졸업": "UNDERGRAD",
    "복수 전공": "DOUBLE_MAJOR",
    "부전공": "MINOR",
};

const NotificationManager = () => {

    const [cookies] = useCookies(["accessToken"]);
    const navigate = useNavigate();
    const ranRef = useRef(false);

    const [university, setUniversity] = useState("");
    const [major, setMajor] = useState("");
    const [year, setYear] = useState("");
    const[graduationtype, setGraduationtype] = useState("");
    const [doubleMajor, setDoubleMajor] = useState("");

    const graduationTypes = Object.values(graduationLabel);

    const buildProfile = () => ({
        university: university.trim(),
        major: major.trim(),
        enrollmentYear: /^\d{4}$/.test(year) ? Number(year) : undefined,
        graduationType: enumByLabel[graduationtype] || undefined, 
        graduationTypeKo: graduationtype || undefined,            
        doubleMajor: doubleMajor.trim(),
    });

    const handleSave = () => {
        saveProfile(buildProfile());      
        alert("수정사항이 저장되었습니다.");
    };
    
    // 온보딩 결과 가져오기
    useEffect(() => {
        if(ranRef.current) return;
        ranRef.current = true;

        if (!cookies.accessToken) {
            alert("로그인이 필요합니다.");
            navigate("/", {replace: true});
            return;
        }

        const local = readProfile(); // 계정별 정보 읽기
        setUniversity(local.university || "");
        setMajor(local.major || "");
        setYear (
            typeof local.enrollmentYear === "number"
            ? String(local.enrollmentYear)
            :(local.enrollmentYear || "")
        );

        const initialLabel =
            local.graduationTypeKo ||
            graduationLabel[local.graduationTypeClient] ||
            graduationLabel[local.graduationType] ||
            "";
            setGraduationtype(initialLabel);
            setDoubleMajor(local.doubleMajor || "");
 
    }, [cookies.accessToken, navigate]);

    return (
        <div className="NotificationManager-container">
            <div className="NotificationManager-title">내 정보 수정</div>
            <div className="Notification-section">
                <div className="Notification-label">대학교</div>
                <input 
                type="text" 
                className="Notification-input" 
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                />
            </div>
            <div className="Notification-section">
                <div className="Notification-label">전공</div>
                <input 
                type="text"
                className="Notification-input" 
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                />
            </div>
            <div className="Notification-section">
                <div className="Notification-label">입학년도</div>
                <input 
                type="text" 
                className="Notification-input" 
                value={year}
                onChange={(e) => {
                    // 숫자만 허용
                    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setYear(value);
                }}
                />
            </div>
            <div className="Notification-section">
                <div className="Notification-label">졸업 유형</div>
                <div className="type-button-group">
                {graduationTypes.map((type) => (
                    <button
                        type="button"
                        key={type}
                        className={`graduationtype-button ${graduationtype === type ? "active" : ""}`}
                        onClick={() => setGraduationtype(type)}
                    >
                        {type}
                    </button>
                ))}
                </div>
            </div>
            <div className="Notification-section">
                <div className="Notification-label">복수 전공 입력</div>
                <input 
                type="text" 
                className="Notification-input" 
                value={doubleMajor}
                onChange={(e) => setDoubleMajor(e.target.value)}
                />
            </div>
            <div className = "Notification-button-container">
                <button className="Notification-save-button" onClick={handleSave}>
                    저장
                </button>
            </div>
            <div className="Notification-section">
                <div className="Notification-label">이전 수강 이력</div>
                <CourseHistoryManager
                onChange={(items) => {
                    saveProfile({courseHistory: items});
                }}
                />
            </div>
        </div>
    )
}

export default NotificationManager;