import React, { useEffect, useRef, useState} from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/MyPage.css";
import api from "../../api";
import config from "../../config";
import { useCookies } from "react-cookie";
import { readProfile, purgeAllForUid, readDisplayName, getUid, clearUid, keyFor, wipeLegacyGlobalKeys } from "../Onboarding/commonutil";

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

const UserInfoEditor = () => {

    const [cookies, , removeCookie] = useCookies(["accessToken", "refreshToken"]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const didRun = useRef(false);
    const navigate = useNavigate();

    // 온보딩 정보 연결, 프로필은 있는대로 표시(비어 있으면 플레이스 홀더)
    useEffect(() => {
        if(didRun.current) return;
        didRun.current = true;

        if(!cookies.accessToken) {
            alert("로그인이 필요합니다.");
            navigate("/", { replace: true});
            return;
        }

        setProfile(readProfile())
        setLoading(false);

    }, [cookies.accessToken, navigate]);

    useEffect(() => {
        const apply = (data) => {
          const savedName = readDisplayName().trim();
          const tokenName = (getNameFromToken(cookies.accessToken) || "").trim();
          const name = savedName || tokenName || data.name || "";
          setProfile({ ...data, name });
        };
      
        const onCustom = (e) => apply(e.detail || readProfile());
        const onStorage = (e) => {
          const uid = getUid();
          if (uid && e.key === keyFor("profileData", uid)) {
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
      }, []);   

    const clearClientAuth = () => {
        removeCookie("accessToken", {path: "/"});
        removeCookie("refreshToken", {path: "/"});
        localStorage.removeItem("refreshToken");
        clearUid();
        wipeLegacyGlobalKeys();
    };

    // 로그아웃
    const handleLogout = async () => {

        if(loading) return;
        setLoading(true);

        try {
            const refreshToken = cookies.refreshToken || localStorage.getItem("refreshToken") || null;
            const res = await api.post(config.AUTH.LOGOUT, refreshToken ? {refreshToken} : {},
                {withCredentials: true}
            );

            if(res.status >= 200 && res.status < 300) {
                console.log("로그아웃 성공");
            } else {
                console.warn("서버 로그아웃 실패:", res.status, res.data);
            }
        } catch(error) {
            console.warn("네트워크 오류:", error.message);
        } finally {
            clearClientAuth();
            navigate("/", { replace: true });
            setLoading(false);
        }
    };

    // 회원탈퇴
    const handleLeave =  async () => {
        if (loading) return;

        const ok = window.confirm (
            "정말 탈퇴하시겠습니까?\n계정 및 저장된 데이터(수강 이력 등)가 삭제됩니다."
        );
        if (!ok) return;
        setLoading(true);

        let uid = getUid();
        try {
            await api.delete(config.USER.ME, { withCredentials: true });
            alert("회원탈퇴가 완료되었습니다.");
        }catch (error) {
            const status = error.response?.status;
            const data = error.response?.data;
            // 서버가 토큰을 무효화하면서 401이 뜨는 경우
            if(status === 401) {
                alert("회원탈퇴가 완료되었습니다.");
            } else if (status === 403) {
                alert("접근 권한이 없습니다.")
            } else {
                alert(data?.message || "요청에 실패했습니다.");
            }
            console.error("회원탈퇴 실패:", status, data);
        }finally {
            if (uid) purgeAllForUid(uid); // 해당 계정의 캐시만 제거
            clearClientAuth();
            navigate("/", {replace: true});
            setLoading(false);
        }
    };

    const university = profile?.university || "학교 정보";
    const userName = profile?.name || "사용자 이름";
    const major = profile?.major || "전공";
    const year = (profile?.enrollmentYear ?? "") !== "" ? profile.enrollmentYear : "입학년도";
    const graduationText = getGraduationText(profile);

    return (
        <div className="UserInfoEditor-container">
            <div className="UserInfoEditor-section-left">
                <div className="UserInfoEditor-section-first">
                    <h1 className="UserInfo-School">
                        {university}
                    </h1>
                </div>
                <div className="UserInfoEditor-section-second">
                    {/*추후 백엔드 연결*/}
                    <span className="UserInfo-Hi">안녕하세요</span>
                    <div className="UserInfoEditor-section-second-detail">
                        <span className="UserInfo-User">{userName}</span>
                        <span className="UserInfo-text">님!</span>
                    </div>
                </div>
                <div className="UserInfoEditor-section-third">
                    {/*추후 백엔드 연결*/}
                    <div className="MyPage-UserInfoBox">학과: {major}</div>
                    <div className="MyPage-UserInfoBox">입학년도: {year}</div>
                    <div className="MyPage-UserInfoBox">졸업유형: {graduationText}</div>
                </div>
            </div>
            <div className="UserInfoEditor-section-right">
                <button 
                className="UserInfoEditor-Logout" 
                onClick={handleLogout}
                disabled={loading}
                >
                    {loading ? "처리중" : "로그아웃"}
                </button>
                <button 
                className="UserInfoEditor-Leave" 
                onClick={handleLeave}
                disabled={loading}
                >
                    {loading ? "처리중" : "회원탈퇴"}
                </button>
            </div>
        </div>
    )
}

export default UserInfoEditor;