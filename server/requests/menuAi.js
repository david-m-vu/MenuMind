const axios = require("axios");
async function callMenuAI(image, conditions, restrictions) {
  const response = await fetch(
    "https://noggin.rea.gent/confidential-grasshopper-3488",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.REAGENT_API_KEY_CAMERA}`
      },
      body: JSON.stringify({
        image,
        conditions,
        restrictions
      })
    }
  )

  const data = await response.json()
  return data
}

module.exports = { callMenuAI }
