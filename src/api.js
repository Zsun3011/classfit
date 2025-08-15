import { Cookies } from "react-cookie";
import axios from "axios";
import appconfig from "./config";

const api = axios.create({
  baseURL: appconfig.API_URL,
});

const cookies = new Cookies();

// 토큰 유틸 (내부에서 사용됨)
const getAccessToken = () => cookies.get("accessToken");
const setAccessToken = (token) =>
  cookies.set("accessToken", token, { path: "/", maxAge: 60 * 60 * 24 *7});
const clearTokens = () => {
  cookies.remove("accessToken", { path: "/"});
  cookies.remove("refreshToken", { path: "/"}); // refreshToken을 쿠키로 보관 중이라면
};

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    // 기본 헤더
    config.headers = config.headers || {};
    if(!config.headers.Accept) config.headers.Accept = "application/json";

    // JSON 바디일 때만 Content-Type 지정
    const method = (config.method || "get").toLowerCase();
    const isJsonBody = 
      ["post", "put", "patch"].includes(method) &&
      config.data && 
      !(config.data instanceof FormData);
    if (isJsonBody && !config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json"
    }

    // AUthorization 자동 첨부
    // /api/auth/* 경로에는 붙이지 않음(로그인/회원가입/재발급)
    // logout에는 예외로 토큰을 붙임
    const AttachAuth = 
      !url.includes("/api/auth/") || url.includes("/api/auth/logout");
    if (AttachAuth) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config; 
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let pendingRequests = []; // 액세스 토큰 갱신 대기 배열

const onRefreshed = (newToken) => {
  pendingRequests.forEach((cb) => cb(newToken));
  pendingRequests = [];
};

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config: originalRequest} = error;
    const status = response?.status;

    // 네트워크 오류 혹은 응답 없음
    if (!response) return Promise.reject(error);

    const url = (originalRequest?.url || "").toLowerCase();
    const isAuthPath = url.includes("/api/auth/");

    // 401에러 처리
    if (status === 401) {
      if(originalRequest?.retry || isAuthPath) {
        console.error("로그인 만료됨. 다시 로그인해 주세요.");
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // 동시 401 방지: 갱신 중이면 큐에 등록해 둠
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((newToken) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }
    }

    // 재발급 시도
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // refreshToken은 쿠키 또는 로컬스토리지에 보관 중이어야 함
      const refreshToken = 
        cookies.get("refreshToken") || localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("NO_REFRESH_TOKEN");
      }

      const reissueRes = await axios.post(
        appconfig.AUTH.REISSUE_TOKEN,
        { refreshToken },
        { headers: { "Content-Type": "application/json", Accept: "application/json"}}
      );

      const body = reissueRes.data;
      const ok = body?.isSuccess ?? true;
      const newAccessToken = body?.result?.accessToken ?? body?.accessToken;
      if(!ok || !newAccessToken) throw new Error("REISSUE_FAILED");

      setAccessToken(newAccessToken);
      onRefreshed(newAccessToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (e) {
      // 재발급 실패 -> 쿠키 제거하고 로그인 이동
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

// GET
export const get = async (endpoint, params = {}, options = {}) => {
  try {
    const response = await api.get(endpoint, {
      params,
      ...options,
    });

    const contentType = response.headers["content-type"] || "";
    if (!contentType.includes("application/json")) {
      throw new Error("서버 응답이 올바르지 않습니다.");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST
export const post = async (endpoint, data, options = {}) => {
  try {
    const response = await api.post(endpoint, data, options);

    const contentType = response.headers["content-type"] || "";
    if (!contentType.includes("application/json")) {
      throw new Error("서버 응답이 올바르지 않습니다.");
  }
  return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT
export const put = async (endpoint, data = {}, options = {}) => {
  try {
    const response = await api.put(endpoint, data, options);

    const contentType = response.headers["content-type"] || "";
    if (!contentType.includes("application/json")) {
      throw new Error("서버 응답이 올바르지 않습니다.");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE
export const del = async (endpoint, options = {}) => {
  try {
    const response = await api.delete(endpoint, options);

    const contentType = response.headers["content-type"] || "";
    if (!contentType.includes("application/json")) {
      throw new Error("서버 응답이 올바르지 않습니다.");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;