import React from "react";
import CourseRow from "../CourseList/CourseRow";
import "../../styles/MyPage.css";
import "../../styles/CourseList.css";

const BookmarkManager = ({courses, favoriteCourseIds, onToggleFavorite, alarmCourseIds, onToggleAlarm, setAlarmIds}) => {

    const favoriteCourses = courses.filter(course => favoriteCourseIds.includes(course.id));

    //알람 모두 켜기
    const handleTurnOnAlarm = () => {
        const favoriteCourseIds = favoriteCourses.map(course => course.id);
        const newAlarmIds = Array.from(new Set([...alarmCourseIds, ...favoriteCourseIds]));
        setAlarmIds(newAlarmIds);
        localStorage.setItem("alarmIds", JSON.stringify(newAlarmIds));
    };

    //알람 모두 끄기
    const handleTurnOffAlarm = () => {
        const favoriteCourseIds = favoriteCourses.map(course => course.id);
        const newAlarmIds = alarmCourseIds.filter(id => !favoriteCourseIds.includes(id));
        setAlarmIds(newAlarmIds);
        localStorage.setItem("alarmIds", JSON.stringify(newAlarmIds));
    };

    return (
        <div className="BookmarkManager-container">
            <h1 className="BookmarkManager-title">알림 및 즐겨찾기 설정</h1>
            <div className="Alarm-set">
                <div className="Alarm-title">전체 알림</div>
                <button className="Alarm-on" onClick={handleTurnOnAlarm}>켜기</button>
                <button className="Alarm-off" onClick={handleTurnOffAlarm}>끄기</button>
            </div>
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
                    {favoriteCourses.map((course) => (
                        <CourseRow
                        key={course.id}
                        course={course}
                        isFavorite={true}
                        isAlarm={alarmCourseIds.includes(course.id)}
                        onToggleFavorite={onToggleFavorite}
                        onToggleAlarm={onToggleAlarm}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default BookmarkManager;