import "./Profile.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";
import TitleBanner from "../../components/TitleBanner/TitleBanner.jsx";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // placeholder: no auth backend yet
    console.log("reset password", { oldPass, newPass });
    navigate("/settings");
  };

  return (
    <div className="profileScreen">
      <TitleBanner />
      <div className="profileContent">
        <div className="profileCard profileCard--flat">
          <h3>Reset Password</h3>
          <form onSubmit={handleSubmit} className="profileActions">
            <input
              className="fullWidthInput"
              type="password"
              placeholder="Old Password"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
            />
            <input
              className="fullWidthInput"
              type="password"
              placeholder="New Password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
            <PrimaryButton type="submit">Submit</PrimaryButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
