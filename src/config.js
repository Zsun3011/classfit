const BASE_URL = 'https://roarbits.com'; // 기본 API URL

const config = {
    API_URL: BASE_URL,

    AUTH: {
        SIGNUP: `${BASE_URL}/api/auth/signup`, // 회원가입
        REISSUE_TOKEN: `${BASE_URL}/api/auth/reissue`, // 토큰 재발급
        LOGOUT: `${BASE_URL}/api/auth/logout`, // 로그아웃
        LOGIN: `${BASE_URL}/api/auth/login`, // 로그인
    },

    PROFILE: {
        UPDATE: `${BASE_URL}/api/profile`, // 전체 정보 한 번에 업데이트
        STEP1: `${BASE_URL}/api/profile/step1`, // 대학, 전공 선택
        STEP2: `${BASE_URL}/api/profile/step2`, // 입학년도
        STEP3: `${BASE_URL}/api/profile/step3`, // 졸업 유형 선택
        STEP4: `${BASE_URL}/api/profile/step4`, // 이전 수강 이력 입력
    },

}

export default config;