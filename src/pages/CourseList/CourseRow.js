// src/pages/Courses/CourseRow.jsx
import React from "react";
import { scheduleFromCourse } from "../Timetable/timetableFormat";

const CourseRow = ({ course, isFavorite, onToggleFavorite }) => {
  const schedule = scheduleFromCourse(course);

  return (
    <tr>
      <td onClick={() => onToggleFavorite(course.id)} style={{ cursor: "pointer" }}>
        <img
          src={isFavorite ? "/icons/star-yellow.png" : "/icons/star-gray.png"}
          alt="즐겨찾기"
          className="Course-icon"
        />
      </td>
      <td>{course.name}</td>
      <td>{course.category || "-"}</td>
      <td>{course.credit || "-"}</td>
      <td>{course.professor || "-"}</td>
      <td>{schedule}</td>
      <td
        title={course.description || ""}
        style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        {course.description || "-"}
      </td>
    </tr>
  );
};

export default CourseRow;
