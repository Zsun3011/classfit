import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import UserInfoCard from "./UserInfoCard";
import ScheduleList from "./ScheduleList";
import QuickLinkButton from "./QuickLinkButton";
import ProgressBar from "./ProgressBar";
import TimetableSummary from "./TimetableSummary";
import "../../styles/Home.css";

const progressDataAfter = [
    {title: "전체", percent: 75, score: "90/120학점"},
    {title: "전공", percent: 80, score: "48/60학점"},
    {title: "교양", percent: 55, score: "36/60학점"},
    {title: "공통과목", percent: 50, score: "5/10학점"},
    {title: "자율선택", percent: 70, score: "14/20학점"},
];

const HomeAfterInput = () => {

    const navigate = useNavigate();

    const handleDetail = () => {
        navigate("/");
    }

    return (
        <div>
            <Header />
            <UserInfoCard />
            <ScheduleList />
            <QuickLinkButton />
            <TimetableSummary />
            <ProgressBar progressItems={progressDataAfter} />
            <div className="HomeAfterInput-section">
                <button className="ProgressDashboard-button" onClick={handleDetail}>자세히 보러가기</button>
            </div>
        </div>
    )
}

export default HomeAfterInput;