// Menu analysis API requests

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL
/**
 * Analyze menu image using OCR + AI
 * @param {string} imageData - Base64 encoded image or image URL
 * @param {Array} dietaryConditions - User's dietary conditions
 * @param {Array} dietaryRestrictions - User's dietary restrictions
 * @param {boolean} useOCR - Whether to use Tesseract OCR (true) or Vision AI (false)
 * @returns {Promise<Object>} AI recommendations and risky items
 */
export const analyzeMenuImage = async (imageData, dietaryConditions = [], dietaryRestrictions = [], useOCR = true) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze-menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData,
        conditions: dietaryConditions,
        restrictions: dietaryRestrictions,
        useOCR,
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Menu analysis failed:', error)
    throw error
  }
}
