// src/pages/Courses/CourseList.jsx
import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/Header";
import CourseTable from "./CourseTable";
import FavoriteCourseList from "./FavoriteCourseList";
import CourseFilter from "./CourseFilter";
import "../../styles/CourseList.css";
import { get } from "../../api";
import config from "../../config";

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

   const dayMap = { 1: "월", 2: "화", 3: "수", 4: "목", 5: "금", 6: "토", 7: "일",};

  // 초기 로드: LIST → 각 id로 DETAIL 조회 → 병합
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // 1) LIST 호출
        const res = await get(config.SUBJECT.LIST, { sortBy: "id", direction: "asc" });
        const list = Array.isArray(res?.result) ? res.result : [];

        // 2) 각 id로 DETAIL 병렬 호출
        const detailResults = await Promise.allSettled(
          list.map((c) => get(config.SUBJECT.DETAIL(c.id)))
        );

        // 3) LIST + DETAIL 합치기
        const merged = list.map((c, idx) => {
          const detail = detailResults[idx].status === "fulfilled" ? detailResults[idx].value?.result : {};
          const dayStr = detail?.dayOfWeek ? dayMap[detail.dayOfWeek] || detail.dayOfWeek: "-"; // 숫자 -> 요일

          return {
            id: c.id,
            name: c.name,
            category: detail?.category ?? "-",
            description: c.description || "-",
            credit: detail?.credit ?? "-",
            professor: detail?.professor ?? "-",
            dayOfWeek: dayStr,
            start: detail?.start ?? "-",
            end: detail?.end ?? "-",
          };
        });

        setAllCourses(merged);
        setFilteredCourses(merged);

        // 즐겨찾기 불러오기
        const storedFavorites = JSON.parse(localStorage.getItem("favoriteIds") || "[]");
        setFavoriteIds(storedFavorites);
      } catch (e) {
        console.error("과목 불러오기 실패:", e);
        alert("과목 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 즐겨찾기 토글
  const handleToggleFavorite = (courseId) => {
    setFavoriteIds((prev) => {
      const updated = prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId];
      localStorage.setItem("favoriteIds", JSON.stringify(updated));
      return updated;
    });
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
