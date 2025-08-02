import React from "react";
import Header from "../../components/Header";
import UserInfoEditor from "./UserInfoEditor";
import NotificationManager from "./NotificationManager";
import "../../styles/MyPage.css";

const Mypage = () => {

    return (
        <div>
            <Header />
            <UserInfoEditor />
            <NotificationManager />
        </div>
    );
};

export default Mypage;