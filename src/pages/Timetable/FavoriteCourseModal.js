import React from "react";
import "../../styles/MyPage.css";
import "../../styles/CourseList.css";
import "../../styles/Modal.css"

const FavoriteCourseModal = ({ courses, favoriteCourseIds, selectedCourses, onSelectCourse, onConfirm, onCancel }) => {
    
    // 즐겨찾기된 과목만 필터링
    const favoriteCourses = courses.filter(course => favoriteCourseIds.includes(course.id));

    return (
        <div className="FavoriteCourseModal-container">
            <table className="Course-table">
                <thead>
                    <tr>
                        <th>선택</th>
                        <th>즐겨찾기</th>
                        <th>과목명</th>
                        <th>영역</th>
                        <th>학점</th>
                        <th>담당교수</th>
                        <th>정원</th>
                        <th>요일/시간</th>
                    </tr>
                </thead>
                <tbody>
                    {favoriteCourses.map((course) => (
                        <tr key={course.id}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedCourses.includes(course.id)}
                                    onChange={() => onSelectCourse(course.id)}
                                    className="course-checkbox"
                                />
                            </td>
                            <td>
                                <img
                                    src="/icons/star-yellow.png"
                                    alt="즐겨찾기"
                                    className="Course-icon"
                                />
                            </td>
                            <td>{course.name}</td>
                            <td>{course.area}</td>
                            <td>{course.credit}</td>
                            <td>{course.professor}</td>
                            <td>{course.capacity}</td>
                            <td>{course.schedule}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="modal-buttons">
                <button className="modal-button-confirm" onClick={onConfirm}>
                    추가하기
                </button>
            </div>
        </div>
    );
};

export default FavoriteCourseModal;
