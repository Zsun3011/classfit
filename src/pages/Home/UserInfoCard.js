import React from "react";
import "../../styles/Home.css";

const UserInfoCard = () => {
    return (
        <div className="UserInfoCard-container">
            <div className="UserInfoCard-section-first">
                <h1 className="School">
                한국항공대학교
                </h1>
            </div>
            <div className="UserInfoCard-section-second">
                {/*추후 백엔드 연결*/}
                <span className="Hi">안녕하세요</span>
                <div className="UserInfoCard-section-second-detail">
                    <span className="User">사용자이름</span>
                    <span className="text">님!</span>
                </div>
            </div>
            <div className="UserInfoCard-section-third">
                {/*추후 백엔드 연결*/}
                <div className="UserInfoBox">학과: 소프트웨어학과</div>
                <div className="UserInfoBox">입학년도: 2024</div>
                <div className="UserInfoBox">졸업유형: 일반</div>
            </div>
        </div>
    );
};

export default UserInfoCard;