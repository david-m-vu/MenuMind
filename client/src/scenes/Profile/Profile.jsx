import "./Profile.css";

import TitleBanner from "../../components/TitleBanner/TitleBanner.jsx";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";
import { useNavigate } from "react-router-dom";

const Profile = ({ userProfile = {}, setUserProfile, setSearchResults }) => {
  const navigate = useNavigate();

  const email = userProfile?.email || "john@berkeley.edu";

  const goToEditConditions = () =>
    navigate("/onboarding", { state: { step: 1 } });
  const goToEditRestrictions = () =>
    navigate("/onboarding", { state: { step: 2 } });
  const goToSettings = () => navigate("/settings");

  const handleLogout = () => {
    if (typeof setUserProfile === "function") {
      setUserProfile({ dietaryRestrictions: [], dietaryConditions: [] });
    }
    setSearchResults([]);
    navigate("/");
  };

  return (
    <div className="profileScreen">
      <TitleBanner />

      <div className="profileContent">
        <div className="profileCard profileCard--flat">
          <p className="profileEmail">{email}</p>

          <div className="profileActions">
            <PrimaryButton onClick={goToEditRestrictions}>
              My Sensitivities
            </PrimaryButton>
            <PrimaryButton onClick={goToEditConditions}>
              My Conditions
            </PrimaryButton>
            {/* My Food Preferences removed per request */}
            <PrimaryButton onClick={goToSettings}>Settings</PrimaryButton>
            <button className="dangerButton" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
