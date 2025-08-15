import React from "react";
import "../../styles/Home.css";

const ScheduleList = () => {

  const year = new Date().getFullYear();
  const schedules = [
    { title: "장바구니 기간", start: `${year}-08-06`, end: `${year}-08-07` },
    { title: "본수강", start: `${year}-08-13`, end: `${year}-08-14` },
    { title: "정정기간", start: `${year}-09-01`, end: `${year}-09-05` },
  ];

  const days = ["일", "월", "화", "수", "목", "금", "토"];

  // 날짜 유틸
  const toMidnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const parse = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m -1, d);
  };

  const fmtMDW = (date) => {
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const w = days[date.getDay()];
    return `${mm}/${dd}(${w})`;
  };

  const fmtRange = (startISO, endISO) => {
    const s = parse(startISO);
    const e = parse(endISO);
    return `${fmtMDW(s)}-${fmtMDW(e)}`;
  };

  // D-day 계산
  const calcDDay = (startISO, endISO) => {
    const today = toMidnight(new Date());
    const s = toMidnight(parse(startISO));
    const e = toMidnight(parse(endISO));
    
    if (today < s) {
      const diffprev = Math.ceil((s - today) / 86400000); // 1일(ms) , 남은 일수 
      return `D-${diffprev}`;
    } else if (today > e) {
      const diffpost = Math.floor((today - e) / 86400000); // 1일(ms) , 지난 일수
      return `D+${diffpost}`;
    } else {
      return "D-0"; // 진행중
    }
  };

    return (
        <div className="ScheduleList-container">
            <div className="ScheduleList-container-title">수강신청 기간 일정</div>

            {schedules.map((sch) => (
              <div className="ScheduleList-section" key={sch.title}>
                <div className="Schedule-title">{sch.title}</div>
                <div className="Schedule-date">{fmtRange(sch.start, sch.end)}</div>
                <div className="Schedule-Dday">{calcDDay(sch.start, sch.end)}</div>
              </div>
            ))}
        </div>
    );
};

export default ScheduleList;