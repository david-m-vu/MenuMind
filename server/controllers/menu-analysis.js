
const { analyzeMenuImageUnified } = require("../requests/reagent")

async function analyzeMenuController(req, res) {
  try {
    const { image, conditions, restrictions, useOCR } = req.body
    // Branch logic: useOCR (OCR+AI) or direct image->AI (default)
    const aiResult = await analyzeMenuImageUnified(
      image,
      conditions,
      restrictions,
      { useOCR: !!useOCR }
    )
    res.json(aiResult)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to analyze menu" })
  }
}

module.exports = { analyzeMenuController }
