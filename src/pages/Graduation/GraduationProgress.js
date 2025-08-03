import React , {useState} from "react";
import ProgressDashboard from "../../components/ProgressDashboard";
import "../../styles/Graduation.css";
import CoursePanel from "./CoursePanel";



const GraduationProgress = ({ progressItems = [] }) =>{
    const [selectedCourse, setSelectedCourse] = useState("전체");

    // 과목별 데이터 (임의의 과목들)
    const courseData = {
        "전체": {
            completed: [
                "컴퓨터프로그래밍", "자료구조", "데이터베이스", "컴퓨터구조", "운영체제",
                "알고리즘", "소프트웨어공학", "네트워크", "웹프로그래밍", "모바일프로그래밍"
            ],
            incomplete: [
                "인공지능", "머신러닝", "컴퓨터그래픽스", "정보보안", "클라우드컴퓨팅",
                "빅데이터", "블록체인", "게임개발", "IoT시스템", "사이버보안"
            ]
        },
        "전공": {
            completed: [
                "컴퓨터프로그래밍", "자료구조", "데이터베이스", "컴퓨터구조", "운영체제"
            ],
            incomplete: [
                "인공지능", "머신러닝", "컴퓨터그래픽스", "정보보안", "클라우드컴퓨팅",
                "빅데이터", "블록체인", "게임개발"
            ]
        },
        "교양": {
            completed: [
                "대학영어", "철학개론", "한국사", "경제학원론", "심리학개론",
                "문학과인생", "예술의이해", "과학기술과사회"
            ],
            incomplete: [
                "통계학", "논리학", "사회학개론", "정치학개론", "환경과학",
                "음악의이해", "미술사", "체육실기"
            ]
        },
        "공통과목": {
            completed: [
                "기초수학", "물리학", "화학"
            ],
            incomplete: [
                "고급수학", "생물학", "지구과학", "통계학입문"
            ]
        },
        "자율선택": {
            completed: [
                "창업론", "리더십", "봉사활동", "해외연수"
            ],
            incomplete: [
                "인턴십", "졸업프로젝트", "학술연구", "동아리활동",
                "어학연수", "자격증취득"
            ]
        }
    };


     // 진척률 바 클릭 핸들러
    const handleProgressItemClick = (title) => {
        setSelectedCourse(selectedCourse === title ? null : title);
    };

    return(
        <div className="ProgressBar-container1 graduation-progress">
            <div className="ProgressBar-top">
                <div className="ProgressBar-title">졸업 진척률</div>
                <div className="ProgressBar-section">
                    <div className="CourseInfoBox1">
                        <div className="Box-title">총 이수 학점</div>
                        <div className="Box-content">{progressItems[0].score.replace("학점", "")}</div>
                    </div>
                    <div className="CourseInfoBox1">
                        <div className="Box-title">진행률</div>
                        <div className="Box-content">{progressItems[0].percent}%</div>
                    </div>
                    <div className="CourseInfoBox1">
                        <div className="Box-title">잔여 학점</div>
                        <div className="Box-content">{120 - parseInt(progressItems[0].score.split("/")[0])}</div>
                    </div>
                </div>
            </div>
            <div className="ProgressBar-content">
                <div className="ProgressBar-dashboard">
                    <ProgressDashboard 
                        progressItems={progressItems} 
                        onItemClick={handleProgressItemClick}
                        selectedCourse={selectedCourse}
                    />
                </div>
                
                <div className="CoursePanel-container">
                    <CoursePanel
                        selectedCourse={selectedCourse}
                        courseData={courseData}
                    />
                </div>
            </div>
        </div>
    );
};

export default GraduationProgress;