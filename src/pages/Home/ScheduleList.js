import React from "react";
import "../../styles/Home.css";

const ScheduleList = () => {
    return (
        <div className="ScheduleList-container">
            <h1>수강신청 기간 일정</h1>
            <div className="ScheduleList-section">
              <div className="Schedule-title">
                장바구니 기간              
              </div>
              <div className="Schedule-date">
                09/01(월)-09/07(일)
              </div>
              <div className="Schedule-Dday">
                D-6
              </div>
            </div>
            <div className="ScheduleList-section">
              <div className="Schedule-title">
                본수강
              </div>
              <div className="Schedule-date">
                09/08(월)-09/14(일)
              </div>
              <div className="Schedule-Dday">
                D-6
              </div>
            </div>
            <div className="ScheduleList-section">
              <div className="Schedule-title">
                정정기간
              </div>
              <div className="Schedule-date">
                09/15(월)-09/21(일)
              </div>
              <div className="Schedule-Dday">
                D-6
              </div>
            </div>
        </div>
    );
};

export default ScheduleList;