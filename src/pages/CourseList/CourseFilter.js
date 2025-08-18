import React, {useState, useEffect} from "react";
import "../../styles/CourseList.css";

const weekdays = ["월", "화", "수", "목", "금"];
const categories = ["전공필수", "전공선택", "교양필수", "교양선택"];

//실제 영역 종류
const categoryMap = {
    "전공필수": ["전필"],
    "전공선택": ["전선"],
    "교양필수": ["교필"],
    "교양선택": ["교선"],
};

const CourseFilter = ({ filter, setFilter, onApplyFilter}) => {

    //요일
    const [selectedWeekdays, setSelectedWeekdays] = useState([]);
    const [weekdayAll, setWeekdayAll] = useState(true);

    //영역
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categoryAll, setCategoryAll] = useState(true);

    //텍스트 입력 값은 filter 상태로 직접 연결
    const handleProfessorinput = (e) => {
        setFilter({...filter, professor: e.target.value});
    };
    const handleCourseNameinput = (e) => {
        setFilter({...filter, courseName: e.target.value});
    };

    //요일, 영역 상태가 바뀔 때마다 filter 업데이트
    useEffect(() => {
        // 선택한 영역 실제 영역으로 변환
        const mappedCategories = categoryAll
            ? []
            : selectedCategories.flatMap((category) => categoryMap[category] || [] );

        setFilter((prev) => ({
            ...prev,
            days: weekdayAll ? [] : selectedWeekdays,
            categories: mappedCategories,
        }));
    }, [selectedWeekdays, weekdayAll, selectedCategories, categoryAll, setFilter])

    //필터 적용 버튼 클릭 시 적용
    const handleFilterSubmit = () => {

        onApplyFilter(); //CourseList의 applyFilters 실행
    }

    //요일 선택
    const handleWeekdayClick = (day) => {
        if (weekdayAll) setWeekdayAll(false);
        setSelectedWeekdays((prev) =>
            prev.includes(day)
                ? prev.filter((d) => d !== day)
                : [...prev, day]
        );
    };    
    
    const handleWeekdayAll = () => {
        setWeekdayAll(true);
        setSelectedWeekdays([]);
    };

    //영역 선택
    const handleCategoryClick = (category) => {
        if (categoryAll) setCategoryAll(false);
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    const handleCategoryAll = () => {
        setCategoryAll(true);
        setSelectedCategories([]);
    };

    return (
        <div className="CourseFilter-container">
            <h1 className="CourseFilter-title">과목 필터링</h1>
            <div className="CourseFilter-section-up">
            {/*교수명 입력*/}
            <div className="filter-group1">
                <h1>교수명</h1>
                <input
                type="text"
                placeholder="교수 이름"
                className="professor-input"
                value={filter.professor}
                onChange={handleProfessorinput}
                />
            </div>
            {/*과목명 입력*/}
            <div className="filter-group2">
                <h1>과목명</h1>
                <input
                type="text"
                placeholder="예:Class1"
                className="coursename-input"
                value={filter.courseName}
                onChange={handleCourseNameinput}
                />
            </div>
            {/*요일 선택*/}
            <div className="filter-group3">
                <h1>요일</h1>
                <div className="weekday-button-wrapper">
                {weekdays.map((day) => (
                    <button
                    key={day}
                    className={`weekday-button ${selectedWeekdays.includes(day) ? 'selected' : ''}`}
                    onClick={() => handleWeekdayClick(day)}
                    >
                        {day}
                    </button>
                ))}
                <button
                key="전체"
                className={`weekday-button ${weekdayAll ? 'selected' : ''}`}
                onClick={handleWeekdayAll}
                >
                    전체
                </button>
                </div>
            </div>
            </div>
            <div className="CourseFilter-section-bottom">
                <div className="CourseFilter-section-bottom-left">
                    {/*영역 선택*/}
                    <div className="filter-group4">
                        <h1>영역</h1>
                        <div className="category-options">
                            {categories.map((category) => (
                                <div key={category} className="category-item">
                                    <span className="category-text">{category}</span>
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            checked={selectedCategories.includes(category)}
                                            onChange={() => handleCategoryClick(category)}
                                        />
                                </div>
                            ))}
    
                            <div className="category-item">
                                <span className="category-text">전체</span>
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        checked={categoryAll}
                                        onChange={handleCategoryAll}
                                    />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="CourseFilter-section-bottom-right">
                            <button className="CourseFilter-apply-button" onClick={handleFilterSubmit}>
                                필터 적용 후 과목 탐색
                            </button>
                </div>
            </div>
        </div>
    )
}

export default CourseFilter;