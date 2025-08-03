import React from "react";
import Header from "../../components/Header";
import GraduationProgress from "./GraduationProgress";
import CourseManager from "./CourseManager";



const progressDataAfter = [
    {title: "전체", percent: 75, score: "90/120학점"},
    {title: "전공", percent: 80, score: "48/60학점"},
    {title: "교양", percent: 55, score: "36/60학점"},
    {title: "공통과목", percent: 50, score: "5/10학점"},
    {title: "자율선택", percent: 70, score: "14/20학점"},
  ];

const GraduationDetail = () => {
    return (
        <div>
            <Header />
            <div className="GraduationDetail-container">
                <GraduationProgress progressItems={progressDataAfter} />
                <CourseManager />
            </div>
        </div>
    );
};

export default GraduationDetail;