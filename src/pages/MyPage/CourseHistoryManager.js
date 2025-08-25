import React, { useEffect, useMemo, useState, useRef } from "react";
import { load, subscribe, upsertByName, patchById, removeById, replaceAll } from "./CourseHistoryStore";
import { readProfile, getUid } from "../Onboarding/commonutil";
import { get, post, del } from "../../api";
import config from "../../config";
import { fromServerItem } from "./CourseHistoryMapping";
import "../../styles/CourseManager.css";

export default function CourseHistoryManager({
  onChange,
  onStats,
  syncServer = false,
  authReady = true,
}) {
  const uidReady = !!getUid();

  const [items, setItems] = useState(() => (uidReady ? load() : []));
  const onChangeRef = useRef(onChange);
  const suppressOpenRef = useRef(false);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const fetchedRef = useRef(false);

  const getSubjectIdForApi = (detail, summary) => {
    const raw = detail?.id ?? summary?.id ?? null; // DB PK만 사용
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // 중복 제거
  const uniqBy = (arr, keyFn) => {
    const m = new Map();
    for (const x of arr) {
      const k = keyFn(x);
      if (!m.has(k)) m.set(k, x);
    }
    return [...m.values()];
  };

  useEffect(() => {
    if (!uidReady) return;
    setItems(load());
    const unsub = subscribe((next) => {
      setItems(next);
      onChangeRef.current?.(next);
    });
    return unsub;
  }, [uidReady]);

  // 수강 이력 불러오기
  useEffect(() => {
    if (!syncServer || !authReady || !uidReady || fetchedRef.current) return;
    fetchedRef.current = true;
    (async () => {
      try {
        const res = await get(config.COURSE.LIST);
        const raw = Array.isArray(res?.result ?? res) ? res.result ?? res : [];
        if(raw.length === 0) return;
        const serverItems = raw.map(fromServerItem);
        const local = load();
        const key = (x) =>
          `${x.year}|${x.semester}|${(x.name || "").trim().toLowerCase()}`;
        const map = new Map(local.map((x) => [key(x), x]));

        for (const s of serverItems) {
          const k = key(s);
          const prev = map.get(k);
          map.set(k, {
            ...(prev || {}),
            ...s,
            id: prev?.id || s.id,
            serverId: s.serverId || s.id,
            serverSync: "ok",
          });
        }

        const merged = [...map.values()];
        replaceAll(merged);
        setItems(merged);
        onChangeRef.current?.(merged);
      } catch (e) {
        if (e?.response?.status === 401) {
          console.warn("[course-histories] 서버 동기화 건너뜀");
          return;
        }
        console.error("수강이력 불러오기 실패:", e);
      }
    })();
  }, [syncServer, authReady, uidReady]);
  
    // 연도/학기
    const profile = readProfile();
    const currentYear = new Date().getFullYear();
    const endYear = currentYear;
    const enrollment =
      typeof profile.enrollmentYear === "number" ? profile.enrollmentYear : endYear;
    const startYear = Math.min(enrollment, endYear); // 입학년도부터 현재년도까지만
  
    const yearOptions = useMemo(
      () =>
        Array.from({ length: endYear - startYear + 1 }, (_, i) =>
          String(startYear + i)
        ),
      [startYear, endYear]
    );
  
    const initialYear = useMemo(
      () => yearOptions.at(-1) || String(currentYear),
      [yearOptions, currentYear]
    );
  
    const [year, setYear] = useState(initialYear);
    useEffect(() => {
      if (!year) setYear(initialYear);
    }, [initialYear, year]);
  
    const [semester, setSemester] = useState("1학기");  

  // 검색
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);

  // 인풋에서 열기: 타이핑할 때만
  const requestOpen = () => {
    if (suppressOpenRef.current) { suppressOpenRef.current = false; return; }
    setOpen(true);
  };

  // 과목 검색
  useEffect(() => {
    if (!open) return;

    const q = query.trim();
    if (!q || q.length < 2) {
      setCandidates([]);
      return; 
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        const url = config.SUBJECTS.SEARCH();
        const data = await get(url, { name: q, professor: "" }, { signal: abortRef.current.signal });
        const raw = data?.result ?? data?.data ?? data ?? [];
        setCandidates(
          uniqBy(Array.isArray(raw) ? raw : [], (s) => `${s.name} | ${s.professor || ""}`)
        );
      } catch (e) {
        if (e?.name !== "CanceledError" && e?.code !== "ERR_CANCELED") {
          console.error("과목 검색 실패:", e);
        }
        setCandidates([]);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query, open]);

  const mapSemester = (s) =>
    s === "1학기" ? "FIRST" :
    s === "2학기" ? "SECOND" :
    s === "여름학기" ? "SUMMER" :
    s === "겨울학기" ? "WINTER" : "FIRST";

  const mapRetake = (r) => (r === "재수강" ? "RETAKE" : "ORIGINAL");

  // 수강이력 추가
  const addCourseBySubject = async (summary) => {

    setOpen(false);
    setQuery("");
    const draft = {
      name: summary.name || "(과목)",
      category: summary.category || "교선",
      credit: Number.isFinite(summary.credit) ? Number(summary.credit) : 3,
      retake: "본수강",
      year: year || yearOptions.at(-1),
      semester,
    };
    upsertByName(draft);
    setItems(load());
    onChangeRef.current?.(load());
  
    try {
      // 항상 DB id로 상세 조회해서 subjectId를 확보
      const detailRes = await get(config.SUBJECTS.DETAIL_BY_DBID(summary.id));
      const detail = detailRes?.result ?? detailRes ?? {};

      const subjectPk = getSubjectIdForApi(detail, summary);
      if (!subjectPk) {
        console.warn("[course-histories] subject PK 없음 → 전송 생략");
        return;
      }

      // 화면 보강
      const patch = {
        name: detail.name || draft.name,
        category: detail.category || draft.category,
        credit: Number.isFinite(detail.credit) ? Number(detail.credit) : draft.credit,
      };
      const localId = load().find(
        it => it.name === draft.name && it.year === draft.year && it.semester === draft.semester
      )?.id;
      if (localId) {
        patchById(localId, patch);
        setItems(load());
        onChangeRef.current?.(load());
      }
  
      // 서버 동기화: subjectId 없거나 숫자만이면 보내지 않음
      if (syncServer && authReady) {
        const payload = {
          year: Number(draft.year),
          semester: mapSemester(draft.semester),
          subjectId: Number(subjectPk),
          courseTitle: String(detail.name || draft.name || "").trim(),
          credit: Number(patch.credit),
          category: String(patch.category ?? ""),
          retake: mapRetake(draft.retake),
        };
  
        console.log("POST /api/course-histories payload", payload);

        try {
          const created = await post(config.COURSE.CREATE, payload);
          const serverId = created?.result?.id ?? created?.id;
          if(!serverId) throw new Error("서버 id 없음");
          patchById(localId, {serverId, serverSync: "ok"}); 
        } catch (e) {
          const status = e?.response?.status;

          if (status === 409) {
            console.warn("[course-histories] 중복 등록(409):", e?.response?.data || e);
            alert("이미 해당 연도/학기에 등록된 과목입니다.");
            return;
          }
        }
 
      }
    } catch (e) {
      console.error("과목 서버 동기화 실패:", e?.response?.data || e);
    }
  };

  const toggleRetake = (id) => {
    patchById(id, (prev) => ({
      retake: prev.retake === "본수강" ? "재수강" : "본수강",
    }));
  };

  // 수강 이력 삭제
  const remove = async (id) => {
    const target = items.find((x) => x.id === id);
    if (syncServer && target?.serverId) {
      try {
        await del(config.COURSE.DELETE(target.serverId));
      } catch (e) {
        console.error("수강이력 삭제 실패:",e?.response?.data || e);
      }
    }
    removeById(id);
    setItems(load());
    onChangeRef.current?.(load());
  };

  const filtered = items.filter((it) => it.year === year && it.semester === semester);

  useEffect(() => {
    onStats?.({ current: filtered.length, total: items.length });
  }, [filtered.length, items.length, onStats]);

  return (
    <div className="CourseHistoryManager">
      {/* 연도/학기 선택 + 검색 */}
      <div className="search-row">
        <div className="Edit-description">수강한 과목의 해당 연도와 학기를 먼저 선택해 주세요.</div>
          <div className="Edit-section">
            <div className="select-group">
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select value={semester} onChange={(e) => setSemester(e.target.value)}>
                <option value="1학기">1학기</option>
                <option value="2학기">2학기</option>
                <option value="여름학기">여름학기</option>
                <option value="겨울학기">겨울학기</option>
              </select>
            </div>

            {/* 입력 + 드롭다운 */}
            <div className="input-container-search" style={{ maxWidth: 480, position: "relative" }}>
              <input
                type="text"
                placeholder="과목명을 검색하세요."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value.trim()) requestOpen(); // 타이핑할 때만 열기
                  else setOpen(false);
                }}
                // onFocus로 자동 열기는 제거 
                className="course-manage-modal-input"
              />

              {open && query.trim() !== "" && (
                candidates.length > 0 ? (
                  <ul className="dropdown-list">
                    {candidates.map((s) => (
                      <li
                        key={s.id}
                        className="dropdown-item"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addCourseBySubject(s);
                        }}
                        title={s.description || ""}
                      >
                        {s.name}
                        {s.professor ? ` · ${s.professor}` : ""}
                        {typeof s.credit === "number" ? ` · ${s.credit}학점` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="dropdown-list no-result">검색 결과가 없습니다.</div>
                )
              )}
          </div>
        </div>
      </div>
      {/* 선택된 과목 리스트 */}
      <table className="Course-table" style={{ marginTop: 16 }}>
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
                    className={`CourseManager-chip ${it.retake === "재수강" ? "retry" : "primary"}`}
                    onClick={() => toggleRetake(it.id)}
                  >
                    {it.retake}
                  </button>
                </td>
                <td style={{ textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => remove(it.id)}
                    className="CourseManage-remove-btn"
                    aria-label="삭제"
                    title="삭제"
                    style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }}
                  >
                    <img src="/icons/remove-gray.png" alt="" className="CourseManage-icon" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", color: "#888" }}>
                해당 학기에 등록된 과목이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}