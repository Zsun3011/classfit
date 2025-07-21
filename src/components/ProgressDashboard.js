import React from "react";
import ProgressItem from "./ProgressItem";
import "../styles/ProgressDashboard.css";


const ProgressDashboard = ( { progressItems = []}) => {
    return (

        <div className="ProgressDashboard-container">
            <h1>Progress Bar</h1>
            {progressItems.map((item, index) => (
                <ProgressItem
                  key={index}
                  title={item.title}
                  percent={item.percent}
                  score={item.score}
                />
            ))}
        </div> 
    )
}

export default ProgressDashboard;