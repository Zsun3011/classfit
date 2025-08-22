export const toSemesterEnum = (label) => ({
    "1학기": "FIRST",
    "2학기": "SECOND",
    "여름학기": "SUMMER",
    "겨울학기": "WINTER",
}[label] || "FIRST");

export const fromSemesterEnum = (e) => ({
    "FIRST" : "1학기",
    "SECOND" : "2학기",
    "SUMMER" : "여름학기",
    "WINTER" : "겨울학기",
}[e] || "1학기");

export const toRetakeEnum = (label) => (label === "재수강" ? "RETAKE" : "ORIGINAL");
export const fromRetakeEnum = (e) => (e === "RETAKE" ? "재수강" : "본수강");

export const toServerPayload = (item) => ({
    year: Number(item.year),
    semester: toSemesterEnum(item.semester),
    courseCode: String(item.courseCode || ""),
    courseTitle: String(item.courseTitle || item.name || ""),
    credit: Number(item.credit) || 0,
    category: item.category || "",
    retake: toRetakeEnum(item.retake),
});

export const fromServerItem = (row) => ({
    id: row.id,
    serverId: row.id,
    name: row.courseTitle,
    category: row.category,
    credit: row.credit,
    year: String(row.year),
    semester: fromSemesterEnum(row.semester),
    retake: fromRetakeEnum(row.retake),
});