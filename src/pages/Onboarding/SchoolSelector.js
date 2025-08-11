import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Onboarding.css";
import { post } from "../../api";
import config from "../../config";
import { useCookies } from "react-cookie";

const university = [
    "한국항공대학교"
];

const SchoolSelector = () => {

    const navigate = useNavigate();
    const [cookies] = useCookies(["accessToken"]);

    const [input, setInput] = useState("");
    const [selected, setSelected] = useState("");
    const [major, setMajor] = useState("");
    const [list, setList] = useState(false);

    const filteredSchools = university.filter((school) =>
        school.includes(input)
    );

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

    const handleNext = async () => {
        if(!input || !major){
            alert("대학교와 전공을 모두 입력해 주세요.")
            return; // 조건에 맞지 않으면 다음으로 넘어가지 못 함.
        }

        try {
            await post (
                config.PROFILE.STEP1,
                {
                    university: input,
                    major: major
                },
            );
            console.log("STEP1 성공");
            navigate("/admissionYearInput", { replace: true });
        } catch (error) {
            console.error("STEP1 실패:", error.response?.data || error.message);
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
                            onClick={() => handleSelect("한국항공대학교")}
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