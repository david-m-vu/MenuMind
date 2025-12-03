import "./App.css";
import { Routes, Route, Outlet } from "react-router-dom";

import Landing from "./scenes/Landing/Landing.jsx";
import Onboarding from "./scenes/Onboarding/Onboarding.jsx";
import Home from "./scenes/Home/Home.jsx";
import Profile from "./scenes/Profile/Profile.jsx";
import Camera from "./scenes/Camera/Camera.jsx";
import ImageSelection from "./scenes/Camera/ImageSelection.jsx";
import MenuInfo from "./scenes/Camera/MenuInfo.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";
import Settings from "./scenes/Profile/Settings.jsx";
import ResetPassword from "./scenes/Profile/ResetPassword.jsx";
import ChangeEmail from "./scenes/Profile/ChangeEmail.jsx";
import { useState } from "react";

const WithNavbarLayout = () => {
  return (
    <div className="appWithNavbarLayout">
      <div className="appContent">
        <Outlet />
      </div>
      <Navbar />
    </div>
  );
};

function App() {
  const [userProfile, setUserProfile] = useState({
    dietaryRestrictions: [],
    dietaryConditions: [],
  });

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/onboarding"
          element={
            <Onboarding
              userProfile={userProfile}
              setUserProfile={setUserProfile}
            />
          }
        />
        <Route path="/" element={<WithNavbarLayout />}>
          <Route path="/home" element={<Home user={userProfile} />} />
          <Route path="/camera" element={<Camera />} />
          <Route path="/camera/menu-info" element={<MenuInfo />} />
          <Route path="/camera/upload" element={<ImageSelection />} />
          <Route
            path="/profile"
            element={
              <Profile
                userProfile={userProfile}
                setUserProfile={setUserProfile}
              />
            }
          />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/reset-password" element={<ResetPassword />} />
          <Route
            path="/settings/change-email"
            element={<ChangeEmail setUserProfile={setUserProfile} />}
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
