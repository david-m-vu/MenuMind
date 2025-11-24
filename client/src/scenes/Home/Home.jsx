import "./Home.css"

import { useMemo, useState, useEffect, useRef } from "react"
import { GoogleMap, useGoogleMap, useLoadScript } from "@react-google-maps/api"
import { geocodeLocation, reverseGeocodeLocation } from "../../requests/geocode.js"
import { getRecommendedRestaurants } from "../../requests/restaurant-recs.js"

import TitleBanner from "../../components/TitleBanner/TitleBanner.jsx"
import SearchIcon from "../../assets/icons/search-icon.svg";
import ListIcon from "../../assets/icons/list-icon.svg";
import MapIcon from "../../assets/icons/map-icon.svg";

import { placeSearchFilteredJSON } from "../../data/foursquarePlaces/index.js";
import { testDietaryProfile1 } from "../../data/dietaryProfile/index.js"

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
        fit_score: 5,
        positives: [
            "this good 1",
            "this good 2"
        ],
        negatives: [
            "this lowkey bad though 1",
            "this lowkey bad though 2"
        ],
        notes: "goated restaurant tho"
    }
})

const libraries = ["marker"]

const Home = () => {
    const canUseGeolocation = typeof window !== "undefined" && "geolocation" in navigator

    const [mapCenter, setMapCenter] = useState(null)
    const [mapHeight, setMapHeight] = useState(0)
    const [geoError, setGeoError] = useState(() =>
        canUseGeolocation ? null : "Geolocation is not supported by your browser."
    ) // pass a function so that it evaluates only on the first render
    const [searchQueryInput, setSearchQueryInput] = useState("")
    const [searchLocationInput, setSearchLocationInput] = useState("")

    const [searchResults, setSearchResults] = useState([])
    const [isLoadingResults, setIsLoadingResults] = useState(false)
    const [geocodedLocation, setGeocodedLocation] = useState(null)
    const [selectedMarkerId, setSelectedMarkerId] = useState(null)
    const [isLandscapeLayout, setIsLandscapeLayout] = useState(() => {
        if (typeof window === "undefined") {
            return false
        }
        return window.matchMedia("(orientation: landscape)").matches
    })

    const headerRef = useRef(null)
    const hasInitializedLocation = useRef(false) // ensure we only auto-fill location input once
    const hasSetInitialUserLocation = useRef(false) // ensure we only call setUserLocation once

    const selectedRestaurant = useMemo(
        () => searchResults.find((result) => result.fsq_place_id === selectedMarkerId) ?? null,
        [searchResults, selectedMarkerId]
    )

    // use useMemo so that mapCenter doesn't get recomputed on rerender leading to a different reference, affecting GoogleMap since it's passed in as a prop
    const fallbackCenter = useMemo(
        () => ({ lat: 37.871417334009834, lng: -122.25546300259538 }), // center at UC Berkeley
        []
    )

    const mapId = import.meta.env.VITE_GOOGLE_MAP_ID

    // use useMemo so that mapOptions doesn't get recomputed on rerender leading to a different reference, affecting GoogleMap since it's passed in as a prop
    const mapOptions = useMemo(
        () => ({
            disableDefaultUI: true,
            zoomControl: true,
            mapId,
        }),
        [mapId]
    )

    // useLoadScript is a helper that loads the Google Maps JS API asynchronously for you, injecting API key/libraries
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    })

    // sets map view positioning on resize
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

        const orientationMedia = typeof window !== "undefined"
            ? window.matchMedia("(orientation: landscape)")
            : null

        const updateOrientation = (event) => setIsLandscapeLayout(event.matches)

        if (orientationMedia) {
            setIsLandscapeLayout(orientationMedia.matches)
            if (orientationMedia.addEventListener) { // invoke updateOrientation whenever the media query status changes
                orientationMedia.addEventListener("change", updateOrientation)
            } else {
                orientationMedia.addListener(updateOrientation) // backwards compatibility
            }
        }

        window.addEventListener("resize", updateMapHeight) // updates map height on resize

        return () => {
            window.removeEventListener("resize", updateMapHeight)
            if (orientationMedia) {
                if (orientationMedia.removeEventListener) {
                    orientationMedia.removeEventListener("change", updateOrientation)
                } else {
                    orientationMedia.removeListener(updateOrientation)
                }
            }
        }
    }, [])

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
                setMapCenter({ lat: latitude, lng: longitude })
                setGeoError(null)
            },
            (error) => {
                if (error.code !== 1) { // code 1 means user denied geolocation
                    setGeoError(error.message)
                }
                console.log(error.message);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10_000,
                timeout: 10_000,
            }
        )

        return () => navigator.geolocation.clearWatch(watcher)
    }, [canUseGeolocation])

    // sets address input to user's current location ON INITIALIZATION
    useEffect(() => {
        if (hasInitializedLocation.current) return
        if (!mapCenter) return
        // if (searchLocationInput.trim().length > 0) return

        const initializeAddress = async () => {
            try {
                const geocodeData = await reverseGeocodeLocation(mapCenter)
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
    }, [mapCenter])

    const handleFormSubmit = async (event) => {
        event.preventDefault()

        if (searchQueryInput === "") {
            return;
        }

        // if input for location, convert it to coordinates
        let geocodeData
        if (searchLocationInput !== "") {
            try {
                geocodeData = await geocodeLocation(searchLocationInput)
                if (geocodeData) {
                    console.log("Geocoded:", geocodeData)
                    setGeocodedLocation(geocodeData)
                    // setSearchLocation(geocodeData.formattedAddress)
                    setMapCenter(geocodeData.location)
                    console.log(geocodeData.location)
                }
            } catch (error) {
                console.error("Geocoding failed:", error)
                return
            }
        } else if (mapCenter) { // use user's current location
            try {
                geocodeData = await reverseGeocodeLocation(mapCenter)
                if (geocodeData) {
                    setGeocodedLocation(geocodeData)
                    setSearchLocationInput(geocodeData.formattedAddress)
                    setMapCenter(geocodeData.location)
                    console.log("Reverse geocoded:", geocodeData)
                }
            } catch (error) {
                console.error("Reverse geocoding failed:", error)
                return
            }
        }


        console.log(searchQueryInput, searchLocationInput)

        // const coordinates = geocodeData?.location ?? mapCenter
        // if (!coordinates) {
        //     console.error("Unable to determine coordinates for recommendation search.")
        //     return
        // }

        // call restaurant-recs endpoint
        try {
            setIsLoadingResults(true)
            // const { results } = await getRecommendedRestaurants({
            //     query: searchQueryInput,
            //     coordinates,
            //     dietaryConditions: testDietaryProfile1.dietaryConditions,
            //     dietaryRestrictions: testDietaryProfile1.dietaryRestrictions,
            // })
            // setSearchResults(results ?? [])
            // console.log(results)
        } catch (error) {
            console.error("Request to restaurant-recs failed:", error);
            return;
        } finally {
            setTimeout(() => {
                setSearchResults(tempResults)
                setIsLoadingResults(false)
            }, 2000)

            // setIsLoadingResults(false);

        }
    }

    const handleFormKeyDown = (event) => {
        if (event.key === "Enter") {
            handleFormSubmit(event)
        }
    }

    const handleMarkerSelect = (markerId) => {
        setSelectedMarkerId((current) => (current === markerId ? null : markerId))
    }

    const handleCloseSelectedRestaurant = () => {
        setSelectedMarkerId(null)
    }

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
                        <div className="homeSearchTextInputs">
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
                        <div className="homeInputIconContainer">
                            <img className="homeInputIcon" src={ListIcon} alt="list icon" />
                        </div>
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
                            center={mapCenter ?? fallbackCenter}
                            zoom={mapCenter ? 15 : 12}
                            options={mapOptions}
                            onClick={handleCloseSelectedRestaurant}
                        >
                            {isLoadingResults && (
                                <div className="homeLoadingOverlay" aria-live="polite">
                                    <div className="loader"></div>
                                    <p>Finding the best possible restaurants…</p>
                                </div>
                            )}
                            {searchResults.map((result) => (
                                <AdvancedMarker
                                    key={result.fsq_place_id}
                                    position={{
                                        lat: result.latitude,
                                        lng: result.longitude,
                                    }}
                                    selected={selectedMarkerId === result.fsq_place_id}
                                    onSelect={() => handleMarkerSelect(result.fsq_place_id)}
                                />
                            ))}
                        </GoogleMap>
                    )}
                    <RestaurantDetailsDrawer
                        restaurant={selectedRestaurant}
                        isLandscape={isLandscapeLayout}
                        onClose={handleCloseSelectedRestaurant}
                    />
                </div>
            </div>
        </div>
    )
}

