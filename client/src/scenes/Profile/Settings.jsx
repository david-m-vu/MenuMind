import "./Profile.css";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";
import TitleBanner from "../../components/TitleBanner/TitleBanner.jsx";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="profileScreen">
      <TitleBanner />
      <div className="profileContent">
        <div className="profileCard">
          <h3>Settings</h3>
          <div className="profileActions">
            <PrimaryButton onClick={() => navigate("/settings/reset-password")}>
              Reset Password
            </PrimaryButton>
            <PrimaryButton onClick={() => navigate("/settings/change-email")}>
              Change Email
            </PrimaryButton>
            <PrimaryButton onClick={() => navigate("/profile")}>
              Back
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
