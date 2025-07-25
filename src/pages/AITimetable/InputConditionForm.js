import React, { useState } from "react";
import Modal from "./Modal"; // Modal 컴포넌트 import
import FavoriteCourseModal from "./FavoriteCourseModal"; // FavoriteCourseModal 컴포넌트 import

const InputConditionForm = ({ onGenerate }) => {
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [credit, setCredit] = useState("");
    const [preferredTimes, setPreferredTimes] = useState([]);
    const [avoidDays, setAvoidDays] = useState([]);
    const [keywords, setKeywords] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempSelectedCourses, setTempSelectedCourses] = useState([]);

    // 샘플 즐겨찾기 과목 데이터
    const favoriteCourses = [
        { id: 1, name: "자료구조", area: "전필", credit: 3, professor: "김교수", capacity: "0/70", schedule: "월/수 (10:30 - 12:00)" },
        { id: 2, name: "알고리즘", area: "전필", credit: 3, professor: "이교수", capacity: "0/70", schedule: "화/목 (14:00 - 15:30)" },
        { id: 3, name: "데이터베이스", area: "전선", credit: 3, professor: "박교수", capacity: "0/70", schedule: "월/수 (14:00 - 15:30)" },
        { id: 4, name: "운영체제", area: "전필", credit: 3, professor: "최교수", capacity: "0/70", schedule: "화/목 (10:30 - 12:00)" },
        { id: 5, name: "컴퓨터네트워크", area: "전선", credit: 3, professor: "정교수", capacity: "0/70", schedule: "금 (13:00 - 16:00)" }
    ];

    const handleSubmit = () => {
        const selectedSubjectNames = selectedSubjects.map(id => 
            favoriteCourses.find(course => course.id === id)?.name
        ).filter(Boolean);

        const message = `
            [선택한 조건 요약]
            ▪ 필수 과목: ${selectedSubjectNames.length > 0 ? selectedSubjectNames.join(", ") : "없음"}
            ▪ 희망 학점: ${credit || "없음"}
            ▪ 선호 시간대: ${preferredTimes.length > 0 ? preferredTimes.join(", ") : "없음"}
            ▪ 피하고 싶은 요일: ${avoidDays.length > 0 ? avoidDays.join(", ") : "없음"}
            ▪ 관심 키워드: ${keywords.length > 0 ? keywords.join(", ") : "없음"}
        `.trim();

        alert(message);

        onGenerate({
            selectedSubjects,
            credit,
            preferredTimes,
            avoidDays,
            keywords
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
        return selectedSubjects.map(id => 
            favoriteCourses.find(course => course.id === id)?.name
        ).filter(Boolean).join(", ");
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

                {/* 교양 관심 키워드 */}
                <div className="form-group">
                    <label>교양 관심 키워드</label>
                    {["철학과 역사", "문학과 예술", "인간과 사회", "자연과 과학", "세계와 문학", "자기계발", "소양"].map((keyword) => (
                        <label key={keyword}>
                            <input
                                type="checkbox"
                                value={keyword}
                                checked={keywords.includes(keyword)}
                                onChange={() =>
                                    handleCheckbox(keyword, setKeywords, keywords)
                                }
                            />
                            {keyword}
                        </label>
                    ))}
                </div>
            </div>
            <button className="button" onClick={handleSubmit}>
                AI 시간표 생성
            </button>

            {/* 모달 */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={handleCancelSelection}
                title="즐겨찾기에서 선택"
            >
                <FavoriteCourseModal
                    courses={favoriteCourses}
                    selectedCourses={tempSelectedCourses}
                    onSelectCourse={handleSelectCourse}
                    onConfirm={handleConfirmSelection}
                    onCancel={handleCancelSelection}
                />
            </Modal>
        </div>
    );
};

export default InputConditionForm;