import React, { useEffect, useRef, useState } from "react";
import "../../styles/Home.css";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { keyFor, readProfile, getUid, readDisplayName } from "../Onboarding/commonutil";

const graduationLabel = {
    UNDERGRAD: "일반",
    DOUBLE_MAJOR: "복수전공",
    MINOR: "부전공",
};

// 토큰에서 name 추출
const getNameFromToken = (token = "") => {
    try {
        const base64Url = token.split(".")[1] || "";
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(base64).split("").map(c => "%" + ("00"+c.charCodeAt(0).toString(16)).slice(-2)).join("")
        );
        const payload = JSON.parse(json);
        return payload?.name || payload?.given_name || payload?.nickname || "";
    } catch {
        return "";
    }
};

// 졸업유형 표시 폴백
const getGraduationText = (p) => {
    if (!p || typeof p !== "object") return "졸업 유형";
    const key = p.graduationType;
    if (key && graduationLabel[key]) return graduationLabel[key];
    const ko = (p.graduationTypeKo || "").trim();
    if (ko) return ko === "일반 졸업" ? "일반" : ko.replace(/\s/g, "");
    return "졸업 유형";
};

const UserInfoCard = () => {

    const navigate = useNavigate();
    const [cookies] = useCookies(["accessToken"]);
    const [profile, setProfile] = useState(null);
    const ranRef = useRef(false);

    // 토큰 없으면 로그인으로, 프로필은 있는대로 표시(비어 있으면 플레이스 홀더)
    useEffect(() => {
        if (ranRef.current) return;
        ranRef.current = true;

        if(!cookies.accessToken) {
            alert("로그인이 필요합니다.");
            navigate("/", {replace: true});
            return;
        }

        setProfile(readProfile());
    
    }, [cookies.accessToken, navigate]);

    useEffect(() => {
        const apply = (data) => {
            const savedName = readDisplayName().trim();
            const tokenName = (getNameFromToken(cookies.accessToken) || "").trim();
            const name = savedName || tokenName || data.name || "";
            setProfile({...data, name});
        };
        const onCustom = (e) => apply(e.detail || readProfile());
        const onStorage = (e) => {
            const uid = getUid();
            if(uid && e.key === keyFor("profileData", uid)) {
                try {
                    apply(JSON.parse(e.newValue || "{}"));
                } catch {
                    apply(readProfile());
                }
            }
        };
        
        window.addEventListener("profile:update", onCustom);
        window.addEventListener("storage", onStorage);
        return () => {
            window.removeEventListener("profile:update", onCustom);
            window.removeEventListener("storage", onStorage);
        };
    },[cookies.accessToken]);

    const university = profile?.university || "학교 정보";
    const userName = profile?.name || "사용자 이름";
    const major = profile?.major || "전공";
    const year = (profile?.enrollmentYear ?? "") !== "" ? profile.enrollmentYear : "입학년도";
    const graduationText = getGraduationText(profile);
    
    return (
        <div className="UserInfoCard-container">
            <div className="UserInfoCard-section-first">
                <div className="title">
                    {university}
                </div>
            </div>
            <div className="UserInfoCard-section-second">
                {/*추후 백엔드 연결*/}
                <span className="Hi">안녕하세요</span>
                <div className="UserInfoCard-section-second-detail">
                    <span className="User">{userName}</span>
                    <span className="text">님!</span>
                </div>
            </div>
            <div className="UserInfoCard-section-third">
                {/*추후 백엔드 연결*/}
                <div className="UserInfoBox">학과: {major}</div>
                <div className="UserInfoBox">입학년도: {year}</div>
                <div className="UserInfoBox">졸업유형: {graduationText}</div>
            </div>
        </div>
    );
};

export default UserInfoCard;