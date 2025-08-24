import React, { useEffect, useState, useMemo } from "react";
import { get } from "../../api";
import config from "../../config";
import "../../styles/MyPage.css";
import "../../styles/CourseList.css";
import "../../styles/Modal.css";

const dayMap = { 1: "월", 2: "화", 3: "수", 4: "목", 5: "금", 6: "토", 7: "일" };

// CourseRow와 동일한 스케줄 문자열 생성
const buildSchedule = (course) => {
  const day1 = course.dayOfWeek || "-";
  const day2 = course.dayOfWeek2nd || "";
  const time1 = course.start && course.end ? `${course.start}~${course.end}` : "-";
  const time2 = course.start2nd && course.end2nd ? `${course.start2nd}~${course.end2nd}` : "";

  const hasSecond = !!(course.dayOfWeek2nd && course.start2nd && course.end2nd);
  const sameTime = hasSecond && course.start2nd === course.start && course.end2nd === course.end;

  if (!hasSecond) return `${day1} / ${time1}`;
  return sameTime
    ? `${day1}${day2 ? `, ${day2}` : ""} / ${time1}` // 요일1, 요일2 / 같은 시간
    : `${day1} ${time1} / ${day2} ${time2}`;        // 요일1 시간1 / 요일2 시간2
};

const FavoriteCourseModal = ({ selectedCourses, onSelectCourse, onConfirm, onCancel }) => {
  const [favoriteCourses, setFavoriteCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 선택 상태 비교를 위해 문자열로 통일
  const selectedSet = useMemo(
    () => new Set((selectedCourses || []).map(String)),
    [selectedCourses]
  );

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // 1) 즐겨찾기 ID 목록
        const favRes = await get(config.INTEREST.LIST);
        const favIds = Array.isArray(favRes) ? favRes : (favRes?.result || []);
        const favIdSet = new Set(favIds.map(String));

        // 2) 전체 과목 목록 + 상세 결합 (CourseList와 동일한 방식)
        const listRes = await get(config.SUBJECTS.LIST, { sortBy: "id", direction: "asc" });
        const list = Array.isArray(listRes?.result) ? listRes.result : [];

        const detailResults = await Promise.allSettled(
          list.map((c) => get(config.SUBJECTS.DETAIL(c.id)))
        );

        const merged = list.map((c, idx) => {
          const detail =
            detailResults[idx].status === "fulfilled"
              ? detailResults[idx].value?.result
              : {};

          return {
            id: c.id,
            name: c.name,
            category: detail?.category ?? "-",
            description: c.description || "-",
            credit: detail?.credit ?? "-",
            professor: detail?.professor ?? "-",
            dayOfWeek: dayMap[detail?.dayOfWeek] ?? "-",
            dayOfWeek2nd: dayMap[detail?.dayOfWeek2nd] ?? null,
            start: detail?.start ?? "-",
            end: detail?.end ?? "-",
            start2nd: detail?.start2nd ?? null,
            end2nd: detail?.end2nd ?? null,
            courseType: detail?.description ?? "-", // 있으면 표시, 없으면 "-"
          };
        });

        // 3) 즐겨찾기만 필터
        const favCourses = merged.filter((c) => favIdSet.has(String(c.id)));
        setFavoriteCourses(favCourses);
      } catch (err) {
        console.error("즐겨찾기 과목 조회 실패:", err);
        setFavoriteCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleConfirm = () => {
    // 부모가 selection과 함께 과목 데이터도 필요하므로 선택된 과목 객체 전달
    const selectedCourseData = favoriteCourses.filter((course) =>
      selectedSet.has(String(course.id))
    );
    onConfirm(selectedCourseData);
  };

  if (loading) {
    return (
      <div className="FavoriteCourseModal-container">
        <div className="empty-message">불러오는 중…</div>
      </div>
    );
  }

  if (favoriteCourses.length === 0) {
    return (
      <div className="FavoriteCourseModal-container">
        <div className="empty-message">즐겨찾기한 과목이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="FavoriteCourseModal-container">
      <table className="Course-table">
        <thead>
          <tr>
            <th>선택</th>
            <th>즐겨찾기</th>
            <th>과목명</th>
            <th>영역</th>
            <th>학점</th>
            <th>담당교수</th>
            <th>요일/시간</th>
            <th>강좌유형</th>
          </tr>
        </thead>
        <tbody>
          {favoriteCourses.map((course) => {
            const checked = selectedSet.has(String(course.id));
            return (
              <tr key={course.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onSelectCourse(course.id)}
                    className="course-checkbox"
                  />
                </td>
                <td>
                  <img
                    src="/icons/star-yellow.png"
                    alt="즐겨찾기"
                    className="Course-icon"
                  />
                </td>
                <td>{course.name || "-"}</td>
                <td>{course.category || "-"}</td>
                <td>{course.credit ?? "-"}</td>
                <td>{course.professor || "-"}</td>
                <td>{buildSchedule(course)}</td>
                <td>{course.courseType || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="modal-buttons">
        <button className="modal-button-confirm" onClick={handleConfirm}>
          추가하기
        </button>
      </div>
    </div>
  );
};

export default FavoriteCourseModal;
