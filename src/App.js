import React, {useState} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {CookiesProvider} from "react-cookie";


//페이지 import
import Home from './pages/Home/Home';
import LoginMethodSelector from './pages/Onboarding/LoginMethodSelector';
import Onboarding from './pages/Onboarding/Onboarding';
import SchoolSelector from './pages/Onboarding/SchoolSelector';
import AdmissionYearInput from './pages/Onboarding/AdmissionYearInput';
import GraduationTypeSelector from './pages/Onboarding/GraduationTypeSelector';
import CourseHistoryUploader from './pages/Onboarding/CourseHistoryUploader';
import AITimetable from './pages/AITimetable/AITimetable';
import GraduationDetail from './pages/Graduation/GraduationDetail';
import CourseList from './pages/CourseList/CourseList';
import MyPage from './pages/MyPage/Mypage';
import HomeAfterInput from './pages/Home/HomeAfterInput';

function App() {

  const [favoriteCourseIds, setFavoriteCourseIds] = useState([]);
  const [alarmCourseIds, setAlarmCourseIds] = useState([]);

  return (
    <CookiesProvider>
    <BrowserRouter>
      <Routes>
        {/*local:3000에 들어왔을 때 로그인 화면으로 들어옴*/}
        <Route path="/" element={<LoginMethodSelector />} /> 
        <Route path="/home" element={<Home />} /> 
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/schoolSelector" element={<SchoolSelector />} />
        <Route path="/admissionYearInput" element={<AdmissionYearInput />} />
        <Route path="/graduationTypeSelector" element={<GraduationTypeSelector/>} />
        <Route path="/courseHistoryUploader" element={<CourseHistoryUploader />} />
        <Route path="/aITimetable" element={<AITimetable />} />
        <Route path="/graduationDetail" element={<GraduationDetail />} />
        <Route path="/homeAfterInput" element={<HomeAfterInput />} />

        <Route path="/courseList" 
              element={
              <CourseList 
              favoriteCourseIds={favoriteCourseIds}
              setFavoriteCourseIds={setFavoriteCourseIds}
              alarmCourseIds={alarmCourseIds}
              setAlarmCourseIds={setAlarmCourseIds}
              />
              } 
        />
        <Route path="/myPage" 
              element={
              <MyPage 
              favoriteCourseIds={favoriteCourseIds}
              setFavoriteCourseIds={setFavoriteCourseIds}
              alarmCourseIds={alarmCourseIds}
              setAlarmCourseIds={setAlarmCourseIds}
              />
            }
        />
        </Routes>
      </BrowserRouter>
      </CookiesProvider>
  );
};

export default App;
