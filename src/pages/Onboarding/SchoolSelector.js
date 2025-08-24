import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Onboarding.css";
import { post } from "../../api";
import config from "../../config";
import { useCookies } from "react-cookie";
import { isProfileCompleted, saveProfile } from "./commonutil";
import { buildProfilePayload } from "./payload.js";

const university = ["한국항공대학교"];

const SchoolSelector = () => {

    const navigate = useNavigate();
    const [cookies] = useCookies(["accessToken"]);

    const [input, setInput] = useState("");
    const [selected, setSelected] = useState("");
    const [major, setMajor] = useState("");
    const [list, setList] = useState(false);

    const filteredSchools = university.filter((school) =>school.includes(input));

    const handleChange = (e) => {
        const value = e.target.value;
        setInput(value);
        setSelected("");
        setList(value !== ""); //입력이 있을 때만 리스트 보여줌
    };

    const handleSelect = (school) => {
        setInput(school);
        setSelected(school);
        setList(false);
    };

    // 토큰이 없으면 로그인으로, 온보딩 완료면 홈으로
    useEffect(() => {
        if(!cookies.accessToken) {
            alert("로그인이 필요합니다.");
            navigate("/", { replace: true});
            return;
        }

        if(isProfileCompleted()){
            navigate("/Home", {replace: true});
            return;
        } 
    },[cookies.accessToken, navigate]);

    const handleNext = async () => {
        if(!input.trim() || !major.trim()){
            alert("대학교와 전공을 모두 입력해 주세요.")
            return; // 조건에 맞지 않으면 다음으로 넘어가지 못 함.
        }

        const override = {
            university: input.trim(),
            major: major.trim(),
            enrollmentYear: 0,
        };

        const payload = buildProfilePayload({
            includeCourses: false,
            graduationType: "GENERAL",
            override,
        });

        try {
            await post (config.PROFILE.STEP1, payload);
            saveProfile(override);
            console.log("STEP1 성공");
            navigate("/AdmissionYearInput", { replace: true });
        } catch (error) {
            const status = error.response?.status;
            const data = error.response?.data;
            console.error("STEP1 실패:", {status, data, message: error.message});

            if(status === 400) {
                alert(data?.message || "입력 형식이 올바르지 않습니다. 다시 확인해 주세요.");
            } else if(status === 401) {
                alert("로그인이 필요합니다. 다시 확인해 주세요.");
            } else if(status === 403) {
                alert("접근 권한이 없습니다.");
            } else if(status === 500) {
                alert("서버 오류입니다. 잠시 후 다시 시도해 주세요.");
            } else {
                alert(data?.message || "요청에 실패했습니다.");
            }
        }
        
    };

    return (
        <div className="SchoolSelector-container">
            {/*왼쪽 부분*/}
            <div className="SchoolSelector-left">
                <h1>대학 / 전공 선택</h1>
                <p>원활한 수강 신청 진행을 위해 재학 중인 대학교와 전공을 선택해 주세요.</p>

                {/*진행 표시바*/}
                <div className="progress-bar">
                    <div className="progress-step active"></div>
                    <div className="progress-step"></div>
                    <div className="progress-step"></div>
                    <div className="progress-step"></div>
                </div>
            </div>

            {/*오른쪽 부분*/}
            <div className="SchoolSelector-right">
                {/*대학교 입력*/}
                <div className="SchoolSelector-title">대학교</div>
                <input
                type="text"
                placeholder="대학명을 검색하세요."
                value={input}
                onChange={handleChange}
                //onChange={(e) => setInput(e.target.value)}
                onFocus={() => setList(true)}
                className={selected ? "selected-input" : ""}
                />
                {list && input !== "" && (
                    <ul className="dropdown-list">
                        {filteredSchools.map((school, index) => (
                            <li 
                            key={index}
                            className={`dropdown-item ${selected === school ? "selected" : ""}`}
                            onClick={() => handleSelect(school)}
                            >
                            {school}
                            </li>
                        ))}
                    </ul>
                )}

                {/*전공 입력*/}
                <div className="SchoolSelector-title">전공</div>
                <input 
                type="text" 
                placeholder="전공명을 검색하세요."
                value={major}
                onChange={(e) => setMajor(e.target.value)} 
                />
            
                <button className="next-button" onClick={handleNext}>다음</button>
            </div>
        </div>

    );
};

export default SchoolSelector;