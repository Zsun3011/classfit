import React from "react";
import "../../styles/MyPage.css";

const UserInfoEditor = () => {
    return (
        <div className="UserInfoEditor-container">
            <div className="UserInfoEditor-section-first">
                <h1 className="UserInfo-School">
                한국항공대학교
                </h1>
            </div>
            <div className="UserInfoEdtior-section-second">
                {/*추후 백엔드 연결*/}
                <span className="UserInfo-Hi">안녕하세요</span>
                <div className="UserInfoEditor-section-second-detail">
                    <span className="UserInfo-User">사용자이름</span>
                    <span className="UserInfo-text">님!</span>
                </div>
            </div>
            <div className="UserInfoEditor-section-third">
                {/*추후 백엔드 연결*/}
                <div className="UserInfoBox">학과: 소프트웨어학과</div>
                <div className="UserInfoBox">입학년도: 2024</div>
                <div className="UserInfoBox">졸업유형: 일반</div>
            </div>
            <button className="UserInfoEditor-Logout">로그아웃</button>
            <button className="UserInfoEditor-Edit">정보수정</button>
        </div>
    )
}

export default UserInfoEditor;