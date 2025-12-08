// For picture->OCR processing pipeline (convert picture to text first)

const axios = require("axios");

/**
 * Calls the AI endpoint with cleaned menu text and dietary info.
 * Uses REAGENT_API_KEY_CAMERA_2 for authorization.
 * @param {string} menuText - Cleaned menu text
 * @param {Array} conditions
 * @param {Array} restrictions
 * @returns {Promise<Object>} AI result
 */
async function callMenuAIFromText(menuText, conditions, restrictions) {
  let aiRecommendations = null;
  try {
    const aiResponse = await axios.post(
      "https://noggin.rea.gent/incredible-vicuna-3261",
      {
        menuText,
        conditions,
        restrictions,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REAGENT_API_KEY_CAMERA_2}`,
          "Content-Type": "application/json",
        },
      }
    );
    aiRecommendations = aiResponse.data;
    if (typeof aiRecommendations === "string") {
      try {
        aiRecommendations = JSON.parse(aiRecommendations);
      } catch (parseError) {
        console.warn("Unable to parse AI recommendations JSON:", parseError);
        aiRecommendations = { raw: aiRecommendations };
      }
    }
  } catch (error) {
    console.error("ReAgent request failed:", error.response?.data ?? error.message);
    aiRecommendations = {
      error: "Failed to generate AI recommendations.",
      details: error.response?.data ?? null,
    };
  }
  return {
    menuItems: aiRecommendations?.menuItems || [],
    itemScores: aiRecommendations?.itemScores || [],
    itemCriteria: aiRecommendations?.itemCriteria || [],
  };
}

module.exports = { callMenuAIFromText };
