import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Onboarding.css";

const LoginMethodSelector = () => {

    const navigate = useNavigate();

    //입력값을 상태로 저장
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState(false);

    const handleLogin = () => {
        //입력 확인
        if (!password) {
            setPasswordError(true);
        } else {
            setPasswordError(false);
        }

        if (!email || !password){
            alert("이메일과 비밀번호를 모두 입력해주세요.")
            return; // 조건에 맞지 않으면 로그인 불가능
        }
        //로그인 과정(백엔드 연결)
        navigate("/schoolSelector");
    };

    const handleSignup = () => {
        navigate("/onboarding") // 회원가입 버튼 누르면 onboarding 페이지로 넘어감
    };

    //카카오 로그인(백엔드 연결)
    const handleKakao  = () => {
        navigate("/home"); // 일단 홈으로 가도록 함
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

            <button className="Login-button" onClick={handleLogin}>로그인
            </button>

            <div className="gap">or</div>

            <button className="kakao-button" onClick={handleKakao}>카카오 로그인</button>

            <hr></hr>

            <div className="Login-bottom">
                <div>계정이 없으신가요?</div>
                <button className="Signup-button" onClick={handleSignup}>가입하기</button>
            </div>
        </div>
    );
};

export default LoginMethodSelector;