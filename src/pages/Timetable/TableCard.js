import React from "react";
import Timetable from "./Timetable";

const TableCard = ({table, onClick}) => {
    return(
        <div className="table-card" onClick={onClick}>
            <div className="table-info">
                <div className="table-name">{table.name}</div>
                <div className="table-point">{table.point}</div>
                <div className="table-morning">{table.morning}</div>
                <div className="table-gbc">{table.gbc}</div>
            </div>
            <div className="table-preview">
                <Timetable data={table.data || []} isMini={true} />
            </div>
        </div>
    );
};

export default TableCard;