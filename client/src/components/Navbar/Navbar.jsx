import "./Navbar.css"

import { useNavigate, useLocation } from "react-router-dom"

import HomeIcon from "../../assets/icons/home-icon.svg"
import CameraIcon from "../../assets/icons/camera-icon.svg"
import ProfileIcon from "../../assets/icons/profile-icon.svg"


const navItems = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "camera", label: "Menu Photo", icon: CameraIcon },
    { id: "profile", label: "Profile", icon: ProfileIcon },
]

const Navbar = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const isActive = (item) => {
        const curPath = `/${item.id}`
        if (location.pathname.startsWith(curPath)) return true
        // treat image-selection as part of camera flow so camera stays active
        if (item.id === 'camera' && location.pathname.startsWith('/image-selection')) return true
        return false
    }
    
    return (
        <nav className="Navbar">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    className={`navbarItem ${isActive(item) ? "is-active" : ""}`}
                    aria-label={item.label}
                    onClick={() => navigate(`/${item.id}`)}
                >
                    <span className="navbarIcon" aria-hidden="true">
                        <img src={item.icon} alt={item.label} />
                    </span>
                    <p>{item.id}</p>  
                </button>
            ))}
        </nav>
    )
}

export default Navbar
