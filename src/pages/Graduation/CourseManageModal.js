import React, {useState} from "react";

const CourseManageModal = ({ onConfirm, onClose, mode = "add", initialData = null}) => {
    const [selectedYear, setSelectedYear] = useState(initialData?.year || "2025");
    const [selectedSemester, setSelectedSemester] = useState(initialData?.semester || "1학기");
    const [selectedRetake, setSelectedRetake] = useState(initialData?.retake || "");
    const [input, setInput] = useState(initialData?.name || "");
    const [selected, setSelected] = useState(initialData?.name || "");
    const [list, setList] = useState(false);

    const isEditMode = mode === "edit";

    const subjects = [
        "자료구조",
        "알고리즘",
        "운영체제",
        "데이터베이스",
        "컴퓨터네트워크",
        "소프트웨어공학",
        "인공지능",
        "머신러닝"
    ];
    
    const filteredSubjects = subjects.filter((subject) =>
        subject.includes(input)
    );

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setInput(value);
        setSelected("");
        setList(value !== "");
    };

    const handleSelect = (subject) => {
        setInput(subject);
        setSelected(subject);
        setList(false);
    };

    const handleConfirm = () => {
        if (!selected && !input) {
            alert("과목명을 입력해주세요.");
            return;
        }
        if (!selectedRetake) {
            alert("재수강 여부를 선택해주세요.");
            return;
        }

        const courseData = {
            id: initialData?.id || Date.now(),
            year: selectedYear,
            semester: selectedSemester,
            name: selected || input,
            retake: selectedRetake
        };

        onConfirm(courseData);
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="CourseManageModal-container">
                <div className="modal-header">
                    <div className="Modal-title">{isEditMode ? "과목 수정" : "과목 추가"}</div>
                    <button className="modal-close" onClick={handleOverlayClick}>×</button>
                </div>
                <div className="CourseManageModal-section">
                    <div className="Modal-text">연도/학기</div>
                    <div className="select-group">
                        <select 
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                        </select>
                        <select 
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                        >
                            <option value="1학기">1학기</option>
                            <option value="2학기">2학기</option>
                            <option value="여름학기">여름학기</option>
                            <option value="겨울학기">겨울학기</option>
                        </select>
                    </div>
                </div>

                <div className="CourseManageModal-section">
                    <div className="Modal-text">과목명</div>
                    <div className="input-container">
                        <input
                            type="text"
                            placeholder="과목명을 검색하세요."
                            value={input}
                            onChange={handleChange}
                            onFocus={() => setList(true)}
                            className={`course-manage-modal-input ${selected ? "selected-input" : ""}`}
                        />
                        {list && input !== "" && (
                            <ul className="dropdown-list">
                                {filteredSubjects.map((subject, index) => (
                                    <li 
                                        key={index}
                                        className={`dropdown-item ${selected === subject ? "selected" : ""}`}
                                        onClick={() => handleSelect(subject)}
                                    >
                                        {subject}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="CourseManageModal-section">
                    <div className="Modal-text">재수강 여부</div>
                    <div className="radio-group">
                        {["본수강", "재수강"].map((retake) => (
                            <label key={retake} className="radio-label">
                                <input
                                    type="radio"
                                    name="retake"
                                    value={retake}
                                    checked={selectedRetake === retake}
                                    onChange={(e) => setSelectedRetake(e.target.value)}
                                />
                                <span className="radio-text">{retake}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="modal-buttons">
                    <button className="modal-button-confirm" onClick={handleConfirm}>
                        {isEditMode ? "수정하기" : "추가하기"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseManageModal;