import React, { useState } from "react";
import FavoriteCourseModal from "./FavoriteCourseModal"; 
import "../../styles/MyPage.css";
import "../../styles/CourseList.css";

const InputConditionForm = ({ onGenerate }) => { // courses props 제거 (API에서 직접 조회하므로 불필요)
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [credit, setCredit] = useState("");
    const [preferredTimes, setPreferredTimes] = useState([]);
    const [avoidDays, setAvoidDays] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempSelectedCourses, setTempSelectedCourses] = useState([]);

    // 선택된 과목의 정보를 저장 (API에서 조회한 즐겨찾기 과목 정보 저장용)
    const [selectedSubjectInfo, setSelectedSubjectInfo] = useState([]);

    const handleSubmit = () => {
        const selectedSubjectNames = selectedSubjectInfo
            .map(subject => subject.subjectName || subject.name)
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

    const handleConfirmSelection = (selectedCourseData) => {
        // FavoriteCourseModal에서 선택된 과목 정보를 받아서 저장
        setSelectedSubjects(tempSelectedCourses);
        setSelectedSubjectInfo(selectedCourseData || []); // 과목 정보도 함께 저장
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
        return selectedSubjectInfo
            .map(subject => subject.subjectName || subject.name)
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
                        <div className="selected-subjects-list">
                            <div className="selected-subjects-label">선택된 과목</div>
                            <ul>
                            {selectedSubjectInfo.map((subject, idx) => {
                                const name = subject.subjectName || subject.name;
                                if (!name) return null;
                                return (
                                <li key={subject.id || subject.subjectId || idx}>
                                    {name}
                                </li>
                                );
                            })}
                            </ul>
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
                        min={1} 
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