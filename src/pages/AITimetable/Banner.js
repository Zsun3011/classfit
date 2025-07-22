import React from "react";
import "../../styles/AITimetable.css";

const Banner = ({title, text, buttonText, onButtonClick}) => {
    return(
        <div className="banner">
            <div className="banner-title">{title}</div>
            <div className="banner-text">{text}</div>
            <button className="button" onClick={onButtonClick}>{buttonText}</button>
        </div>
    );
};

export default Banner;