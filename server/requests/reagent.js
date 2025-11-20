const axios = require("axios");

/*
 * This function is responsible for stripping out the fields in foursquarePlaces that aren't useful to the AI,
 * and passing the normalized object into the reagent noggin, along with the original user query, dietary conditions,
 * and dietary restrictions. 
 * 
 * Returns the intersection between foursquarePlaces and the restaurants the AI recommends.
 * The chosen restaurant objects have take the union between the fields of foursquarePlaces and the AI response.
 */
const curateFoursquarePlaces = async (foursquarePlaces, query, dietaryConditions, dietaryRestrictions) => {
    const placesNormalized = foursquarePlaces.map((place) => {
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
        foursquarePlaces.map((place) => [place.fsq_place_id, place])
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

    return combinedRecommendations;
}

module.exports = {
    curateFoursquarePlaces
}