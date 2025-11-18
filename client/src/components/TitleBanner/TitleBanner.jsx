import "./TitleBanner.css"

import { useNavigate } from "react-router-dom"

const TitleBanner = () => {
    const navigate = useNavigate()
    
    return (
        <header className="titleBanner">
            <h1 className="cursor-pointer" onClick={() => { navigate("/") }}>MenuMind</h1>
        </header>
    )
}

export default TitleBanner
