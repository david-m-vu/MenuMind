export const getRecommendedRestaurants = async ({ query, coordinates, dietaryConditions = [], dietaryRestrictions = [], radius = 3000, limit = 15 } = {}) => {
    if (!query?.trim()) {
        throw new Error("Query is required")
    }
    const { lat, lng } = coordinates || {}
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error("Valid latitude and longitude are required")
    }

    const url = new URL(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/restaurant-recs`)
    url.searchParams.set("query", query)
    url.searchParams.set("lat", lat)
    url.searchParams.set("lng", lng)
    url.searchParams.set("radius", radius)
    url.searchParams.set("limit", limit)

    if (dietaryConditions.length > 0) {
        url.searchParams.set("dietaryConditions", dietaryConditions.join(","))
    }

    if (dietaryRestrictions.length > 0) {
        url.searchParams.set("dietaryRestrictions", dietaryRestrictions.join(","))
    }

    const response = await fetch(url.toString())
    if (!response.ok) {
        const message = await response.text()
        throw new Error(message || "Failed to fetch restaurant recommendations.")
    }

    const payload = await response.json()
    return payload
}
