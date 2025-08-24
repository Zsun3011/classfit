import { readProfile } from "./commonutil";

// 한글 → 서버 ENUM
export const toGradEnum = (ko) => {
  switch ((ko || "").trim()) {
    case "일반 졸업": return "GENERAL";
    case "복수 전공": return "DOUBLE_MAJOR";
    case "부전공":   return "MINOR";
    default:         return "GENERAL";
  }
};

// 과목 표준화 (스키마: { courseCode, courseTitle })
const normalizeCourse = (item = {}) => {
  const code =
    item.courseCode ?? item.code ?? item.course_id ?? item.id ?? "";
  const title =
    item.courseTitle ?? item.title ?? item.course_name ?? item.name ?? "";
  return { courseCode: String(code), courseTitle: String(title) };
};

export const buildProfilePayload = (opts = {}) => {
  const { includeCourses = false, graduationType, override = {} } = opts;

  const base = { ...readProfile(), ...override };

  const gt = String(
    graduationType || base.graduationType || "GENERAL"
  );

  const rawList = Array.isArray(base.courseHistory)
    ? base.courseHistory
    : Array.isArray(base.completedCourses)
    ? base.completedCourses
    : [];

  const completedCourses = includeCourses
    ? rawList
        .map(normalizeCourse)
        .filter((c) => c.courseCode && c.courseTitle)
    : [];

  return {
    university: String(base.university || ""),
    major: String(base.major || ""),
    enrollmentYear: Number(base.enrollmentYear ?? 0),
    graduationType: gt,
    completedCourses,
  };
};
