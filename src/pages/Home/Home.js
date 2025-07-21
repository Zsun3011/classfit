import React from "react";
import Header from "../../components/Header";
import UserInfoCard from "./UserInfoCard";
import ScheduleList from "./ScheduleList";
import QuickLinkButton from "./QuickLinkButton";
import ProgressBar from "./ProgressBar";
import TimetableSummary from "./TimetableSummary";

const progressDataBefore = [
    {title: "전체", percent: 0, score: "0/120학점"},
    {title: "전공", percent: 0, score: "0/60학점"},
    {title: "교양", percent: 0, score: "0/60학점"},
    {title: "공통과목", percent: 0, score: "0/10학점"},
    {title: "자율선택", percent: 0, score: "0/20학점"},
];

const Home = () => {
    return (
        <div>
            <Header />
            <UserInfoCard />
            <ScheduleList />
            <QuickLinkButton />
            <TimetableSummary />
            <ProgressBar progressItems={progressDataBefore} />
        </div>
    );
};

export default Home;