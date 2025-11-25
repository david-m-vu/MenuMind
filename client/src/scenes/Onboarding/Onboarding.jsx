import "./Onboarding.css";
import Select from 'react-select';
import { useNavigate } from "react-router-dom"
import { useState } from "react";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton/SecondaryButton";


const Step1 = ({conditions, setConditions}) => {
    const options = [
    { value: 'crohns', label: "Crohn's Disease" },
    { value: 'uc', label: 'Ulcerative Colitis' },
    { value: 'celiac', label: 'Celiac Disease' }
    ];

    return(
    <div id="Outer">
        <div className="headers">
            <h1>MenuMind</h1>
            <h2><strong>Step 1/2</strong></h2>
        </div>
        <div className="contentBox"> 
            <h2>Do you have any digestive conditions?</h2>
            <div id="selectHolder">
                <Select isMulti options={options} placeholder="Search and add..." value={conditions} onChange={setConditions}/>
            </div>
        </div>
    </div>
    )
    
}

const Step2 = ({restrictions, setRestrictions}) => {
    const options = [
  { value: "gluten", label: "Gluten" },
  { value: "dairy", label: "Dairy" },
  { value: "lactose", label: "Lactose" },
  { value: "shellfish", label: "Shellfish" },
  { value: "soy", label: "Soy" },
  { value: "nuts", label: "Tree Nuts" },
  { value: "peanuts", label: "Peanuts" },
  { value: "sesame", label: "Sesame" },
  { value: "eggs", label: "Eggs" },
  { value: "fish", label: "Fish" },
  { value: "red-meat", label: "Red Meat" },
  { value: "pork", label: "Pork" },
  { value: "beef", label: "Beef" },
  { value: "citrus", label: "Citrus" },
  { value: "corn", label: "Corn" },
  { value: "food-coloring", label: "Food Coloring" },
  { value: "gelatin", label: "Gelatin" },
  { value: "grains", label: "Grains" },
  { value: "granola", label: "Granola" },
  { value: "caffeine", label: "Caffeine" },
  { value: "onions", label: "Onions" },
  { value: "garlic", label: "Garlic" },
  { value: "nightshades", label: "Nightshades" },
  { value: "tomatoes", label: "Tomatoes" },
  { value: "eggplant", label: "Eggplant" },
  { value: "potatoes", label: "Potatoes" },
  { value: "spicy-food", label: "Spicy Foods" },
  { value: "fructose", label: "Fructose" },
  { value: "artificial-sweeteners", label: "Artificial Sweeteners" },
  { value: "mushrooms", label: "Mushrooms" },
  { value: "vinegar", label: "Vinegar" },
  { value: "mustard", label: "Mustard" },
  { value: "glutamate", label: "MSG" },
  { value: "alcohol", label: "Alcohol" },
  { value: "carbonated", label: "Carbonated Drinks" },
  { value: "berries", label: "Berries" },
  { value: "coconut", label: "Coconut" },
  { value: "wheat", label: "Wheat" },
  { value: "oats", label: "Oats" },
  { value: "rye", label: "Rye" },
  { value: "barley", label: "Barley" },
  { value: "legumes", label: "Legumes" },
  { value: "beans", label: "Beans" },
  { value: "lentils", label: "Lentils" },
  { value: "peas", label: "Peas" },
  { value: "honey", label: "Honey" },
  { value: "maple", label: "Maple Syrup" },
  { value: "yeast", label: "Yeast" },
  { value: "fermented", label: "Fermented Foods" }
];

    return(
    <div id="Outer">
        <div className="headers">
            <h1>MenuMind</h1>
            <h2><strong>Step 2/2</strong></h2>
        </div>
        <div className="contentBox"> 
            <h2>Do you have any food sensitivities?</h2>
            <div id="selectHolder">
                <Select id="selector" isMulti options={options} placeholder="Search and add..." value={restrictions} onChange={setRestrictions}/>
            </div> 
        </div>
    </div>
    )
    
}



const Onboarding = ({userProfile, setUserProfile}) => {
    const navigate = useNavigate();
    const handleSubmit = () => {
        setUserProfile(
            {dietaryConditions: conditions.map(el => el.label), dietaryRestrictions: restrictions.map(el => el.label)}
        )
        navigate("/home")
    }
    
    const [step, setStep] = useState(1);
    const [conditions, setConditions] = useState([]);
    const [restrictions, setRestrictions] = useState([]);

    return (
        <div id="Landing">
            <div className="landingHero">
                {(step == 1) ? <Step1 conditions={conditions} setConditions={setConditions} /> : <Step2 restrictions={restrictions} setRestrictions={setRestrictions}/>}
            </div>
        <div className="landingCTA">
            <div id="nextBackParent">
                {(step == 1) ? 
                (<PrimaryButton onClick={() => setStep(step + 1)}>Next</PrimaryButton>) : 
                (<PrimaryButton onClick={handleSubmit}>Submit</PrimaryButton>)}
            {(step == 2) ? <SecondaryButton onClick={() => setStep(step - 1)} >Back</SecondaryButton> : <SecondaryButton onClick={() => navigate("/")} >Back</SecondaryButton>}
            </div>
            
        </div>
        </div>
        
    )
}

export default Onboarding;