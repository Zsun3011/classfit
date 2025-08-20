import React, { useState, useEffect } from "react";
import { get } from "../../api";
import config from "../../config";
import "../../styles/MyPage.css";
import "../../styles/CourseList.css";
import "../../styles/Modal.css"

const FavoriteCourseModal = ({ selectedCourses, onSelectCourse, onConfirm, onCancel }) => {
    const [favoriteCourses, setFavoriteCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 즐겨찾기 과목 목록을 API에서 조회
    useEffect(() => {
        const fetchFavoriteCourses = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await get(config.INTEREST.LIST);
                // API 응답 구조에 따라 조정 필요 (response.result 또는 response 직접 사용)
                const courses = Array.isArray(response) ? response : (response?.result || []);
                
                setFavoriteCourses(courses);
            } catch (err) {
                console.error("즐겨찾기 과목 조회 실패:", err);
                setError("즐겨찾기 과목을 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchFavoriteCourses();
    }, []);

    // 즐겨찾기 과목이 없는 경우
    if (favoriteCourses.length === 0) {
        return (
            <div className="FavoriteCourseModal-container">
                <div className="empty-message">즐겨찾기한 과목이 없습니다.</div>
            </div>
        );
    }

    // 확인 버튼 클릭 시 선택된 과목 정보도 함께 전달
    const handleConfirm = () => {
        const selectedCourseData = favoriteCourses.filter(course => 
            selectedCourses.includes(course.subjectId || course.id)
        );
        onConfirm(selectedCourseData);
    };

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
                        <th>요일/시간</th>
                        <th>강좌유형</th>
                    </tr>
                </thead>
                <tbody>
                    {favoriteCourses.map((course) => (
                        <tr key={course.subjectId || course.id}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedCourses.includes(course.subjectId || course.id)}
                                    onChange={() => onSelectCourse(course.subjectId || course.id)}
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
                            <td>{course.subjectName || course.name}</td>
                            <td>{course.discipline || course.area}</td>
                            <td>{course.credit}</td>
                            <td>{course.professor}</td>
                            <td>{course.schedule || course.capacity}</td>
                            <td>{course.courseType || course.type}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="modal-buttons">
                <button className="modal-button-confirm" onClick={handleConfirm}>
                    추가하기
                </button>
                <button className="modal-button-cancel" onClick={onCancel}>
                    취소
                </button>
            </div>
        </div>
    );
};

export default FavoriteCourseModal;