import { getUid, keyFor, saveProfile } from "../Onboarding/commonutil";


const BASE_KEY = "courseHistory";
const BASE_EVT = "courseHistory:changed";
const norm = (s = "") => s.trim().toLowerCase();

const storageKey = (uid = getUid()) => 
    uid ? keyFor(BASE_KEY, uid) : `${BASE_KEY}:__nouid__`;
const uidEvent = (uid = getUid()) =>
    uid ? `${BASE_EVT}:${uid}` : `${BASE_EVT}:__nouid__`;

const parse = (raw) => {
    try {
        const v = raw ? JSON.parse(raw) : [];
        return Array.isArray(v) ? v : [];
    } catch {
        return [];
    }
};

// 저장된 이력 로드
export const load = () => {
    const uid = getUid();
    return parse(localStorage.getItem(storageKey(uid)));
};

const write = (items, uid = getUid()) => {
    localStorage.setItem(storageKey(uid), JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(uidEvent(uid), {detail: items}));
    window.dispatchEvent(new CustomEvent(BASE_EVT, { detail: {uid, items}}));
};

// 저장, 변경 
export const save = (items) => write(items);

export const subscribe = (cb) => {
    const uid = getUid();
    const onLocal = (e) => cb(e.detail ?? load());
    const onGlobal = (e) => cb((e.detail?.items ?? e.detail) ?? load());
    const onStorage = (e) => {
        if (e.key === storageKey(uid)) cb(parse(e.newValue));
    };

    window.addEventListener(uidEvent(uid), onLocal);
    window.addEventListener(BASE_EVT, onGlobal);
    window.addEventListener("storage", onStorage);

    cb(load());

    return () => {
        window.removeEventListener(uidEvent(uid), onLocal);
        window.removeEventListener(BASE_EVT, onGlobal);
        window.removeEventListener("storage", onStorage);
    };
};

const nextId = () => (
    typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
);

// 같은 과목명 기준으로 있으면 갱신, 없으면 추가
export const upsertByName = (course) => {
    const uid = getUid();
    const list = load();
    const i = list.findIndex(
        (it) => 
            norm(it.name) === norm(course.name) &&
            (it.year ?? null) === (course.year ?? null) &&
            (it.semester ?? null) === (course.semester ?? null)
    );
    if (i >= 0 ) {
        list[i] = {...list[i], ...course, id: list[i].id};
    } else {
        list.push({id: course.id ?? nextId(), ...course});
    }
    write(list, uid);
};

// 특정 id만 부분 업데이트
export const patchById = (id, patch) => {
    const uid = getUid();
    const list = load().map((it) => {
        if(it.id !== id) return it;
        const updates = typeof patch === "function" ? patch(it) : patch;
        return {...it, ...updates};
    });
    write(list, uid);
};

// 삭제
export const removeById = (id) => {
    const uid = getUid();
    const list = load().filter((it) => it.id !== id);
    write(list, uid);
};

// 서버 -> 로컬 초기화
export const replaceAll = (items) => write(items);