import React, { useState, useEffect }from "react";
import Header from "../../components/Header";
import CourseTable from "./CourseTable";
import dummyCourses from "./dummyCourses";
import FavoriteCourseList from "./FavoriteCourseList";
import CourseFilter from "./CourseFilter";
import "../../styles/CourseList.css";

const CourseList = () => {

    //즐겨찾기, 알림설정 상태 보존
    const getInitialFavorites = () => {
        const stored = localStorage.getItem("favoriteIds")
        return stored ? JSON.parse(stored) : [];
    };

    const getInitialAlarms = () => {
        const stored = localStorage.getItem("alarmIds")
        return stored ? JSON.parse(stored) : [];
    };

    const [favoriteIds, setFavoriteIds] = useState(getInitialFavorites());
    const [alarmIds, setAlarmIds] = useState(getInitialAlarms());
    const [filteredCourses, setFilteredCourses] = useState(dummyCourses);

    const [filter, setFilter] = useState({
        professor: "",
        courseName: "",
        days: [],
        categories: []
    });

    useEffect(() => {
        const storedFavorites = JSON.parse(localStorage.getItem("favoriteIds") || "[]");
        const storedAlarms = JSON.parse(localStorage.getItem("alarmIds") || "[]");
        setFavoriteIds(storedFavorites);
        setAlarmIds(storedAlarms);
    }, []);

    /*즐겨찾기 설정*/
    const handleToggleFavorite = (courseId) => {
        setFavoriteIds((prev) =>{
            const updated = prev.includes(courseId)
            ? prev.filter((id) => id !== courseId)
            : [...prev, courseId];
            localStorage.setItem("favoriteIds", JSON.stringify(updated));
            return updated;
        });
    };

    /*알람 설정*/
    const handleToggleAlarm = (courseId) => {
        setAlarmIds((prev) => {
            const updated = prev.includes(courseId)
            ? prev.filter((id) => id !==courseId)
            : [...prev, courseId];
            localStorage.setItem("alarmIds", JSON.stringify(updated));
            return updated;
        });
    };

    /*필터 적용*/
    const applyFilters = () => {
        const {professor, courseName, days, categories} = filter;

        const result = dummyCourses.filter((course) => {
            const professorMatch = !professor || course.professor.includes(professor);
            const courseNameMatch = !courseName || course.name.includes(courseName);
            const dayMatch = days.length === 0 || days.some((day) => course.schedule.includes(day));
            const categoryMatch = categories.length === 0 || categories.includes(course.area);

            return professorMatch && courseNameMatch && dayMatch && categoryMatch;
        })

        setFilteredCourses(result);
    };

    return (
        <div>
            <Header />
            <div className="CourseList-section1">
                {/*FavoriteCourseList 렌더링 */}
                <FavoriteCourseList 
                courses={dummyCourses}
                favoriteCourseIds={favoriteIds}
                alarmCourseIds={alarmIds}
                onToggleFavorite={handleToggleFavorite}
                onToggleAlarm={handleToggleAlarm}
                />
            </div>
            <CourseFilter 
                filter={filter} 
                setFilter={setFilter} 
                onApplyFilter={applyFilters}
            />
            <div className="CourseList-container">
                <h1 className="CourseList-title">과목 리스트</h1>
                <div className="CourseList-section2">
                    {/*CourseTable 렌더링 */}
                    <CourseTable
                    courses={filteredCourses}
                    favoriteCourseIds={favoriteIds}
                    alarmCourseIds={alarmIds}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleAlarm={handleToggleAlarm}
                    />
                </div>
            </div>
        </div>
    );
};

export default CourseList;