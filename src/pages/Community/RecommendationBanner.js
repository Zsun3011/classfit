    import React from "react";
    import { useNavigate } from "react-router-dom";


    const RecommendationBanner = ({ onButtonClick, isOnCommunityBoard = false }) => {
        const navigate = useNavigate();

        const handleButtonClick = () => {
            if (isOnCommunityBoard && onButtonClick) {
                onButtonClick();
            } else {
                navigate('/CommunityBoard', { state: { openModal: true } });
            }
        };

        return (
            <div className="Recommendation-container">
                <div className="Recommendation-section">
                    <div className="Recommendation-text">
                        <img
                                src={"/icons/taxi.png"}
                                alt="아이콘"
                                className="icons"
                            />
                        화요일 오전 9시 수업 전에 택시팟을 모집해보세요~
                    </div>
                    <div>
                    <button className="Recommendation-button" onClick={handleButtonClick}>
                            택시팟 글쓰기
                            <img
                                src={"/icons/send2.png"}
                                alt="이동"
                                className="send-icon"
                            />
                    </button>
                    </div>
                </div>
            </div>
        )
    }

    export default RecommendationBanner;