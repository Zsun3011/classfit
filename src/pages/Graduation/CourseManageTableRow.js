import React, {useState} from "react";
const CourseManageTableRow = ({ course, onRemove, onEdit }) => {
    const [isHoveringRemove, setIsHoveringRemove] = useState(false);
    const [isHoveringEdit, setIsHoveringEdit] = useState(false);

    return (
        <tr>
            <td>{course.name}</td>
            <td>{course.category}</td>
            <td>{course.credit}</td>
            <td>{course.retake}</td>
            <td
                onClick={() => onEdit(course)}
                onMouseEnter={() => setIsHoveringEdit(true)}
                onMouseLeave={() => setIsHoveringEdit(false)}
                style={{ cursor: "pointer" }}
            >
                <img
                    src={isHoveringEdit ? "/icons/edit-blue.png" : "/icons/edit-gray.png"}
                    alt="수정"
                    className="CourseManage-icon"
                />
            </td>
            <td
                onClick={() => onRemove(course.id)}
                onMouseEnter={() => setIsHoveringRemove(true)}
                onMouseLeave={() => setIsHoveringRemove(false)}
                style={{ cursor: "pointer" }}
            >
                <img
                    src={isHoveringRemove ? "/icons/remove-red.png" : "/icons/remove-gray.png"}
                    alt="삭제"
                    className="CourseManage-icon"
                />
            </td>
            
        </tr>
    );
};


export default CourseManageTableRow ;