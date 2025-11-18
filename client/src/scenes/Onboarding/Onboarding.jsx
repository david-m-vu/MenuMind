import "./Onboarding.css";

import { useNavigate } from "react-router-dom"

import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";

const Onboarding = () => {
    const navigate = useNavigate();
    const handleSubmit = () => {
        navigate("/home")
    }
    
    return (
        <div id="Onboarding">
            <h1>Onboarding</h1>
            <PrimaryButton onClick={handleSubmit}>
                Submit
            </PrimaryButton>
        </div>
    )
}

export default Onboarding;