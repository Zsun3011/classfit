import React from "react";
import CourseRow from "./CourseRow";

//courses: 보여줄 과목 리스트, 
// favoriteCourseIds: 즐겨찾기된 과목 id 배열, onToggleFavorite: 별 클릭 시 호출할 함수, 
// alarmCourseIds: 알람설정된 과목 id 배열, onToggleAlarm: 종 클릭 시 호출할 함수
const CourseTable = ( {courses, favoriteCourseIds, onToggleFavorite, alarmCourseIds, onToggleAlarm}) => {
    return (
        <table className="Course-table">
            <thead>
                <tr>
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
                    <CourseRow
                    key={course.id}
                    course={course}
                    isFavorite={favoriteCourseIds.includes(course.id)}
                    isAlarm={alarmCourseIds.includes(course.id)}
                    onToggleFavorite={onToggleFavorite}
                    onToggleAlarm={onToggleAlarm}
                    />
                ))}
            </tbody>
        </table>
    )
}

export default CourseTable;