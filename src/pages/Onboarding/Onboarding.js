import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import "../../styles/Onboarding.css";


const Onboarding = () => {
    
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordcheck, setPasswordcheck] =useState("");

    const handleCreateAccount = () => {

        if(!name || !email || !password || !passwordcheck){
            alert("모든 입력사항에 기입해주세요.")
            return; // 조건에 맞지 않으면 계정 생성 불가능
        }

        if( password !== passwordcheck) {
            alert("비밀번호를 다시 확인해주세요.")
            return;
        }

        //계정 생성 과정(백엔드 연결)
        navigate("/");
    };

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
                type="name" 
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
                type="passwordcheck" 
                placeholder="password" 
                value={passwordcheck}
                onChange={(e) => setPasswordcheck(e.target.value) }
                />
            </div>

            <button className="CreateAccount-button" onClick={handleCreateAccount}>계정 생성하기
            </button>

            <div className="Signup-bottom">
                <div>이미 계정이 있으신가요?</div>
                <button className="GotoLogin-button" onClick={handleGotoLogin}>로그인</button>
            </div>
        </div>
    );
};

export default Onboarding;