const { callMenuAI } = require("../requests/menuAi")
const { curateMenuRecs } = require("../requests/reagent")

async function analyzeMenuController(req, res) {
  try {
    const { image, conditions, restrictions, useOCR } = req.body
    
    let aiResult
    if (useOCR) {
      // Use Tesseract OCR + AI parsing
      aiResult = await curateMenuRecs(image, conditions, restrictions)
    } else {
      // Use direct vision AI (existing flow)
      aiResult = await callMenuAI(image, conditions, restrictions)
    }
    
    res.json(aiResult)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to analyze menu" })
  }
}

module.exports = { analyzeMenuController }
