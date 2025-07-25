import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import NotificationManagerfirst from "./NotificationManagerfirst";
import NotificationManagersecond from "./NotificationManagersecond";
import "../../styles/MyPage.css";

const UserInfoEditor = () => {

    const navigate = useNavigate();

    //모달 관련
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const handleClose = () => {
        setIsModalOpen(false);
        setModalStep(1); 
    }

    
    const handleLogout = () => {
        navigate("/");
    }

    useEffect(() => {
        if(isModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isModalOpen]);

    return (
        <div className="UserInfoEditor-container">
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
            <button className="UserInfoEditor-Logout" onClick={handleLogout}>로그아웃</button>
            <button className="UserInfoEditor-Edit" onClick={() => setIsModalOpen(true)}>정보수정</button>
            {isModalOpen && (
                <div className="modal-overlay">
                    {modalStep === 1 && (
                        <NotificationManagerfirst 
                            onNext={() => setModalStep(2)} 
                            onClose={handleClose}
                        />
                    )}
                    {modalStep === 2 && (
                        <NotificationManagersecond
                            onPrev={() => setModalStep(1)}
                            onClose={handleClose}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default UserInfoEditor;