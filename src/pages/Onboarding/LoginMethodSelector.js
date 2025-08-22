import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Onboarding.css";
import { post } from "../../api";
import config from "../../config";
import { useCookies } from "react-cookie";
import {setUid, saveProfile, saveDisplayName, isProfileCompleted, 
        readPreloginName, clearPreloginName, wipeLegacyGlobalKeys,
        chooseUidFromLogin} from "./commonutil.js";

// 토큰에서 name 추출
const getNameFromToken = (token = "") => {
    try {
        const base64Url = token.split(".")[1] || "";
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent (
            atob(base64).split("").map( c => "%" + ("00"+c.charCodeAt(0).toString(16)).slice(-2)).join("")
        );
        const payload = JSON.parse(json);
        return payload?.name || payload?.given_name || payload?.nickname || "";
    } catch {
        return "";
    }
};

const LoginMethodSelector = () => {

    //입력값을 상태로 저장
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState(false);
    const [loading, setLoading] = useState(false);

    const [cookies, setCookie] = useCookies(["accessToken", "refreshToken"]);
    const navigate = useNavigate();

    
    // 로그인
    const handleLogin = async () => {

        if (loading) return; // 중복 호출 방지

        // 입력 확인 먼저
        if (!email || !password){
            if (!password) setPasswordError(true); // 비밀번호 에러 표시
            alert("이메일과 비밀번호를 모두 입력해주세요.")
            return; // 조건에 맞지 않으면 로그인 불가능
        }
        setPasswordError(false);
        setLoading(true);

        try {

            const data = { email, password };
            const res = await post(config.AUTH.LOGIN, data, 
                {
                    headers: { "Content-Type": "application/json", Accept: "application/json"},
                    //withCredentials: true,
                }
            );
            console.log("로그인 성공:", res);

            // Apiresponse 래퍼 대응
            const ok = res?.isSuccess ?? true;
            const result = res?.result ?? res;

            // 토큰 저장 (result 우선)
            const accessToken = result?.accessToken ?? res?.accessToken;
            const refreshToken = result?.refreshToken ?? res?.refreshToken;
            if (!ok || !accessToken) {
                alert(res?.message || "로그인에 실패했습니다. (토큰 없음)");
                return;
            }

            wipeLegacyGlobalKeys();

            const userUid = chooseUidFromLogin(result, accessToken, email);
            setUid(userUid);

            // 인터셉터가 쿠키에서 access/refresh 읽게 했으므로 쿠키에 저장
            setCookie("accessToken", accessToken, {
                path: "/",
                maxAge: 60 * 60 * 24 * 7 // 7일
            });

            // 서버가 refreshToken을 바디로 내려줄 때만 저장
            if (refreshToken) {
                setCookie("refreshToken", refreshToken, {
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7
                });
                localStorage.setItem("refreshToken", refreshToken);
            }

            const serverName = (result?.name || "").trim();
            const preName    = (readPreloginName(email) || "").trim();
            const tokenName  = (getNameFromToken(accessToken) || "").trim();
            const finalName  = (serverName || preName || tokenName || "").trim();
            if (finalName) {
                saveDisplayName(finalName);       // 계정별 표시 이름
                saveProfile({ name: finalName }); // 프로필에도 동기화
            }
            if (preName) clearPreloginName(email); // 임시 저장 제거

            // 토큰 저장 끝난 후, 온보딩 완료 여부에 따라 이동하는 곳 결정
            navigate(isProfileCompleted() ? "/Home" : "/SchoolSelector", { replace: true});

        } catch (error) {
            const status = error.response?.status;
            const payload = error.response?.data;
            const msg = payload?.message || payload?.error || "로그인에 실패했습니다.";

            if(status === 401) {
                alert("이메일 또는 비밀번호가 올바르지 않습니다.");
            } else if (status === 403) {
                alert("접근 권한이 없습니다. 회원가입 또는 승인 상태를 확인해주세요.");
            } else if (status === 400) {
                alert(msg || "잘못된 요청입니다.");
            } else {
                alert(msg);
            }
            console.error("로그인 실패:", {status, payload});
        } finally {
            setLoading(false);
        }
    };

    // 회원가입
    const handleSignup = () => {
        navigate("/onboarding") // 회원가입 버튼 누르면 onboarding 페이지로 넘어감
    };

    return (
        <div className="Login-container">
            <h1>로그인</h1>
            {/*이메일*/}
            <div className="Login-section">
                <div className="Login-title">
                    이메일 주소
                </div>
                <input 
                type="email" 
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            {/*비밀번호*/}
            <div className="Login-section">
                <div className={`Login-title ${passwordError ? "error-text" : ""}`}>
                    비밀번호
                </div>
                <input 
                type="password" 
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(false); // 입력하면 에러 해제
                }}
                placeholder={passwordError ? " • 비밀번호를 확인해주세요." : "password"}
                className={passwordError ? "input-error" : ""}
                />

            </div>

            <button 
                type="button"
                className="Login-button" 
                onClick={handleLogin}
                disabled={loading}
            >
                {loading ? "처리중" : "로그인"}
            </button>

            <hr></hr>

            <div className="Login-bottom">
                <div>계정이 없으신가요?</div>
                <button className="Signup-button" onClick={handleSignup}>가입하기</button>
            </div>
        </div>
    );
};

export default LoginMethodSelector;