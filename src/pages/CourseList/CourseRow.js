import React from "react";

//course: 과목 객체 전체, 
// isFavorite: 즐겨찾기 여부, onToggleFavorite: 별 클릭 시 호출할 함수, 
const CourseRow = ( {course, isFavorite, onToggleFavorite}) => {
    return (
        <tr>
            <td onClick={() => onToggleFavorite(course.id)} style={{cursor: "pointer"}}>
                <img
                src={isFavorite ? "/icons/star-yellow.png" : "/icons/star-gray.png"}
                alt="즐겨찾기"
                className="Course-icon"
                />
            </td>
            <td>{course.name}</td> {/*과목명*/}
            <td>{course.area}</td> {/*영역*/}
            <td>{course.credit}</td> {/*학점*/}
            <td>{course.professor}</td> {/*담당교수*/}
            <td>{course.capacity}</td> {/*정원*/}
            <td>{course.schedule}</td> {/*요일/시간*/}
        </tr>
    )
}

export default CourseRow;