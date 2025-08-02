import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import UserInfoCard from "./UserInfoCard";
import ScheduleList from "./ScheduleList";
import QuickLinkButton from "./QuickLinkButton";
import ProgressBar from "./ProgressBar";
import BaseTimetable from "../../components/BaseTimetable";
import { exampleData as timetableData } from "../AITimetable/Timetable";
import "../../styles/Dashboard.css";
import "../../styles/Home.css";

const progressDataAfter = [
    {title: "전체", percent: 75, score: "90/120학점"},
    {title: "전공", percent: 80, score: "48/60학점"},
    {title: "교양", percent: 55, score: "36/60학점"},
    {title: "공통과목", percent: 50, score: "5/10학점"},
    {title: "자율선택", percent: 70, score: "14/20학점"},
];

const exampleData = [
    { subject: "자료구조", day: "월", start: "09:00", end: "10:30", color: "#8ecae6" },
    { subject: "웹프로그래밍", day: "수", start: "13:00", end: "15:00", color: "#ffb703" },
    { subject: "확률과통계", day: "금", start: "10:30", end: "12:00", color: "#90be6d" }
];

const HomeAfterInput = () => {

      const majorSubjects = timetableData.filter(c => c.type === "major").map(c => c.subject);
    
      const generalSubjects = timetableData.filter(c => c.type === "general").map(c => c.subject);

    const info = {
        totalCredits: 18,
        hasMorning: false,
        freeDay: "목요일",
        major: majorSubjects,
        general: generalSubjects
    };

    const navigate = useNavigate();

    const handleDetail = () => {
        navigate("/GraduationDetail");
    }

    return (
        <div>
            <Header />
            <div className="Home-container">
                {/*왼쪽 화면*/}
                <div className="Home-left">
                    <UserInfoCard />
                    <ProgressBar progressItems={progressDataAfter} />
                    <ScheduleList />
                </div>

                {/*오른쪽 화면*/}
                <div className="Home-right">
                    <div className="TimetableSummary-container">
                        <h1>나의 시간표</h1>
                        <div className="TimetableSummary-section-top">
                            <BaseTimetable data={exampleData} />
                        </div>
                        <div className="TimetableSummary-section-bottom"> 
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
                        </div>
                    </div>
                </div>

                {/*오른쪽 아래*/}
                <div className="Home-bottom-right">
                    <QuickLinkButton />
                </div>

                {/*progressbar내의 버튼*/}
                <div className="HomeAfterInput-section">
                    <button className="ProgressDashboard-Detail-button" onClick={handleDetail}>자세히 보러가기</button>
                </div>
            </div>
        </div>
    )
}

export default HomeAfterInput;