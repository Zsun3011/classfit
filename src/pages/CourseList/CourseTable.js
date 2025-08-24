// src/pages/Courses/CourseTable.jsx
import React, { useMemo } from "react";
import CourseRow from "./CourseRow";

const keyOf = (c) => c?.subjectId ?? c?.id;

const CourseTable = ({
  courses = [],
  favoriteCourseIds = [],
  onToggleFavorite = () => {},
  selectable = false,
  selectedIds = [],
  onToggleSelect = () => {},
}) => {
  const favSet = useMemo(() => new Set((favoriteCourseIds || []).map(String)), [favoriteCourseIds]);
  const selSet = useMemo(() => new Set((selectedIds || []).map(String)), [selectedIds]);

    return (
        <table className="Course-table">
            <thead>
                <tr>
                    {selectable && <th>선택</th>}
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
                {courses.map((course) => {
                    const k = String(keyOf(course));
                    const leadingCell = selectable ? (
                    <td>
                        <input
                        type="checkbox"
                        className="course-checkbox"
                        checked={selSet.has(k)}
                        onChange={() => onToggleSelect(k)}
                        />
                    </td>
                    ) : null;

                    return (
                    <CourseRow
                        key={k}
                        course={course}
                        isFavorite={favSet.has(k)}
                        onToggleFavorite={onToggleFavorite}
                        leadingCell={leadingCell}
                    />
                );
            })}
            </tbody>
        </table>
    );
};

export default CourseTable;
