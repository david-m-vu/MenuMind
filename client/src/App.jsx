import './App.css'
import { Routes, Route, Outlet } from "react-router-dom";

import Landing from "./scenes/Landing/Landing.jsx";
import Onboarding from "./scenes/Onboarding/Onboarding.jsx";
import Home from './scenes/Home/Home.jsx';
import Profile from "./scenes/Profile/Profile.jsx";
import Camera from "./scenes/Camera/Camera.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";

const WithNavbarLayout = () => {
  return (
    <div className="appWithNavbarLayout">
      <div className="appContent">
        <Outlet />
      </div>
      <Navbar />
    </div>
  )
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/onboarding" element={<Onboarding/>}/>
        <Route path="/" element={<WithNavbarLayout />}>
          <Route path="/home" element={<Home/>}/>
          <Route path="/camera" element={<Camera/>}/>
          <Route path="/profile" element={<Profile/>}/>
        </Route>
      </Routes>
    </>
  )
}

export default App
