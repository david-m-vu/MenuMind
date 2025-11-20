const axios = require("axios")

const FOURSQUARE_BASE_URL = "https://places-api.foursquare.com/places/search"
const DEFAULT_LIMIT = 10
const DEFAULT_RADIUS_METERS = 3_000

const searchFoursquarePlaces = async (lat, lng, query, radius, limit) => {
    if (!lat || !lng) {
        return {
            error: {
                status: 400,
                message: "Latitude (lat) and longitude (lng) are required.",
                results: [],
                context: null
            }
        }
    }

    if (!process.env.FOURSQUARE_API_KEY) {
        return {
            error: {
                status: 500, 
                message: "FOURSQUARE_API_KEY is not configured on the server.",
                results: [],
                context: null
            }
        }
    }

    try {
        const response = await axios.get(FOURSQUARE_BASE_URL, {
            params: {
                query,
                ll: `${lat},${lng}`,
                radius: radius ?? DEFAULT_RADIUS_METERS,
                limit: limit ?? DEFAULT_LIMIT,
                sort: "RELEVANCE",
                fields: "fsq_place_id,latitude,longitude,categories,distance,location,name,email,social_media,tel,website"
                // open_now: true,
            },
            headers: {
                Authorization: `Bearer ${process.env.FOURSQUARE_API_KEY}`,
                "X-Places-Api-Version": "2025-06-17",
                Accept: "application/json",
            },
        })

        return {
            error: null,
            results: response.data?.results ?? [],
            context: {
                total: response.data?.results?.length ?? 0,
            },
        }
    } catch (error) {
        const status = error.response?.status ?? 500
        const message =
            error.response?.data?.message ??
            error.response?.data?.error ??
            "Unable to fetch places from Foursquare."

        return {
            error: {
                status,
                message,
                results: [],
                context: null
            }
        }
    }
}

module.exports = {
    searchFoursquarePlaces
}