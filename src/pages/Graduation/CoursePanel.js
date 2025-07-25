import React from "react";
import "../../styles/Graduation.css";

const CoursePanel = ({ selectedCourse, courseData }) => {
    if (!selectedCourse) {
        selectedCourse = "전체";
    }

    const completedCourses = courseData[selectedCourse]?.completed || [];
    const incompleteCourses = courseData[selectedCourse]?.incomplete || [];

    return (
        <div className="course-panel">
            <div className="panel-header">
                <div>{selectedCourse} 과목 현황</div>
            </div>
            
            <div className="panel-content">
                <div className="course-section">
                    <div className="incomplete-section">
                        <h4 className="section-title incomplete-title">
                            <span className="status-icon">✗</span>
                            미이수 과목
                        </h4>
                        <div className="course-list">
                            {incompleteCourses.map((course, index) => (
                                <div key={index} className="course-item incomplete-item">
                                    <span className="course-icon">✗</span>
                                    <span className="course-name">{course}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="complete-section">
                        <h4 className="section-title complete-title">
                            <span className="status-icon">✓</span>
                            이수 완료 과목
                        </h4>
                        <div className="course-list">
                            {completedCourses.map((course, index) => (
                                <div key={index} className="course-item complete-item">
                                    <span className="course-icon">✓</span>
                                    <span className="course-name">{course}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursePanel;