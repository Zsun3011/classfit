import React, {useState} from "react";
import "../../styles/MyPage.css";

const NotificationManagerfirst = ( { onNext, onClose} ) => {

    const[graduationtype, setGraduationtype] = useState("");
    const graduationTypes = ["일반 졸업", "복수 전공", "조기 졸업", "편입학", "기타"];

    const handleOverlayClick = (e) => {
        if (e.target.className === "modal-overlay") {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-container">
                <h1>내 정보 수정</h1>
                <div className="modal-section">
                    <div className="Notification-label">대학교</div>
                    <input type="text" className="Notification-input" placeholder="한국항공대학교"/>
                </div>
                <div className="modal-section">
                    <div className="Notification-label">전공</div>
                    <input type="text"className="Notification-input" placeholder="소프트웨어학과" />
                </div>
                <div className="modal-section">
                    <div className="Notification-label">입학년도</div>
                    <input type="text" className="Notification-input" placeholder="2024" />
                </div>
                <div className="modal-section">
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
                <div className="modal-section">
                    <div className="Notification-label">복수 전공 입력</div>
                    <input type="text" className="Notification-input" placeholder="교통물류학부"/>
                </div>
                    <div className="modal-buttons">
                        <button type="button" className="PrevPage-button" onClick={onClose}>이전</button>
                        <button type="button" className="NextPage-button" onClick={onNext}>다음</button>
                    </div>
            </div>
        </div>
    )
}

export default NotificationManagerfirst;