import React from "react";
import Header from "../../components/Header";
import UserInfoEditor from "./UserInfoEditor";
import "../../styles/MyPage.css";

const Mypage = () => {
    return (
        <div>
            <Header />
            <UserInfoEditor />
        </div>
    );
};

export default Mypage;