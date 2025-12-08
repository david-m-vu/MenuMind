const { Router } = require("express")
const { analyzeMenuController } = require("../controllers/menu-analysis")

const router = Router()

router.post("/", analyzeMenuController)

module.exports = router
