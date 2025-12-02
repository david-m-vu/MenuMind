import "./Profile.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";
import TitleBanner from "../../components/TitleBanner/TitleBanner.jsx";

const ChangeEmail = ({ setUserProfile }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof setUserProfile === "function") {
      setUserProfile((prev) => ({ ...prev, email }));
    }
    navigate("/settings");
  };

  return (
    <div className="profileScreen">
      <TitleBanner />
      <div className="profileContent">
        <div className="profileCard profileCard--flat">
          <h3>Change Email</h3>
          <form onSubmit={handleSubmit} className="profileActions">
            <input
              className="fullWidthInput"
              type="email"
              placeholder="New Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <PrimaryButton type="submit">Submit</PrimaryButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangeEmail;
