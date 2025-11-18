import { useMemo } from "react"
import { GoogleMap, useLoadScript } from "@react-google-maps/api"
import TitleBanner from "../../components/TitleBanner/TitleBanner.jsx"
import "./Home.css"

const Home = () => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ["places"],
    })

    const mapCenter = useMemo(
        () => ({ lat: 37.7749, lng: -122.4194 }),
        []
    )

    const mapOptions = useMemo(
        () => ({
            disableDefaultUI: true,
            zoomControl: true,
        }),
        []
    )

    return (
        <div className="homeScreen">
            <div className="homeTitleOverlay">
                <TitleBanner />
            </div>
            <div className="homeMapContainer">
                {loadError ? (
                    <p className="homeMapStatus">Unable to load map.</p>
                ) : !isLoaded ? (
                    <p className="homeMapStatus">Loading map...</p>
                ) : (
                    <GoogleMap
                        mapContainerClassName="homeMap"
                        center={mapCenter}
                        zoom={12}
                        options={mapOptions}
                    />
                )}
            </div>
        </div>
    )
}

export default Home;
