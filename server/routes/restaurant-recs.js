const { Router } = require("express")
const { getRecommendedRestaurants } = require("../controllers/restaurant-recs")

const router = Router()

router.get("/", getRecommendedRestaurants)

module.exports = router
