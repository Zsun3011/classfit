import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import UserInfoCard from "./UserInfoCard";
import ScheduleList from "./ScheduleList";
import QuickLinkButton from "./QuickLinkButton";
import ProgressBar from "./ProgressBar";
import BaseTimetable from "../../components/BaseTimetable";
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

    const navigate = useNavigate();

    const handleDetail = () => {
        navigate("/GraduationDetail");
    }

    return (
        <div>
            <Header />
            <div className="Home-container">
                <div className="Home-left">
                    <UserInfoCard />
                    <ProgressBar progressItems={progressDataAfter} />
                    <ScheduleList />
                </div>
                <div className="Home-right">
                    <div className="TimetableSummary-container">
                        <h1>나의 시간표</h1>
                        <div className="TimetableSummary-section-top">
                            <BaseTimetable data={exampleData} />
                        </div>
                        <div className="TimetableSummary-section-bottom">
                            <p>수강정보</p>
                        </div>
                    </div>
                </div>
                <div className="Home-bottom-right">
                    <QuickLinkButton />
                </div>
                <div className="HomeAfterInput-section">
                    <button className="ProgressDashboard-Detail-button" onClick={handleDetail}>자세히 보러가기</button>
                </div>
            </div>
        </div>
    )
}

export default HomeAfterInput;