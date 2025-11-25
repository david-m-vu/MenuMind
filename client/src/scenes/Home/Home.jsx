import "./Home.css"

import { useMemo, useState, useEffect, useRef } from "react"
import { GoogleMap, useGoogleMap, useLoadScript } from "@react-google-maps/api"
import { geocodeLocation, reverseGeocodeLocation } from "../../requests/geocode.js"
import { getRecommendedRestaurants } from "../../requests/restaurant-recs.js"

import RestaurantsListView from "./RestaurantsListView/RestaurantsListView.jsx"
import TitleBanner from "../../components/TitleBanner/TitleBanner.jsx"
import SearchIcon from "../../assets/icons/search-icon.svg";
import ListIcon from "../../assets/icons/list-icon.svg";
import MapIcon from "../../assets/icons/map-icon.svg";
import WebsiteIcon from "../../assets/icons/www-icon.png"
import InstagramIcon from "../../assets/icons/Instagram_Glyph_Gradient.svg"

import { placeSearchFilteredJSON } from "../../data/foursquarePlaces/index.js";
// import { testDietaryProfile1 } from "../../data/dietaryProfile/index.js"
// Jake: I commented this out as I stored the user in App.jsx

// for testing - so that we don't have to call the API every time
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

const Home = ({user}) => {

    const testDietaryProfile1 = user; //Jake: CHANGE THIS, I added this so ur code doesn't break.

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
    // const [geocodedLocation, setGeocodedLocation] = useState(null)
    const [selectedMarkerId, setSelectedMarkerId] = useState(null)
    const [isListView, setIsListView] = useState(false)
    const [isLandscapeLayout, setIsLandscapeLayout] = useState(() => {
        if (typeof window === "undefined") {
            return false
        }
        return window.matchMedia("(orientation: landscape)").matches
    })
    const [searchContainerHeight, setSearchContainerHeight] = useState(0)

    const headerRef = useRef(null)
    const searchContainerRef = useRef(null)
    const hasInitializedLocation = useRef(false) // ensure we only auto-fill location input once
    const shouldSyncLocationInput = useRef(false) // track whether map center came from geolocation
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

    // keeps track of search container height so list view can sit below it
    useEffect(() => {
        const updateSearchContainerHeight = () => {
            const height = searchContainerRef.current?.offsetHeight ?? 0
            setSearchContainerHeight(height)
        }

        updateSearchContainerHeight()

        // note: this only triggers when the window gets resized, not the search container
        window.addEventListener("resize", updateSearchContainerHeight)

        let resizeObserver // built in browser API that lets you watch an element itself - get notified when size hcanges
        if (typeof ResizeObserver !== "undefined" && searchContainerRef.current) {
            resizeObserver = new ResizeObserver(() => updateSearchContainerHeight())
            resizeObserver.observe(searchContainerRef.current)
        }

        return () => {
            window.removeEventListener("resize", updateSearchContainerHeight)
            resizeObserver?.disconnect()
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
                shouldSyncLocationInput.current = true
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

    // sets address input to user's current location when we auto-detect via geolocation
    useEffect(() => {
        if (hasInitializedLocation.current) return
        if (!mapCenter) return
        if (!shouldSyncLocationInput.current) return
        // if (searchLocationInput.trim().length > 0) return

        const initializeAddress = async () => {
            try {
                const geocodeData = await reverseGeocodeLocation(mapCenter)
                if (geocodeData) {
                    // setGeocodedLocation(geocodeData)
                    setSearchLocationInput(geocodeData.formattedAddress)
                }
            } catch (error) {
                console.error("Reverse geocoding failed:", error)
            } finally {
                hasInitializedLocation.current = true
                shouldSyncLocationInput.current = false
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
                    // setGeocodedLocation(geocodeData)
                    // setSearchLocation(geocodeData.formattedAddress)
                    shouldSyncLocationInput.current = false
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
                    // setGeocodedLocation(geocodeData)
                    setSearchLocationInput(geocodeData.formattedAddress)
                    shouldSyncLocationInput.current = false
                    setMapCenter(geocodeData.location)
                    console.log("Reverse geocoded:", geocodeData)
                }
            } catch (error) {
                console.error("Reverse geocoding failed:", error)
                return
            }
        }


        console.log(searchQueryInput, searchLocationInput, testDietaryProfile1.dietaryConditions)

        const coordinates = geocodeData?.location ?? mapCenter
        if (!coordinates) {
            console.error("Unable to determine coordinates for recommendation search.")
            return
        }

        // call restaurant-recs endpoint
        try {
            setIsLoadingResults(true)
            const { results } = await getRecommendedRestaurants({
                query: searchQueryInput,
                coordinates,
                dietaryConditions: testDietaryProfile1.dietaryConditions,
                dietaryRestrictions: testDietaryProfile1.dietaryRestrictions,
            })
            setSearchResults(results ?? [])
            console.log(results)
        } catch (error) {
            console.error("Request to restaurant-recs failed:", error);
            return;
        } finally {
            // setTimeout(() => {
            //     setSearchResults(tempResults)
            //     setIsLoadingResults(false)
            // }, 2000)

            setIsLoadingResults(false);

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
                    ref={searchContainerRef}
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
                        <div
                            className={`homeInputIconContainer ${selectedMarkerId ? "homeInputIconContainer--docked" : ""}`}
                            onClick={() => {
                                setSelectedMarkerId(null);
                                setIsListView((previous) => !previous)
                            }}
                        >
                            <img className="homeInputIcon" src={isListView ? MapIcon : ListIcon} alt="toggle list view" />
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
                                    score={result.fit_score}
                                />
                            ))}
                        </GoogleMap>
                    )}
                    {isListView && (
                        <RestaurantsListView
                            results={searchResults}
                            onSelect={(restaurantId) => handleMarkerSelect(restaurantId)}
                            selectedId={selectedMarkerId}
                            searchOffset={searchContainerHeight}
                        />
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
    const website = restaurant?.website
    const instagramHandle = restaurant?.social_media?.instagram
    const instagramUrl = instagramHandle ? `https://www.instagram.com/${instagramHandle}` : null

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
                    {(restaurant.fit_score || website || instagramUrl) && (
                        <div className="homeDrawerScoreRow">
                            {restaurant.fit_score && (
                                <div className="homeDrawerScore">Fit score: {restaurant.fit_score}/5</div>
                            )}
                            {(website || instagramUrl) && (
                                <div className="homeDrawerLinks">
                                    {website && (
                                        <a
                                            className="homeDrawerLink"
                                            href={website}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <img className="homeDrawerLinkIcon" src={WebsiteIcon} alt="" />
                                            <span>Website</span>
                                        </a>
                                    )}
                                    {instagramUrl && (
                                        <a
                                            className="homeDrawerLink"
                                            href={instagramUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <img className="homeDrawerLinkIcon" src={InstagramIcon} alt="" />
                                            <span>Instagram</span>
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {!!positives.length && (
                        <div className="homeDrawerSection">
                            <p className="homeDrawerSectionTitle">Why here?:</p>
                            <ul>
                                {positives.map((positive, index) => (
                                    <li key={`positive-${index}`}>{positive}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {!!negatives.length && (
                        <div className="homeDrawerSection">
                            <p className="homeDrawerSectionTitle">Things to Consider:</p>
                            <ul>
                                {negatives.map((negative, index) => (
                                    <li key={`negative-${index}`}>{negative}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {restaurant.notes && (
                        <div className="homeDrawerSection">
                            <p className="homeDrawerSectionTitle">Assumptions/Additional Notes:</p>
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

const AdvancedMarker = ({ position, selected, onSelect, score }) => {
    const map = useGoogleMap()
    const lat = position?.lat
    const lng = position?.lng
    const markerRef = useRef(null)
    const onSelectRef = useRef(onSelect)
    const markerElementRef = useRef(null)
    const badgeElementRef = useRef(null)

    useEffect(() => {
        onSelectRef.current = onSelect
    }, [onSelect])

    // creates the marker refs
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

        const markerElement = document.createElement("div")
        markerElement.className = "homeMapMarker"
        const badgeElement = document.createElement("div")
        badgeElement.className = "homeMapMarkerBadge"
        markerElement.appendChild(badgeElement)

        marker.content = markerElement

        markerRef.current = marker
        markerElementRef.current = markerElement
        badgeElementRef.current = badgeElement

        const clickListener = marker.addListener("gmp-click", () => {
            onSelectRef.current?.()
        })

        return () => {
            clickListener.remove()
            marker.map = null
            markerRef.current = null // set to null in case of memory leaks
            markerElementRef.current = null
            badgeElementRef.current = null
        }
    }, [map, lat, lng])

    // handle marker style when selected or score updates
    useEffect(() => {
        const marker = markerRef.current
        const markerElement = markerElementRef.current
        const badgeElement = badgeElementRef.current
        if (!marker || !markerElement || !badgeElement) {
            return
        }

        const scoreLabel = Number.isFinite(score)
            ? Number(score).toFixed(1)
            : "•"

        badgeElement.textContent = scoreLabel
        
        markerElement.classList.toggle("homeMapMarker--selected", Boolean(selected))
        badgeElement.classList.toggle("homeMapMarkerBadge--selected", Boolean(selected))
        marker.zIndex = selected ? 20 : 10
    }, [selected, score])

    return null
}

export default Home;
