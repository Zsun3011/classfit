import React from "react";
import "../../styles/MyPage.css";

const NotificationManagersecond = ({onPrev, onClose}) => {

    const handleOverlayClick = (e) => {
        if (e.target.className === "modal-overlay") {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-container">
                <h1>내 정보 수정</h1>
                <form>
                    <div className="Notification-label">이전 수강 이력</div>
                    <input type="text" className="Notification-input" placeholder="자료구조"/>
                </form>
                <div className="modal-buttons">
                    <button type="button" className="PrevPage-button"onClick={onPrev}>이전</button>
                    <button type="button" className="NextPage-button" onClick={onClose}>닫기</button>
                </div>
            </div>
        </div>
    )
}

export default NotificationManagersecond;
