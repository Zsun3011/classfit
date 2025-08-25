export const uidKey = "currentUserId";
export const keyFor = (base, uid) => `${base}:${uid}`;

export const getUid = () => localStorage.getItem(uidKey);
export const setUid = (uid) => {
    if (uid == null || uid === "") return;
    localStorage.setItem(uidKey, String(uid));
};
export const clearUid = () => localStorage.removeItem(uidKey);

const safeParse = (s, fallback) => {
  try { return JSON.parse(s ?? "");} catch { return fallback; }
};
const STEP_FLAGS = "stepFlags";
const readStepFlags = (uid) => safeParse(localStorage.getItem(keyFor(STEP_FLAGS, uid)), {});
const writeStepFlags = (uid, flags) => localStorage.setItem(keyFor(STEP_FLAGS, uid), JSON.stringify(flags || {}));
const markStep = (uid, step) => { const f = readStepFlags(uid); f[step] = true; writeStepFlags(uid, f); };

// 토큰에서 사용자 고유 id 가져오기
export const getUidFromToken = (token = "") => {
    try {
        const base64Url = token.split(".")[1] || "";
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
          atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
        );
        const p = JSON.parse(json);
        return (p.sub || p.userId || p.uid || p.id || "").toString();
      } catch {
        return "";    
    }
};

// 로그인 응답/토큰/이메일을 받아 항상 같은 uid를 고르는 함수
export const chooseUidFromLogin = (result, accessToken, email) => {
      const cands = [
          getUidFromToken(accessToken),
          result?.userId, result?.id, result?.memberId,
          (email || "").toLowerCase(),
        ].filter(Boolean).map(String);
        const prev = getUid?.();
        if (prev && cands.includes(prev)) return prev;
        if (cands.length) return cands[0];
        throw new Error("No stable UserId.");

};
  
// 레거시 전역 키 → 현재 uid namespaced 키로 복사
  export const migrateLegacyToNamespaced = (uid) => {
    if (!uid) return;
    const bases = ["profileData", "profileCompleted", "displayName", "courseHistory", "stepFlags"]
    bases.forEach((b) => {
      const nsKey = keyFor(b, uid);
      if (localStorage.getItem(nsKey) == null) {
        const legacy = localStorage.getItem(b);
        if (legacy != null) localStorage.setItem(nsKey, legacy);
      }
    });
};

export const wipeLegacyGlobalKeys = () => {
    ["profileData", "profileCompleted", "displayName", "courseHistory", "stepFlags"]
     .forEach((k) => localStorage.removeItem(k));
};

// 서버가 온보딩 완료라고 말하는 모든 경우를 묶어 처리
export const saysDone = (o = {}) => {
  try {
    const x = o.result ?? o;
    const steps = x.steps ?? {};
    return (
      x.isCompleted === true ||
      x.profileCompleted === true ||
      x.isProfileCompleted === true ||
      x.completed === true ||         // 백엔드가 completed로 주는 경우
      x.allDone === true ||           // allDone 키
      steps.allDone === true ||       // steps.allDone
      ["step1", "step2", "step3", "step4"].every(k => steps?.[k] === true)
    );
  } catch { return false};
};


// 계정별 저장/읽기
export const saveProfile = (partial = {}) => {
  const uid = getUid(); 
  if (!uid) return;
  const cur = readProfile();
  const next = { ...(cur || {}), ...(partial || {}) };
  localStorage.setItem(keyFor("profileData", uid), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("profile:update", { detail: next}));
};
export const readProfile = () => {
  const uid = getUid(); 
  if (!uid) return {};
  return safeParse(localStorage.getItem(keyFor("profileData", uid)), {});
};

export const isProfileCompleted = () => {
  const uid = getUid(); 
  if (!uid) return false;
   // 신규 플래그
  if (localStorage.getItem(keyFor("profileCompleted", uid)) === "1") return true;
  // 로직 호환: stepFlags.STEP4가 true면 완료로 간주
  const flags = readStepFlags(uid);
  return !!flags?.STEP4;
};
export const markProfileCompleted = () => {
    const uid = getUid();
    if (!uid) return;
    localStorage.setItem(keyFor("profileCompleted", uid), "1");
    markStep(uid, "STEP4");
};
export const unmarkProfileCompleted = () => {
    const uid = getUid();
    if(!uid) return;
    localStorage.removeItem(keyFor("profileCompleted", uid));
};

// 해당 계정의 캐시만 삭제 (회원탈퇴용)
export const purgeAllForUid = (uid) => {
    if(!uid) return;
    ["profileData", "profileCompleted", "displayName", "courseHistory"].forEach((b) => {
        localStorage.removeItem(keyFor(b, uid));
    });
};

export const readDisplayName = () => {
    const uid = getUid();
    if (!uid) return "";
    return localStorage.getItem(keyFor("displayName", uid)) || "";
};

export const saveDisplayName = (name = "") => {
    const uid = getUid();
    if (!uid) return;
    localStorage.setItem(keyFor("displayName", uid), name);
    const cur = readProfile();
    window.dispatchEvent(
        new CustomEvent("profile:update", { detail: {...cur, name}})
    );
};

// 프리로그인 이름 저장(이메일 기준)
const preNameKey = (email = "") => `preloginName:${email.toLowerCase()}`;

export const savePreloginName = (email, name) => {
  if (!email || !name) return;
  localStorage.setItem(preNameKey(email), name);
};

export const readPreloginName = (email) => {
  if (!email) return "";
  return localStorage.getItem(preNameKey(email)) || "";
};

export const clearPreloginName = (email) => {
  if (!email) return;
  localStorage.removeItem(preNameKey(email));
};
