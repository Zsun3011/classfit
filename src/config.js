const BASE_URL = 'https://roarbits.com'; // 기본 API URL

const config = {
    API_URL: BASE_URL,

    AUTH: {
        SIGNUP: `${BASE_URL}/api/auth/signup`, // 회원가입 (POST)
        REISSUE_TOKEN: `${BASE_URL}/api/auth/reissue`, // 토큰 재발급 (POST)
        LOGOUT: `${BASE_URL}/api/auth/logout`, // 로그아웃 (POST)
        LOGIN: `${BASE_URL}/api/auth/login`, // 로그인 (POST)
    },

    PROFILE: {
        UPDATE: `${BASE_URL}/api/profile`, // 전체 정보 한 번에 업데이트(수정) (PUT)
        STEP1: `${BASE_URL}/api/profile/step1`, // 대학, 전공 선택 (POST)
        STEP2: `${BASE_URL}/api/profile/step2`, // 입학년도 (POST)
        STEP3: `${BASE_URL}/api/profile/step3`, // 졸업 유형 선택 (POST)
        STEP4: `${BASE_URL}/api/profile/step4`, // 이전 수강 이력 입력 (POST)
    },

    INTEREST: {
        ENROLL: (subjectId) => `${BASE_URL}/api/interest/subjects/${subjectId}`, // 등록 (POST)
        LIST: `${BASE_URL}/api/interest/me`, // 조회 (GET)
        DELETE: (subjectId) => `${BASE_URL}/api/interest/subjects/${subjectId}`, // 삭제 (DELETE)
    },

    // 수강이력
    COURSE: {
        LIST: `${BASE_URL}/api/course-histories`, // 수강 이력 전체 가져오기 (GET)
        CREATE: `${BASE_URL}/api/course-histories`, // 수강 이력 추가 (POST)
        DELETE: (id) => `${BASE_URL}/api/course-histories/${id}`, // 수강 이력 삭제 (DELETE)
    },

    // 졸업요건 / 진척도
    GRADUATION: {
        LIST: `${BASE_URL}/api/graduation/requirements`, // 졸업 요건 전체 조회 (GET)
        PROGRESS_ME: `${BASE_URL}/api/graduation/progress/me`, // 내 졸업 진행도 조회 (GET)
    },

    // 회원탈퇴
    USER: {
        ME: `${BASE_URL}/api/users/me`, // GET(내 정보), DELETE(회원탈퇴)
    },

    // 게시글
    COMMUNITY: {
        CREATE: `${BASE_URL}/api/community/posts`, // (POST) 게시글 생성
        UPDATE: (id) => `${BASE_URL}/api/community/posts/${encodeURIComponent(id)}`, // (PUT) 게시글 수정
        DELETE: (id) => `${BASE_URL}/api/community/posts/${encodeURIComponent(id)}`, // (DELETE) 게시글 삭제
        LIST: (id) => `${BASE_URL}/api/community/posts/${encodeURIComponent(id)}` // (GET) 게시글 조회
    },

    // 시간표 관리
    TIMETABLE: {
        CREATE: `${BASE_URL}/api/timetables`, // 시간표 생성 (POST)
        LIST: `${BASE_URL}/api/timetables/me`, // 내 시간표 전체 조회 (GET)
        UPDATE: (timetableId) => `${BASE_URL}/api/timetables/${timetableId}`, // 시간표 수정 (PUT)
        DELETE: (timetableId) => `${BASE_URL}/api/timetables/${timetableId}`, // 시간표 삭제 (DELETE)
    },

    //과목 조회
    SUBJECTS: {
        SEARCH: () => `${BASE_URL}/api/subjects/search`, // GET(과목 검색), params: { name, professor }
        DETAIL: (id) => `${BASE_URL}/api/subjects/${id}`, // GET (과목 가져오기)
        LIST: `${BASE_URL}/api/subjects`,
        BY_SUBJECT_ID: (subjectId) => `${BASE_URL}/api/subjects/id/${subjectId}`,
    },

};

export default config;