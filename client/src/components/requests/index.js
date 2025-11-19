export const geocodeLocation = async (locationText) => {
    if (!locationText.trim()) {
        return null
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const geocodeUrl = new URL("https://maps.googleapis.com/maps/api/geocode/json")
    geocodeUrl.searchParams.set("address", locationText)
    geocodeUrl.searchParams.set("key", apiKey)

    const response = await fetch(geocodeUrl.toString())
    if (!response.ok) {
        throw new Error("Failed to contact geocoding service.")
    }

    const data = await response.json()
    if (data.status !== "OK" || !data.results?.length) {
        throw new Error(data.error_message || "No results found for that location.")
    }

    const topResult = data.results[0]
    return {
        formattedAddress: topResult.formatted_address,
        location: topResult.geometry.location,
    }
}

export const reverseGeocodeLocation = async ({ lat, lng }) => {
    if (typeof lat !== "number" || typeof lng !== "number") {
        return null
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const geocodeUrl = new URL("https://maps.googleapis.com/maps/api/geocode/json")
    geocodeUrl.searchParams.set("latlng", `${lat},${lng}`)
    geocodeUrl.searchParams.set("key", apiKey)

    const response = await fetch(geocodeUrl.toString())
    if (!response.ok) {
        throw new Error("Failed to contact geocoding service.")
    }

    const data = await response.json()
    if (data.status !== "OK" || !data.results?.length) {
        throw new Error(data.error_message || "No results found for that coordinate.")
    }

    const topResult = data.results[0]
    return {
        formattedAddress: topResult.formatted_address,
        location: topResult.geometry.location,
    }
}
