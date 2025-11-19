import "./Home.css"

import { useMemo, useState, useEffect, useRef } from "react"
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api"
import { geocodeLocation, reverseGeocodeLocation } from "../../components/requests/index.js"

import TitleBanner from "../../components/TitleBanner/TitleBanner.jsx"
import SearchIcon from "../../assets/icons/search-icon.svg";

import { placeSearchFilteredJSON } from "../../data/index.js";

// const tempData = {
//     restaurants: [
//         {
//             // ... foursqaure places response

//             // AI fils this in
//             ds_score: 5, 
//             reasons: {
//                 positives: [],
//                 negatives: [],
//             }
//         }
//     ]
// }

const tempResults = placeSearchFilteredJSON.results.map((result) => {
    return {
        ...result,
        ds_score: 5,
        reasons: {
            positives: [],
            negatives: []
        }
    }
})

const Home = () => {
    const canUseGeolocation = typeof window !== "undefined" && "geolocation" in navigator

    const [userLocation, setUserLocation] = useState(null)
    const [geoError, setGeoError] = useState(() =>
        canUseGeolocation ? null : "Geolocation is not supported by your browser."
    ) // pass a function so that it evaluates only on the first render
    const [searchQueryInput, setSearchQueryInput] = useState("")
    const [searchLocationInput, setSearchLocationInput] = useState("")
    const [mapHeight, setMapHeight] = useState(0)
    const [searchResults, setSearchResults] = useState([])
    const [geocodedLocation, setGeocodedLocation] = useState(null)
    
    const headerRef = useRef(null)
    const hasInitializedLocation = useRef(false) // ensure we only auto-fill location input once
    const hasSetInitialUserLocation = useRef(false) // ensure we only call setUserLocation once
    
    // useLoadScript is a helper that loads the Google Maps JS API asynchronously for you, injecting API key/libraries
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    })

        // use useMemo so that mapCenter doesn't get recomputed on rerender leading to a different reference, affecting GoogleMap since it's passed in as a prop
    const fallbackCenter = useMemo(
        () => ({ lat: 37.871417334009834, lng: -122.25546300259538 }), // center at UC Berkeley
        []
    )

    // use useMemo so that mapOptions doesn't get recomputed on rerender leading to a different reference, affecting GoogleMap since it's passed in as a prop
    const mapOptions = useMemo(
        () => ({
            disableDefaultUI: true,
            zoomControl: true,
        }),
        []
    )

    // handles asking for user's location
    useEffect(() => {
        if (!canUseGeolocation) {
            return
        }

        const watcher = navigator.geolocation.watchPosition(
            (position) => {
                if (hasSetInitialUserLocation.current) { // set map center only at the beginning
                    setGeoError(null)
                    return
                }
                hasSetInitialUserLocation.current = true
                const { latitude, longitude } = position.coords
                setUserLocation({ lat: latitude, lng: longitude })
                setGeoError(null)
            },
            (error) => {
                setGeoError(error.message)
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10_000,
                timeout: 10_000,
            }
        )

        return () => navigator.geolocation.clearWatch(watcher)
    }, [canUseGeolocation])

    // sets address input to user's current location on initialization
    useEffect(() => {
        if (hasInitializedLocation.current) return
        if (!userLocation) return
        if (searchLocationInput.trim().length > 0) return

        const initializeAddress = async () => {
            try {
                const geocodeData = await reverseGeocodeLocation(userLocation)
                if (geocodeData) {
                    setGeocodedLocation(geocodeData)
                    setSearchLocationInput(geocodeData.formattedAddress)
                }
            } catch (error) {
                console.error("Reverse geocoding failed:", error)
            } finally {
                hasInitializedLocation.current = true
            }
        }

        initializeAddress()
    }, [userLocation, searchLocationInput])

    const handleFormSubmit = async (event) => {
        event.preventDefault()

        if (searchQueryInput === "") {
            return;
        }

        // if input for location, convert it to coordinates
        if (searchLocationInput !== "") {
            try {
                const geocodeData = await geocodeLocation(searchLocationInput)
                if (geocodeData) {
                    console.log("Geocoded:", geocodeData)
                    setGeocodedLocation(geocodeData)
                    // setSearchLocation(geocodeData.formattedAddress)
                    setUserLocation(geocodeData.location)
                    console.log(geocodeData.location);

                }
            } catch (error) {
                console.error("Geocoding failed:", error)
            }
        } else if (userLocation) { // use user's current location
            try {
                const geocodeData = await reverseGeocodeLocation(userLocation)
                if (geocodeData) {
                    setGeocodedLocation(geocodeData)
                    setSearchLocationInput(geocodeData.formattedAddress)
                    setUserLocation(geocodeData.location)
                    console.log("Reverse geocoded:", geocodeData)
                }
            } catch (error) {
                console.error("Reverse geocoding failed:", error)
            }
        }


        console.log(searchQueryInput, searchLocationInput)

        // THIS IS TEMPORARY WHILE TEMPRESULTS IS USED (UC BERKELEY COORDS)
        setUserLocation({lat: 37.8712141, lng: -122.255463})
        setSearchResults(tempResults)
    }

    const handleFormKeyDown = (event) => {
        if (event.key === "Enter") {
            handleFormSubmit(event)
        }
    }

    useEffect(() => {
        const updateMapHeight = () => {
            if (typeof window === "undefined") {
                return
            }
            const headerHeight = headerRef.current?.offsetHeight ?? 0
            const navbarHeight = document.querySelector(".Navbar")?.offsetHeight ?? 0
            const availableHeight = window.innerHeight - headerHeight - navbarHeight
            setMapHeight(Math.max(availableHeight, 200))
        }

        updateMapHeight()
        window.addEventListener("resize", updateMapHeight) // updates map height on resize
        return () => window.removeEventListener("resize", updateMapHeight)
    }, [])

    return (
        <div className="homeScreen">
            <div ref={headerRef}>
                <TitleBanner />
            </div>

            <div className="homeMapSection">
                <form
                    className="homeSearchContainer"
                    onSubmit={handleFormSubmit}
                    onKeyDown={handleFormKeyDown}
                >
                    <div className="homeSearchInputs">
                        <label htmlFor="home-search" className="srOnly">Search for restaurants</label>
                        <div className="homeSearchInputContainer">
                            <button type="submit" className="homeSubmitButton">
                                <img className="searchIcon" src={SearchIcon} alt="search icon" />
                            </button>
                            <input
                                id="home-search"
                                type="text"
                                className="homeSearchInput"
                                placeholder="What are you in the mood for?"
                                aria-label="Search for restaurants"
                                value={searchQueryInput}
                                onChange={(event) => setSearchQueryInput(event.target.value)}
                            />
                            
                        </div>
                        <label htmlFor="home-location" className="srOnly">Enter a location</label>
                        <input
                            id="home-location"
                            type="text"
                            className="homeLocationInput"
                            placeholder="City or address"
                            aria-label="City or address"
                            value={searchLocationInput}
                            onChange={(event) => setSearchLocationInput(event.target.value)}
                        />
                    </div>
                </form>
                
                <div className="homeMapContainer" style={{ height: `${mapHeight}px` }}>
                    {loadError ? (
                        <p className="homeMapStatus">Unable to load map.</p>
                    ) : !isLoaded ? (
                        <p className="homeMapStatus">Loading map...</p>
                    ) : geoError ? (
                        <p className="homeMapStatus">
                            Unable to access your location: {geoError}
                        </p>
                    ) : (
                        <GoogleMap
                            mapContainerClassName="homeMap"
                            center={userLocation ?? fallbackCenter}
                            zoom={userLocation ? 15 : 12}
                            options={mapOptions}
                        >
                            {searchResults.map((result) => (
                                <Marker
                                    key={result.fsq_place_id}
                                    position={{
                                        lat: result.latitude,
                                        lng: result.longitude,
                                    }}
                                />
                            ))}
                        </GoogleMap>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Home;
