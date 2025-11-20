const { searchFoursquarePlaces } = require("../requests/foursquare.js");
const { curateFoursquarePlaces } = require("../requests/reagent.js");

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

        const recommendedRestaurants = await curateFoursquarePlaces(foursquareRes.results, query, dietaryConditions, dietaryRestrictions);

        res.status(200).json({
            results: recommendedRestaurants,
        })
    } catch (error) {
        next(error)
    }
}       

module.exports = {
    getRecommendedRestaurants,
}
