import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/MyPage.css";
import { post } from "../../api";
import config from "../../config";
import { useCookies } from "react-cookie";

const UserInfoEditor = () => {

    const [cookies, removeCookie] = useCookies(["accessToken"]);
    const navigate = useNavigate();

    // 로그아웃
    const handleLogout = async () => {
        try {
            await post(config.AUTH.LOGOUT, {});
            console.log("로그아웃 성공");

            removeCookie("accessToken", { path: "/"});
            navigate("/", { replace: true });
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };

    // 회원탈퇴
    const handleLeave =  () => {
        navigate("/Onboarding");
    }

    return (
        <div className="UserInfoEditor-container">
            <div className="UserInfoEditor-section-left">
                <div className="UserInfoEditor-section-first">
                    <h1 className="UserInfo-School">
                        한국항공대학교
                    </h1>
                </div>
                <div className="UserInfoEditor-section-second">
                    {/*추후 백엔드 연결*/}
                    <span className="UserInfo-Hi">안녕하세요</span>
                    <div className="UserInfoEditor-section-second-detail">
                        <span className="UserInfo-User">사용자이름</span>
                        <span className="UserInfo-text">님!</span>
                    </div>
                </div>
                <div className="UserInfoEditor-section-third">
                    {/*추후 백엔드 연결*/}
                    <div className="MyPage-UserInfoBox">학과: 소프트웨어학과</div>
                    <div className="MyPage-UserInfoBox">입학년도: 2024</div>
                    <div className="MyPage-UserInfoBox">졸업유형: 일반</div>
                </div>
            </div>
            <div className="UserInfoEditor-section-right">
                <button className="UserInfoEditor-Logout" onClick={() => handleLogout(removeCookie, navigate)}>로그아웃</button>
                <button className="UserInfoEditor-Leave" onClick={handleLeave}>회원탈퇴</button>
            </div>
        </div>
    )
}

export default UserInfoEditor;