import React from "react";
import "../styles/ProgressDashboard.css";

const ProgressItem = ( {title, percent = 0, score = "0/0학점", onClick,  isSelected = false, clickable = false}) => {
    return (
        <div 
            className={`ProgressItem-wrapper ${isSelected ? 'selected' : ''}`} 
            onClick={onClick} 
            style={{ cursor: clickable ? 'pointer' : 'default' }}
        >
            <div className="ProgressItem-title">
                <span>{title}</span>
                <span>{percent}%</span>
            </div>
            <div className="ProgressItem-bar-background">
                <div 
                className="ProgressItem-bar-fill"
                style={{width: `${percent}%`}} />
            </div>
            <div className="ProgressItem-score">
                {score}
            </div>
        </div>
    )
}

export default ProgressItem;