const RestaurantDetailsDrawer = ({ restaurant, isLandscape, onClose }) => {
    const categoryNames = restaurant?.categories
        ? restaurant.categories.map((category) => category.name).join(", ")
        : null
    const positives = restaurant?.positives ?? []
    const negatives = restaurant?.negatives ?? []

    const drawerClasses = [
        "homeDrawer",
        restaurant ? "homeDrawer--visible" : "", // render nothing if passed-in restaurant is null 
        isLandscape ? "homeDrawer--landscape" : "",
    ]
        .filter(Boolean)
        .join(" ")

    return (
        <div className={drawerClasses} aria-hidden={!restaurant}>
            <div className="homeDrawerHeader">
                <div>
                    {/* need these two nullish checks because theres a point when restaurant details disappear while it slides back out of the screen (selectedRestaurant becomes null) */}
                    <p className="homeDrawerEyebrow">{categoryNames ?? "Restaurant"}</p>
                    <h3 className="homeDrawerTitle">{restaurant?.name ?? "Select a place"}</h3>
                    <p className="homeDrawerAddress">
                        {restaurant?.location?.formatted_address ?? restaurant?.location?.address ?? ""}
                    </p>
                </div>
                <button className="homeDrawerCloseButton" type="button" onClick={onClose} aria-label="Close details">
                    ×
                </button>
            </div>

            {restaurant && (
                <div className="homeDrawerContent">
                    {restaurant.fit_score && (
                        <div className="homeDrawerScore">Fit score: {restaurant.fit_score}/5</div>
                    )}

                    {!!positives.length && (
                        <div className="homeDrawerSection">
                            <p className="homeDrawerSectionTitle">Why it works:</p>
                            <ul>
                                {positives.map((positive, index) => (
                                    <li key={`positive-${index}`}>{positive}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {!!negatives.length && (
                        <div className="homeDrawerSection">
                            <p className="homeDrawerSectionTitle">Consider:</p>
                            <ul>
                                {negatives.map((negative, index) => (
                                    <li key={`negative-${index}`}>{negative}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {restaurant.notes && (
                        <div className="homeDrawerSection">
                            <p className="homeDrawerSectionTitle">Notes:</p>
                            <p>{restaurant.notes}</p>
                        </div>
                    )}
                    {restaurant.categories?.[0]?.icon && (
                        <img className="homeDrawerIcon" src={`${restaurant.categories[0].icon.prefix}88${restaurant.categories[0].icon.suffix}`} alt="" />
                    )}
                </div>
            )}
        </div>
    )
}

const AdvancedMarker = ({ position, selected, onSelect }) => {
    const map = useGoogleMap()
    const lat = position?.lat
    const lng = position?.lng
    const markerRef = useRef(null)
    const onSelectRef = useRef(onSelect)

    useEffect(() => {
        onSelectRef.current = onSelect
    }, [onSelect])

    useEffect(() => {
        if (
            !map ||
            lat == null ||
            lng == null ||
            !window.google?.maps?.marker?.AdvancedMarkerElement
        ) {
            return
        }

        const marker = new window.google.maps.marker.AdvancedMarkerElement({
            map,
            position: { lat, lng },
        })

        markerRef.current = marker

        const clickListener = marker.addListener("gmp-click", () => {
            onSelectRef.current?.()
        })

        return () => {
            clickListener.remove()
            marker.map = null
            markerRef.current = null // set to null in case of memory leaks
        }
    }, [map, lat, lng])

    useEffect(() => {
        const marker = markerRef.current
        const PinElement = window.google?.maps?.marker?.PinElement
        if (!marker || !PinElement) {
            return
        }

        const pin = new PinElement({
            scale: selected ? 1.4 : 1,
            background: selected ? "#FF5D5D" : "#AEE881",
            borderColor: "#000",
            glyphColor: "#000",
        })

        marker.content = pin.element
        marker.zIndex = selected ? 2 : 1
    }, [selected])

    return null
}

export default Home;
