import React from "react";
import CourseRow from "./CourseRow";

//courses: 보여줄 과목 리스트, 
// favoriteCourseIds: 즐겨찾기된 과목 id 배열, onToggleFavorite: 별 클릭 시 호출할 함수, 
const FavoriteCourseList = ({courses, favoriteCourseIds, onToggleFavorite}) => {

    const favoriteCourses = courses.filter(course => favoriteCourseIds.includes(course.id));

    return (
        <div className="FavoriteCourseList-container">
            <h1 className="FavoriteCourseList-title">즐겨찾기</h1>
            <table className="Course-table">
                <thead>
                    <tr>
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
                        <CourseRow
                        key={course.id}
                        course={course}
                        isFavorite={true}
                        onToggleFavorite={onToggleFavorite}
                        />  
                    ))}
                </tbody>
            </table>

        </div>

    );
};

export default FavoriteCourseList;