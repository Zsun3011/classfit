import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import "../../styles/Onboarding.css";
import { post } from "../../api";
import config from "../../config";
import { savePreloginName } from './commonutil.js';

const Onboarding = () => {
    
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordcheck, setPasswordcheck] =useState("");
    const [loading, setLoading] = useState(false);

    const handleCreateAccount = async () => {

        if(!name || !email || !password || !passwordcheck){
            alert("모든 입력사항에 기입해주세요.")
            return; // 조건에 맞지 않으면 계정 생성 불가능
        }

        if( password !== passwordcheck) {
            alert("비밀번호가 일치하지 않습니다.")
            return;
        }

        // 이메일 형식 체크 
        const emailOk = /\S+@\S+\.\S+/.test(email);
        if(!emailOk) {
            alert("이메일 형식을 확인해 주세요.");
            return;
        }
        setLoading(true);

        try {
            const payload = {
                name, email, password,
                passwordConfirm: passwordcheck, // 스웨거 스키마에 맞춤
            };

            // 절대경로(endpoint) 사용
            const res = await post(config.AUTH.SIGNUP, payload, { withCredentials: false} );

            // wrapper 형태라면:
            if (res && res.isSuccess === false) {
                alert(res.message || "회원가입에 실패했습니다.");
                return;
            }

            savePreloginName(email, name);
            console.log("회원가입 성공:", res);
            alert("회원가입이 완료되었습니다. 로그인 해주세요.");
            navigate("/");
        } catch(error){
            console.log("status:", error.response?.status);
            console.log("headers:", error.response?.headers);
            console.log("data:", error.response?.data);

        const status = error.response?.status;
        const serverMsg =
            error.response?.data?.message ||
            error.response?.data?.result ||
            "회원가입에 실패했습니다.";

        if (status === 409) {
            alert("이미 가입된 이메일입니다.");
        } else if (status === 400) {
            alert(serverMsg || "잘못된 요청입니다.");
        } else {
            alert(serverMsg);
        }
       }finally {
            setLoading(false);
        }
    };

    // 로그인 하러 가기~
    const handleGotoLogin = () => {
        navigate("/");
    };

    return (
        <div className="Signup-container">
            <h1>회원가입</h1>
                {/*이름*/}
            <div className="Signup-section">
                <div className="Signup-title">
                    이름
                </div>
                <input 
                type="text" 
                placeholder="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                />
            </div>
            {/*이메일 주소*/}
            <div className="Signup-section">
                <div className="Signup-title">
                    이메일 주소
                </div>
                <input 
                type="email" 
                placeholder="email"
                value={email}
                onChange={(e)=> setEmail(e.target.value)}
                />
            </div>
            {/*비밀번호*/}
            <div className="Signup-section">
                <div className="Signup-title">
                    비밀번호
                </div>
                <input 
                type="password" 
                placeholder= "password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            {/*비밀번호 확인*/}
            <div className="Signup-section">
                <div className="Signup-title">
                    비밀번호 확인
                </div>
                <input 
                type="password" 
                placeholder="password" 
                value={passwordcheck}
                onChange={(e) => setPasswordcheck(e.target.value) }
                />
            </div>

            <button 
                className="CreateAccount-button" 
                onClick={handleCreateAccount}
                disabled={loading}
                >
                {loading ? "처리중" : "계정 생성하기"}
            </button>

            <div className="Signup-bottom">
                <div>이미 계정이 있으신가요?</div>
                <button className="GotoLogin-button" onClick={handleGotoLogin}>로그인</button>
            </div>
        </div>
    );
};

export default Onboarding;