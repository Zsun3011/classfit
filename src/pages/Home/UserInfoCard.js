import React, { useEffect, useRef, useState } from "react";
import "../../styles/Home.css";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const UserInfoCard = () => {

    const navigate = useNavigate();
    const [cookies] = useCookies(["accessToken"]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const ranRef = useRef(false);

    const graduationLabel = {
        UNDERGRAD: "일반",
        DOUBLE_MAJOR: "복수전공",
        MINOR: "부전공",
    };

    const nameFromToken = (token) => {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.name
        } catch {
            return undefined;
        }
    };

    // 토큰 없으면 로그인으로
    useEffect(() => {
        // alert 중복 방지
        if (ranRef.current) return;
        ranRef.current = true;

        if(!cookies.accessToken) {
            alert("로그인이 필요합니다.");
            navigate("/", {replace: true});
            return;
        }

        // API가 따로 없어서 온보딩에서 저장한 localStorage 사용함
        try {
            
            // 온보딩에서 저장해둔 프로필 가져오기
            const local = JSON.parse(localStorage.getItem("profileData") || "{}");

            if (!local.university || !local.major || !local.enrollmentYear) {
                alert("온보딩 입력이 완료되지 않았습니다. 초기 페이지로 돌아갑니다.")
                navigate("/SchoolSelector", {replace: true});
                setProfile(null);
            } else {
                const displayName = nameFromToken(cookies.accessToken) || local.name;
                setProfile({...local, name: displayName });
            }
        } catch {
            setProfile(null);
        } finally {
            setLoading(false);
        }
    
    }, [cookies.accessToken, navigate]);

    if (loading) {
        return (
            <div className="UserInfoCard-container">
                <div className="UserInfoCard-section-first">
                    <div className="title">불러오는 중</div>
                </div>
            </div>
        );
    }

    const university = profile?.university || "학교 정보";
    const userName = profile?.name || "사용자 이름";
    const major = profile?.major || "전공";
    const year = (profile?.enrollmentYear ?? "") !== "" ? profile.enrollmentYear : "입학년도";
    const graduationType = graduationLabel[profile?.graduationType] || "졸업 유형";
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
                <div className="UserInfoBox">졸업유형: {graduationType}</div>
            </div>
        </div>
    );
};

export default UserInfoCard;