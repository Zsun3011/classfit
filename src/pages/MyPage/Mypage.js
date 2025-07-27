import React, {useState, useEffect} from "react";
import Header from "../../components/Header";
import dummyCourses from "../CourseList/dummyCourses";
import UserInfoEditor from "./UserInfoEditor";
import BookmarkManager from "./BookmarkManager";
import "../../styles/MyPage.css";
import "../../styles/CourseList.css";

const Mypage = () => {

    const [favoriteIds, setFavoriteIds] = useState([]);
    const [alarmIds, setAlarmIds] = useState([]);

    useEffect(() => {
        const storedFavorites = JSON.parse(localStorage.getItem("favoriteIds") || "[]");
        const storedAlarms = JSON.parse(localStorage.getItem("alarmIds") || "[]");
        setFavoriteIds(storedFavorites);
        setAlarmIds(storedAlarms);
    }, []);

    /*알람 설정*/
    const handleToggleAlarm = (courseId) => {
        const updated = alarmIds.includes(courseId)
        ? alarmIds.filter((id) => id !==courseId)
        : [...alarmIds, courseId];
        
        setAlarmIds(updated);
        localStorage.setItem("alarmIds", JSON.stringify(updated));
    };

    /*즐겨찾기 설정*/
    const handleToggleFavorite = (courseId) => {
        const updated = favoriteIds.includes(courseId)
        ? favoriteIds.filter((id) => id !== courseId)
        : [...favoriteIds, courseId];

        setFavoriteIds(updated);
        localStorage.setItem("favoriteIds", JSON.stringify(updated));
    };

    return (
        <div>
            <Header />
            <UserInfoEditor />
            <div className="MyPage-section">
                {/*BookmarkManager 렌더링*/}
                <BookmarkManager
                courses={dummyCourses} 
                favoriteCourseIds={favoriteIds}
                alarmCourseIds={alarmIds}
                onToggleFavorite={handleToggleFavorite}
                onToggleAlarm={handleToggleAlarm}
                setAlarmIds={setAlarmIds}
                />
            </div>
        </div>
    );
};

export default Mypage;