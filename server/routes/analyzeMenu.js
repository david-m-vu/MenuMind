const express = require("express")
const { analyzeMenuController } = require("../controllers/menu-analysis")

const router = express.Router()

router.post("/", analyzeMenuController)

module.exports = router
