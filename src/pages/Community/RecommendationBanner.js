// src/components/RecommendationBanner.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { post } from "../../api";
import config from "../../config";

const RecommendationBanner = ({ onButtonClick, isOnCommunityBoard = false }) => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleButtonClick = () => {
    if (isOnCommunityBoard && onButtonClick) {
      onButtonClick();
    } else {
      navigate("/CommunityBoard", { state: { openModal: true } });
    }
  };

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const res = await post(config.AI.AUTO_RECOMMEND);
        setRecommendations(res || []);
      } catch (err) {
        console.error("AI 추천 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendation();
  }, []);

  // 아이콘 + 버튼 텍스트 동시 결정
  const getRecommendationMeta = (text = "") => {
    if (/밥|점심|저녁|식사/.test(text)) {
      return { icon: "/icons/food.png", buttonText: "밥팟 글쓰기" };
    }
    if (/수업|예습|준비|학교/.test(text)) {
      return { icon: "/icons/school.png", buttonText: "스터디 글쓰기" };
    }
    if (/택시|이동|모집/.test(text)) {
      return { icon: "/icons/taxi.png", buttonText: "택시팟 글쓰기" };
    }
    // 기본값 person.png 로 변경
    return { icon: "/icons/person.png", buttonText: "게시글 작성" };
  };

  const message = loading
    ? "추천 문구 불러오는 중..."
    : recommendations.length > 0
    ? recommendations[0]
    : "추천 문구가 없습니다.";

  const { icon, buttonText } = getRecommendationMeta(message);

  return (
    <div className="Recommendation-container">
      <div className="Recommendation-section">
        <div className="Recommendation-text">
          <img src={icon} alt="아이콘" className="icons" />
          {message}
        </div>
        <div>
          <button className="Recommendation-button" onClick={handleButtonClick}>
            {buttonText}
            <img src={"/icons/send2.png"} alt="이동" className="send-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationBanner;
