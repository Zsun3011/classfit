// src/pages/Courses/CourseList.jsx
import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/Header";
import CourseTable from "./CourseTable";
import FavoriteCourseList from "./FavoriteCourseList";
import CourseFilter from "./CourseFilter";
import "../../styles/CourseList.css";
import { get, post, del } from "../../api";
import config from "../../config";
import { dayMap } from "../Timetable/timetableFormat";

const CourseList = () => {
  const [allCourses, setAllCourses] = useState([]);          // 전체 과목 (상세 합친 결과)
  const [filteredCourses, setFilteredCourses] = useState([]); // 필터된 과목
  const [favoriteIds, setFavoriteIds] = useState([]);        // 즐겨찾기 id
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState({
    professor: "",
    courseName: "",
    days: [],
    categories: [],
  });

  // 초기 로드 시 즐겨찾기 서버에서 가져오기
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // 과목 리스트 불러오기
        const res = await get(config.SUBJECTS.LIST, { sortBy: "id", direction: "asc" });
        const list = Array.isArray(res?.result) ? res.result : [];

        const detailResults = await Promise.allSettled(
          list.map((c) => get(config.SUBJECTS.DETAIL(c.id)))
        );

        const merged = list.map((c, idx) => {
          const detail = detailResults[idx].status === "fulfilled" ? detailResults[idx].value?.result : {};
          return {
            id: c.id,
            name: c.name,
            category: detail?.category ?? "-",
            description: c.description || "-",
            credit: detail?.credit ?? "-",
            professor: detail?.professor ?? "-",
            dayOfWeek:  dayMap[detail?.dayOfWeek] ?? "-",
            dayOfWeek2nd: dayMap[detail?.dayOfWeek2nd] ?? null,
            start: detail?.start ?? "-",
            end: detail?.end ?? "-",
            start2nd: detail?.start2nd ?? null,
            end2nd: detail?.end2nd ?? null,
          };
        });

        setAllCourses(merged);
        setFilteredCourses(merged);

        //즐겨찾기 가져오기
        const favRes = await get(config.INTEREST.LIST);
        setFavoriteIds(Array.isArray(favRes) ? favRes : []);

      } catch (e) {
        console.error("과목 불러오기 실패:", e);
        alert("과목 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 즐겨찾기 토글
  const handleToggleFavorite = async (courseId) => {
    try {
      if (favoriteIds.includes(courseId)) {
        //즐겨찾기 해제
        await del(config.INTEREST.DELETE(courseId));
        setFavoriteIds((prev) => prev.filter((id) => id !== courseId));
      } else {
        //즐겨찾기 등록
        await post(config.INTEREST.ENROLL(courseId));
        setFavoriteIds((prev) => [...prev, courseId]);
      }
    } catch (e) {
      console.error("즐겨찾기 토글 실패:", e);
      alert("즐겨찾기 처리 중 오류가 발생했습니다.");
    }
  };

  // 필터 적용
  const applyFilters = () => {
    const { professor, courseName, days, categories } = filter;

    const result = allCourses.filter((course) => {
    const professorMatch = !professor || (course.professor || "").includes(professor);
    const courseNameMatch = !courseName || (course.name || "").includes(courseName);
    const dayMatch = days.length === 0 || days.includes(course.dayOfWeek);
    const categoryMatch = categories.length === 0 || categories.includes(course.category || "-");
      return professorMatch && courseNameMatch && dayMatch && categoryMatch;
    });

    setFilteredCourses(result);
  };

  // FavoriteCourseList 접근용
  const coursesById = useMemo(() => {
    const m = new Map();
    allCourses.forEach((c) => m.set(c.id, c));
    return m;
  }, [allCourses]);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="CourseList-container"><h2>불러오는 중…</h2></div>
      </div>
    );
  } 

  return (
    <div>
      <Header />

      {/* 즐겨찾기 */}
      <div className="CourseList-section1">
        <FavoriteCourseList
          courses={Array.from(coursesById.values())}
          favoriteCourseIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>

      {/* 필터 */}
      <CourseFilter filter={filter} setFilter={setFilter} onApplyFilter={applyFilters} />

      {/* 전체 과목 */}
      <div className="CourseList-container">
        <h1 className="CourseList-title">과목 리스트</h1>
        <div className="CourseList-section2">
          <CourseTable
            courses={filteredCourses}
            favoriteCourseIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseList;
