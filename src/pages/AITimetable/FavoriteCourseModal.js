import React from "react";

const FavoriteCourseModal = ({ courses, selectedCourses, onSelectCourse, onConfirm, onCancel }) => {
    return (
        <div>
            <table className="favorite-modal-table">
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
                        <th>알람</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course) => (
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
                                    style={{ width: '20px', height: '20px' }}
                                />
                            </td>
                            <td>{course.name}</td>
                            <td>{course.area}</td>
                            <td>{course.credit}</td>
                            <td>{course.professor}</td>
                            <td>{course.capacity}</td>
                            <td>{course.schedule}</td>
                            <td>
                                <img
                                    src="/icons/reminder-gray.png"
                                    alt="알람"
                                    className="Course-icon"
                                    style={{ width: '20px', height: '20px' }}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="modal-buttons">
                <button
                    onClick={onCancel}
                    className="modal-button-cancel"
                >
                    취소
                </button>
                <button
                    onClick={onConfirm}
                    className="modal-button-confirm"
                >
                    추가하기
                </button>
            </div>
        </div>
    );
};

export default FavoriteCourseModal;