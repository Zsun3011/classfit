import React, {useState, useEffect} from "react";
import CourseManageTableRow from "./CourseManageTableRow";
import CourseManageModal from "./CourseManageModal";
import "../../styles/CourseManager.css";

//상태 보존
const getInitialCourses = () => {
    const stored = localStorage.getItem("courseHistory");
    return stored ? JSON.parse(stored) : [];
};

const CourseManager = () => {
    const [selectedYear, setSelectedYear] = useState("2025");
    const [selectedSemester, setSelectedSemester] = useState("1학기");
    const [courses, setCourses] = useState(getInitialCourses);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editCourse, setEditCourse] = useState(null);
    
    const handleClose = () => {
        setIsModalOpen(false);
    }

    // 임시 과목 데이터베이스 (백엔드 연동 전)
    const getCourseInfo = (courseName) => {
        const courseDatabase = {
            "자료구조": { category: "전공필수", credit: 3 },
            "알고리즘": { category: "전공필수", credit: 3 },
            "운영체제": { category: "전공필수", credit: 3 },
            "데이터베이스": { category: "전공선택", credit: 3 },
            "컴퓨터네트워크": { category: "전공선택", credit: 3 },
            "소프트웨어공학": { category: "전공선택", credit: 3 },
            "인공지능": { category: "전공선택", credit: 3 },
            "머신러닝": { category: "전공선택", credit: 3 }
        };
        
        return courseDatabase[courseName] || { category: "일반선택", credit: 3 };
    };


    useEffect(() => {
        localStorage.setItem("courseHistory", JSON.stringify(courses));
    }, [courses]);
        
    const filteredCourses = courses.filter(course => 
        course.year === selectedYear && course.semester === selectedSemester
    );
    
    const handleRemoveCourse = (id) => {
        setCourses(prev => prev.filter(course => course.id !== id));
    };
    
     const handleAddOrEdit = (courseData) => {
        if (editCourse) {
            // 수정 모드
            setCourses(prev =>
                prev.map(course => (course.id === courseData.id ? {
                    ...course,
                    ...courseData,
                    category: getCourseInfo(courseData.name).category,
                    credit: getCourseInfo(courseData.name).credit
                } : course))
            );
            setEditCourse(null);
        } else {
            // 추가 모드
            const info = getCourseInfo(courseData.name);
            setCourses(prev => [...prev, {
                ...courseData,
                category: info.category,
                credit: info.credit
            }]);
        }
        setIsModalOpen(false);
    };

    const openEditModal = (course) => {
        setEditCourse(course);
        setIsModalOpen(true);
    };

    return (
        <div className="CourseManager-container">
            <div className="CourseManager-section-first">
                <div className="CourseManager-title">수강 이력 관리</div>
                    <div className="CourseManager-Plus">
                        <div className="CourseManager-PlusButtonText">정확한 진척률 분석을 위해 수강 이력을 등록해주세요.</div>
                        <button className="CourseManager-PlusButton" onClick={() => setIsModalOpen(true)}>
                            <img
                                src={"/icons/plus.png"}
                                alt="추가"
                                className="Plus-icon"
                            />
                        </button>
                    </div>
            </div>
            <div className="CourseManager-section-second">
                연도/학기
                <div className="select-group">
                    <select onChange={(e) => setSelectedYear(e.target.value)}>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                    </select>
                    <select onChange={(e) => setSelectedSemester(e.target.value)}>
                        <option value="1학기">1학기</option>
                        <option value="2학기">2학기</option>
                        <option value="여름학기">여름학기</option>
                        <option value="겨울학기">겨울학기</option>
                    </select>
                </div>
            </div>

            <table className="Course-table">
                <thead>
                    <tr>
                        <th>과목명</th>
                        <th>이수구분</th>
                        <th>학점</th>
                        <th>재수강여부</th>
                        <th>수정</th>
                        <th>삭제</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                            <CourseManageTableRow 
                                key={course.id}
                                course={course}
                                onRemove={handleRemoveCourse}
                                onEdit={openEditModal}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{textAlign: 'center', padding: '20px', color: '#888'}}>
                                해당 학기에 등록된 과목이 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

        {isModalOpen && (
                <CourseManageModal
                    onConfirm={handleAddOrEdit}
                     onClose={() => {
                        setIsModalOpen(false);
                        setEditCourse(null);
                    }}
                    mode={editCourse ? "edit" : "add"}
                    initialData={editCourse}
                />
            )}   
            
        </div>
    );
};

export default CourseManager;