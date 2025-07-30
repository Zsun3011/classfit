import React, {useState} from "react";
import "../../styles/MyPage.css";

const NotificationManager = () => {

    const[graduationtype, setGraduationtype] = useState("");
    const graduationTypes = ["일반 졸업", "복수 전공", "부전공"];
    

    return (
        <div className="NotificationManager-container">
            <div className="NotificationManager-title">내 정보 수정</div>
            <div className="Notification-section">
                <div className="Notification-label">대학교</div>
                <input type="text" className="Notification-input" placeholder="한국항공대학교"/>
            </div>
            <div className="Notification-section">
                <div className="Notification-label">전공</div>
                <input type="text"className="Notification-input" placeholder="소프트웨어학과" />
            </div>
            <div className="Notification-section">
                <div className="Notification-label">입학년도</div>
                <input type="text" className="Notification-input" placeholder="2024" />
            </div>
            <div className="Notification-section">
                <div className="Notification-label">졸업 유형</div>
                <div className="graduationtype-button-group">
                {graduationTypes.map((type) => (
                    <button
                        type="button"
                        key={type}
                        className={`graduationtype-button ${graduationtype === type ? "active" : ""}`}
                        onClick={() => setGraduationtype(type)}
                    >
                        {type}
                    </button>
                ))}
                </div>
            </div>
            <div className="Notification-section">
                <div className="Notification-label">복수 전공 입력</div>
                <input type="text" className="Notification-input" placeholder="교통물류학부"/>
            </div>
            <div className="Notification-section">
                <div className="Notification-label">이전 수강 이력</div>
                <input type="text" className="Notification-input" placeholder="자료구조"/>
            </div>
        </div>
    )
}

export default NotificationManager;