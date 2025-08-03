import React, {useEffect} from "react";
import "../../styles/Dashboard.css";
import ProgressDashboard from "../../components/ProgressDashboard";
import { exampleData } from "./Timetable";

const Dashboard = ({ conditions, onSubjectsParsed }) => {
  const timetableData = conditions?.data || exampleData;

  const majorSubjects = timetableData.filter(c => c.type === "major").map(c => c.subject);

  const generalSubjects = timetableData.filter(c => c.type === "general").map(c => c.subject);
  
  const info = {
    totalCredits: conditions?.credit ?? "-",
    hasMorning: conditions?.preferredTimes?.includes("오전") ?? false,
    freeDay: conditions?.avoidDays?.join(", ") || "-",
    major: majorSubjects,
    general: generalSubjects
  };

  const progressDataAfter = [
    {title: "전체", percent: 75, score: "90/120학점"},
    {title: "전공", percent: 80, score: "48/60학점"},
    {title: "교양", percent: 55, score: "36/60학점"},
    {title: "공통과목", percent: 50, score: "5/10학점"},
    {title: "자율선택", percent: 70, score: "14/20학점"},
  ];

  useEffect(() => {
    const timetableData = conditions?.data || exampleData;

    const majorSubjects = timetableData.filter(c => c.type === "major").map(c => c.subject);
    const generalSubjects = timetableData.filter(c => c.type === "general").map(c => c.subject);

    const parsedInfo = {
      totalCredits: conditions?.credit ?? "-",
      hasMorning: conditions?.preferredTimes?.includes("오전") ?? false,
      freeDay: conditions?.avoidDays?.join(", ") || "-",
      major: majorSubjects,
      general: generalSubjects
    };

    onSubjectsParsed?.(parsedInfo); // 전체를 넘김
  }, [conditions, onSubjectsParsed]);

  return (
    <div className="dashboard-container">      
      <div className="dashboard-section">
        <div className="dashboard-subtitle">수강 정보</div>
        <div className="dashboard-list">
          <div>
            <span className="dashboard-label">• 학점:</span>{" "}
            <span className="dashboard-value highlight">{info.totalCredits}학점</span>
          </div>
          <div>
          <span className="dashboard-label">• 오전 수업 포함 여부:</span>{" "}
          <span className="dashboard-value">{info.hasMorning ? "O" : "0"}</span>
          </div>
          <div>
          <span className="dashboard-label">• 공강:</span>{" "}
          <span className="dashboard-value highlight">{info.freeDay}</span>
          </div>
        </div>
      </div>
      <div className="dashboardsection-container">
        <div className="dashboard-section">
          <div className="dashboard-subtitle">전공</div>
          <ul className="dashboard-list">
            {info.major.map((item, index) => (
              <li key={index}>• {item}</li>
            ))}
          </ul>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-subtitle">교양</div>
          <ul className="dashboard-list">
            {info.general.map((item, index) => (
              <li key={index}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
      <ProgressDashboard progressItems={progressDataAfter} />
    </div>
  );
};

export default Dashboard;
