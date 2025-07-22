import React from "react";

const TableCard = ({table, onClick}) => {
    return(
        <div className="table-card" onClick={onClick}>
            {table.isNew && <div className="new-badge">New</div>}
            
            <div className="table-name">{table.name}</div>
            <div className="table-point">{table.point}</div>
            <div className="table-morning">{table.morning}</div>
            <div className="table-gbc">{table.gbc}</div>
        </div>
    );
};

export default TableCard;