import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
    const location = useLocation();
    const currentPage = location.pathname;

    return (
        <header className="header">
            <div className="header-left">
                <div className="logo">
                    <Link to="/home">Classfit</Link>
                </div>
            </div>
            <nav className="header-nav">
                <Link to="/home" className={currentPage === "/home" ? "active" : ""}>
                 홈
                </Link>
                <Link to="/aiTimetable" className={currentPage === "/aiTimetable" ? "active" : ""}>
                 시간표 추천
                </Link>
                <Link to="/CommunityBoard" className={currentPage === "/CommunityBoard" ? "active" : ""}>
                 게시판
                </Link>
                <Link to="/graduationDetail" className={currentPage === "/graduationDetail" ? "active" : ""}>
                 진척도
                </Link>
                <Link to="/courseList" className={currentPage === "/courseList" ? "active" : ""}>
                 과목조회
                </Link>
                <Link to="/myPage" className={currentPage === "/myPage" ? "active" : ""}>
                 마이페이지
                </Link>
            </nav>
        </header>
    );
};

export default Header;