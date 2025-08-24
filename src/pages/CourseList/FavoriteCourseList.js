// src/pages/Courses/FavoriteCourseList.jsx
import React, { useMemo } from "react";
import CourseTable from "./CourseTable";

const keyOf = (c) => c?.subjectId ?? c?.id;

const FavoriteCourseList = ({
    courses = [],
    favoriteCourseIds = [],
    onToggleFavorite = () => {},
    selectable = false,
    selectedIds = [],
    onToggleSelect = () => {},
}) => {
    const favSet = useMemo(() => new Set((favoriteCourseIds || []).map(String)), [favoriteCourseIds]);

    const favoriteCourses = useMemo(
        () => courses.filter((c) => favSet.has(String(keyOf(c)))),
        [courses, favSet]
    );

    return (
        <div className="FavoriteCourseList-container">
            <h1 className="FavoriteCourseList-title">즐겨찾기</h1>
            <CourseTable
                courses={favoriteCourses}
                favoriteCourseIds={favoriteCourseIds}
                onToggleFavorite={onToggleFavorite}
                selectable={selectable}
                selectedIds={selectedIds}
                onToggleSelect={onToggleSelect}
            />
        </div>
    );
};

export default FavoriteCourseList;
