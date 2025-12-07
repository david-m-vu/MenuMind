const { callMenuAI } = require("../requests/menuAi")

async function analyzeMenuController(req, res) {
  try {
    const { image, conditions, restrictions } = req.body
    const aiResult = await callMenuAI(image, conditions, restrictions)
    res.json(aiResult)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to analyze menu" })
  }
}

module.exports = { analyzeMenuController }
