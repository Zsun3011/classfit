import React, { useState, useEffect } from "react";
import FavoriteCourseModal from "./FavoriteCourseModal"; // FavoriteCourseModal 컴포넌트 import
import "../../styles/MyPage.css";
import "../../styles/CourseList.css";
import dummyCourses from "../CourseList/dummyCourses";

const InputConditionForm = ({ onGenerate }) => {
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [credit, setCredit] = useState("");
    const [preferredTimes, setPreferredTimes] = useState([]);
    const [avoidDays, setAvoidDays] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempSelectedCourses, setTempSelectedCourses] = useState([]);

    const [favoriteIds, setFavoriteIds] = useState([]);

    useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favoriteIds") || "[]");
    setFavoriteIds(storedFavorites);
    }, []);


    const handleSubmit = () => {
        const selectedSubjectNames = selectedSubjects
            .map(id => dummyCourses.find(course => course.id === id)?.name)
            .filter(Boolean);

        const message = `
            [선택한 조건 요약]
            ▪ 필수 과목: ${selectedSubjectNames.length > 0 ? selectedSubjectNames.join(", ") : "없음"}
            ▪ 희망 학점: ${credit || "없음"}
            ▪ 선호 시간대: ${preferredTimes.length > 0 ? preferredTimes.join(", ") : "없음"}
            ▪ 피하고 싶은 요일: ${avoidDays.length > 0 ? avoidDays.join(", ") : "없음"}
        `.trim();

        alert(message);

        onGenerate({
            selectedSubjects,
            credit,
            preferredTimes,
            avoidDays
        });
    };

    const handleCheckbox = (value, setter, state) => {
        setter(
            state.includes(value)
                ? state.filter((v) => v !== value)
                : [...state, value]
        );
    };

    const handleSelectCourse = (courseId) => {
        setTempSelectedCourses(prev =>
            prev.includes(courseId)
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    };

    const handleConfirmSelection = () => {
        setSelectedSubjects(tempSelectedCourses);
        setIsModalOpen(false);
    };

    const handleCancelSelection = () => {
        setTempSelectedCourses(selectedSubjects);
        setIsModalOpen(false);
    };

    const openModal = () => {
        setTempSelectedCourses(selectedSubjects);
        setIsModalOpen(true);
    };

   const getSelectedSubjectNames = () => {
    return selectedSubjects
        .map(id => dummyCourses.find(course => course.id === id)?.name)
        .filter(Boolean)
        .join(", ");
    };


    return (
        <div className="inputCondition-container">
            <div className="inputCondition-title">시간표 조건 입력</div>
            <div className="inputCondition-form">

                {/* 필수 포함 과목 */}
                <div className="form-group">
                    <label>필수 포함 과목</label>
                    <button
                        onClick={openModal}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left'
                        }}
                    >
                        즐겨찾기에서 선택 {selectedSubjects.length > 0 && `(${selectedSubjects.length}개 선택됨)`}
                    </button>
                    {selectedSubjects.length > 0 && (
                        <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                            선택된 과목: {getSelectedSubjectNames()}
                        </div>
                    )}
                </div>

                {/* 희망 이수 학점 */}
                <div className="form-group">
                    <label>희망 이수 학점</label>
                    <input
                        type="number"
                        placeholder="예: 15"
                        value={credit}
                        onChange={(e) => setCredit(e.target.value)}
                    />
                </div>

                {/* 선호 시간대 */}
                <div className="form-group">
                    <label>선호 시간대</label>
                    {["오전", "오후"].map((time) => (
                        <label key={time}>
                            <input
                                type="checkbox"
                                value={time}
                                checked={preferredTimes.includes(time)}
                                onChange={() =>
                                    handleCheckbox(time, setPreferredTimes, preferredTimes)
                                }
                            />
                            {time}
                        </label>
                    ))}
                </div>

                {/* 피하고 싶은 요일 */}
                <div className="form-group">
                    <label>피하고 싶은 요일</label>
                    {["월요일", "화요일", "수요일", "목요일", "금요일"].map((day) => (
                        <label key={day}>
                            <input
                                type="checkbox"
                                value={day}
                                checked={avoidDays.includes(day)}
                                onChange={() =>
                                    handleCheckbox(day, setAvoidDays, avoidDays)
                                }
                            />
                            {day}
                        </label>
                    ))}
                </div>
            </div>
            <button className="button" onClick={handleSubmit}>
                AI 시간표 생성
            </button>

            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCancelSelection}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>즐겨찾기에서 선택</h2>
                            <button className="modal-close" onClick={handleCancelSelection}>×</button>
                        </div>
                        <div className="modal-content">
                            <FavoriteCourseModal
                                courses={dummyCourses}
                                favoriteCourseIds={favoriteIds}
                                selectedCourses={tempSelectedCourses}
                                onSelectCourse={handleSelectCourse}
                                onConfirm={handleConfirmSelection}
                                onCancel={handleCancelSelection}
                            />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default InputConditionForm;