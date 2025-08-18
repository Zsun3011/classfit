export const uidKey = "currentUserId";
export const keyFor = (base, uid) => `${base}:${uid}`;

export const getUid = () => localStorage.getItem(uidKey);
export const setUid = (uid) => {
    if (uid == null || uid === "") return;
    localStorage.setItem(uidKey, String(uid));
};
export const clearUid = () => localStorage.removeItem(uidKey);

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
    const fromServer = (result?.userId ?? result?.id ?? result?.memberId);
    const fromToken  = getUidFromToken(accessToken);
    const fallback   = (email || "").toLowerCase();
    return String(fromServer ?? fromToken ?? fallback);
};
  
// 레거시 전역 키 → 현재 uid namespaced 키로 복사
  export const migrateLegacyToNamespaced = (uid) => {
    if (!uid) return;
    const bases = ["profileData", "profileCompleted", "displayName", "courseHistory"];
    bases.forEach((b) => {
      const nsKey = keyFor(b, uid);
      if (localStorage.getItem(nsKey) == null) {
        const legacy = localStorage.getItem(b);
        if (legacy != null) localStorage.setItem(nsKey, legacy);
      }
    });
};

export const wipeLegacyGlobalKeys = () => {
    ["profileData", "profileCompleted", "displayName", "courseHistory"]
     .forEach((k) => localStorage.removeItem(k));
};


// 계정별 저장/읽기
export const saveProfile = (partial = {}) => {
  const uid = getUid(); 
  if (!uid) return;
  const cur = readProfile();
  const next = {...cur, ...partial};
  localStorage.setItem(keyFor("profileData", uid), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("profile:update", { detail: next}));
};
export const readProfile = () => {
  const uid = getUid(); 
  if (!uid) return {};
  try { return JSON.parse(localStorage.getItem(keyFor("profileData", uid)) || "{}"); }
  catch { return {}; }
};

export const isProfileCompleted = () => {
  const uid = getUid(); 
  if (!uid) return false;
  return localStorage.getItem(keyFor("profileCompleted", uid)) === "1";
};
export const markProfileCompleted = () => {
    const uid = getUid();
    if (!uid) return;
    localStorage.setItem(keyFor("profileCompleted", uid), "1");
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