const axios = require("axios")
const { searchFoursquarePlaces } = require("../requests/foursquare.js")

const normalizeListInput = (value) => {
    if (!value) return []

    if (Array.isArray(value)) { // if express turns repeated keys into arrays
        return value.map((item) => String(item).trim()).filter((item) => {
            return item !== "";
        })
    }

    if (typeof value === "string") { // if query param is an array as a literal string
        try {
            const parsed = JSON.parse(value) // convert to actual array
            if (Array.isArray(parsed)) {
                return parsed.map((item) => String(item).trim()).filter(Boolean)
            }
        } catch {
            // fall back to comma-separated parsing
        }

        return value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== "")
    }

    return []
}

/**
 * Controller that proxies a request to the Foursquare Places Search API.
 * Accepts lat, lng, query, and optional radius/limit params via query string.
 * 
 * Example response:
 * {
    "results": [
        {
            "fsq_place_id": "5418d2cd498ee5ccc0ead6cc",
            "latitude": 37.86642697874435,
            "longitude": -122.25879824198309,
            "categories": [
                {
                    "fsq_category_id": "4bf58dd8d48988d111941735",
                    "name": "Japanese Restaurant",
                    "short_name": "Japanese",
                    "plural_name": "Japanese Restaurants",
                    "icon": {
                        "prefix": "https://ss3.4sqi.net/img/categories_v2/food/japanese_",
                        "suffix": ".png"
                    }
                }
            ],
        }
    ],
    ...

    recommendations: [
        {
            "fsq_place_id": "5418d2cd498ee5ccc0ead6cc",
            "restaurant_name": "Muracci's Japanese Curry & Grill",
            "fit_score": 5,
            "positives": [
                "Specializes in Japanese curry & grill — likely to offer chicken with rice (direct match for craving).",
                "You can often request milder sauce or plain grilled chicken + white rice, which suits Crohn's needs better."
            ],
            "negatives": [
                "Japanese curry roux can contain dairy (butter/milk) and be rich/spicy — may trigger Crohn's symptoms or lactose intolerance unless confirmed dairy-free.",
                "Breaded fried items (katsu) are fatty and may irritate Crohn's; possible cross-contact with shared fryers/sauces."
            ],
            "notes": "Assuming the menu includes chicken curry and grilled chicken dishes; specific ingredients (use of milk in roux) not provided — confirm dairy content and request low‑spice, plain white rice and separated preparation to reduce cross-contact."
        },
        ...
    ] 
 */
const getRecommendedRestaurants = async (req, res, next) => {
    try {
        const {
            lat,
            lng,
            query,
            radius,
            limit,
            dietaryConditions: rawDietaryConditions,
            dietaryRestrictions: rawDietaryRestrictions,
        } = req.query

        const dietaryConditions = normalizeListInput(rawDietaryConditions)
        const dietaryRestrictions = normalizeListInput(rawDietaryRestrictions)

        const foursquareRes = await searchFoursquarePlaces(lat, lng, query, radius, limit)
        if (foursquareRes.error) {
            const { status, message } = foursquareRes.error
            return res.status(status).json({ error: message })
        }

        const placesNormalized = foursquareRes.results.map((place) => {
            const categories = Array.isArray(place.categories) // probably not gonna be not an array, but just in case
                ? place.categories.map((category) => category.name).filter((categoryName) => categoryName !== "")
                : place.categories?.name
                  ? [place.categories.name]
                  : []
            const categoryIds = Array.isArray(place.categories)
                ? place.categories.map((category) => category.fsq_category_id).filter(Boolean)
                : []

            const normalized = {
                fsq_place_id: place.fsq_place_id,
                restaurant_name: place.name,
                categories,
                category_ids: categoryIds,
                distance: place.distance,
                location: place.location,
            }

            if (place.website) {
                normalized.website = place.website
            }
            if (Array.isArray(place.chains) && place.chains.length > 0) {
                normalized.chains = place.chains.map((chain) => chain.name).filter((name) => name !== "")
            }
            if (place.social_media && Object.keys(place.social_media).length > 0) {
                normalized.social_media = place.social_media
            }

            return normalized
        })

        console.log("placesNormalized", placesNormalized)

        let aiRecommendations = null

        try {
            const aiResponse = await axios.post(
                "https://noggin.rea.gent/soviet-pony-3508",
                {
                    query,
                    dietaryConditions,
                    dietaryRestrictions,
                    places: JSON.stringify(placesNormalized, null, 2),
                    preferences: query,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.REAGENT_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            )
            aiRecommendations = aiResponse.data
            if (typeof aiRecommendations === "string") { //probably won't be a string
                try {
                    aiRecommendations = JSON.parse(aiRecommendations)
                } catch (parseError) {
                    console.warn("Unable to parse AI recommendations JSON:", parseError)
                    aiRecommendations = { raw: aiRecommendations }
                }
            }
        } catch (error) {
            console.error("ReAgent request failed:", error.response?.data ?? error.message)
            aiRecommendations = {
                error: "Failed to generate AI recommendations.",
                details: error.response?.data ?? null,
            }
        }

        const placeById = new Map(
            foursquareRes.results.map((place) => [place.fsq_place_id, place])
        )

        const aiRecommendationList = Array.isArray(aiRecommendations)
            ? aiRecommendations
            : Array.isArray(aiRecommendations?.recommendations)
                ? aiRecommendations.recommendations
                : []

        const combinedRecommendations = aiRecommendationList
            .map((recommendation) => {
                if (!recommendation?.fsq_place_id) {
                    return null
                }
                const matchedPlace = placeById.get(recommendation.fsq_place_id)
                if (!matchedPlace) {
                    return null
                }
                return {
                    ...matchedPlace,
                    ...recommendation,
                }
            })
            .filter(Boolean) // filter out falsy values like null

        res.status(200).json({
            results: combinedRecommendations,
        })
    } catch (error) {
        next(error)
    }
}       

module.exports = {
    getRecommendedRestaurants,
}
