import React from "react";
import ProgressItem from "./ProgressItem";
import "../styles/ProgressDashboard.css";

const ProgressDashboard = ( { progressItems = [], onItemClick = null, selectedCourse = null}) => {
    return (

        <div className="ProgressDashboard-container">
            <div className="ProgressDashboard-title">Progress Bar</div>
            {progressItems.map((item, index) => (
                <ProgressItem
                  key={index}
                  title={item.title}
                  percent={item.percent}
                  score={item.score}
                  onClick={onItemClick ? () => onItemClick(item.title) : undefined}
                  isSelected={selectedCourse === item.title}
                  clickable={!!onItemClick}
                />
            ))}
        </div> 
    )
}

export default ProgressDashboard;