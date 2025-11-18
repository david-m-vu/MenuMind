import "./Landing.css"

import { useNavigate } from "react-router-dom"

import PrimaryButton from "../../components/PrimaryButton/PrimaryButton.jsx"


const Landing = () => {
    const navigate = useNavigate();
    
    const handleGetStartedClick = () => {
        console.log("Get Started clicked");
        navigate("/onboarding");
    }

    return (
        <div id="Landing">
            <div className="landingHero">
                <h1>MenuMind</h1>
                <div className="landingSubheading">
                    <h2>Discover Restaurants.</h2>
                    <h2>Eat Healthy.</h2>
                </div>
            </div>
            <div className="landingCTA">
                <PrimaryButton onClick={handleGetStartedClick}>
                    Get Started
                </PrimaryButton>
            </div>
        </div>
    )
}

export default Landing;
