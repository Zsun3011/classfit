import React, {useEffect, useMemo, useState } from "react";
import { load, subscribe, upsertByName, patchById, removeById } from "./CourseHistoryStore";
import { readProfile } from "../Onboarding/commonutil";
import "../../styles/CourseManager.css";

// 간단 과목 DB(백엔드 연동 전)
const subjects = [
    "자료구조",
    "알고리즘",
    "운영체제",
    "데이터베이스",
    "컴퓨터네트워크",
    "소프트웨어공학",
    "인공지능",
    "머신러닝",
];

const getCourseInfo = (name) => {
    const db = {
        자료구조: { category: "전공필수", credit: 3 },
        알고리즘: { category: "전공필수", credit: 3 },
        운영체제: { category: "전공필수", credit: 3 },
        데이터베이스: { category: "전공선택", credit: 3 },
        컴퓨터네트워크: { category: "전공선택", credit: 3 },
        소프트웨어공학: { category: "전공선택", credit: 3 },
        인공지능: { category: "전공선택", credit: 3 },
        머신러닝: { category: "전공선택", credit: 3 },   
    };
    return db[name] || { category: "일반 선택", credit: 3 };
};

export default function CourseHistoryManager({onChange}) {

    const [items, setItems] = useState(() => load());

    useEffect(() => {
        setItems(load());
        const unsub = subscribe((next) => {
            setItems(next);
            onChange?.(next);
        });
        return unsub;
    }, [onChange]);
    
    // 연도/학기 선택
    const profile = readProfile();
    const now = new Date();
    const currentYear = now.getFullYear();
    const endYear = currentYear;
    const enrollment = typeof profile.enrollmentYear === "number" ? profile.enrollmentYear : endYear;
    const startYear = Math.min(enrollment, endYear - 2);
    const yearOptions = useMemo(
        () => Array.from ({ length: endYear - startYear + 1}, // 시작 ~ 올해(포함)
        (_, i) => String(startYear + i)),
        [startYear, endYear]
    );

    const [year, setYear] = useState(yearOptions.at(-1)); // 가장 최근 연도
    const [semester, setSemester] = useState("1학기");

    // 입력 + 드롭다운
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    /*// 다른 페이지에서의 변경도 실시간 반영
    useEffect(() => {
        setItems(load());
        const unsub = subscribe((next) => setItems(next));
        return unsub;
    }, []);*/

    // 드롭다운 후보
    const candidates = useMemo(() => {
        if(!query.trim()) return [];
        return subjects.filter((s) => s.includes(query.trim()));
    }, [query]);

    // 추가
    const addCourse = (name) => {
        const info = getCourseInfo(name);
        upsertByName({
            name,
            category: info.category,
            credit: info.credit,
            retake: "본수강",
            year,
            semester,
        });
        setQuery("");
        setOpen(false);
    };

    // 본수강/재수강
    const toggleRetake = (id) => {
        patchById(id, (prev) => 
            ({ retake: prev.retake === "본수강" ? "재수강" : "본수강",

            }));
    };

    // 삭제
    const remove = (id) => removeById(id);

    //테이블은 선택된 연도/학기만 표시
    const filtered = items.filter((it) => it.year === year && it.semester === semester);

    return (
        <div className="CourseHistoryManager">
            {/* 연도/학기 선택 + 검색 */}
            <div className="search-row">
                <div className="select-group">
                    <select value={year} onChange={(e) => setYear(e.target.value)}>
                        {yearOptions.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                    <select value={semester} onChange={(e) => setSemester(e.target.value)}>
                        <option value="1학기">1학기</option>
                        <option value="2학기">2학기</option>
                        <option value="여름학기">여름학기</option>
                        <option value="겨울학기">겨울학기</option>
                    </select>
                </div>
                <div className="Edit-description">수강한 과목의 해당 연도와 학기를 먼저 선택한 후 과목 추가 및 검색을 해 주세요.</div>
            {/*입력 + 드롭다운 */}
            <div className="input-container-search" style={{maxWidth: 480, position: "relative"}}>
                <input
                type="text"
                placeholder="과목명을 검색하세요."
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                className="course-manage-modal-input"
                />
                {open && query.trim() !== "" && candidates.length > 0 && (
                    <ul className="dropdown-list">
                        {candidates.map((subject) => (
                            <li
                            key={subject}
                            className="dropdown-item"
                            onClick={() => addCourse(subject)}
                            >
                                {subject}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            </div>
            {/*선택된 과목 리스트*/}
            <table className="Course-table" style={{ marginTop: 16}}>
                <thead>
                    <tr>
                        <th>과목명</th>
                        <th>이수구분</th>
                        <th>학점</th>
                        <th>재수강여부</th>
                        <th>삭제</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length > 0 ? (
                        filtered.map((it) => (
                            <tr key={it.id}>
                                <td>{it.name}</td>
                                <td>{it.category}</td>
                                <td>{it.credit}</td>
                                <td>
                                    <button
                                    className= {`CourseManager-chip ${it.retake === "재수강" ? "retry" : "primary"}`}
                                    onClick={() => toggleRetake(it.id)}
                                    >
                                        {it.retake}
                                    </button>
                                </td>
                                <td
                                onClick={() => remove(it.id)}
                                style={{cursor: "pointer"}}
                                >
                                    <img
                                    src="/icons/remove-gray.png"
                                    alt="삭제"
                                    className="CourseManage-icon"
                                    />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} style={{textAlign: "center", color: "#888"}}>
                                해당 학기에 등록된 과목이 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}