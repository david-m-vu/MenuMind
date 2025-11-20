const express = require("express")
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors")
require("dotenv").config()

const restaurantRecsRouter = require("./routes/restaurant-recs")

const app = express()
const PORT = process.env.PORT || 4000

// allow requests only from client orign
app.use( 
    cors({
        origin: process.env.CLIENT_URL
    })
)
app.use(express.json())
app.use(morgan("common"));
// app.use(bodyParser.json({ limit: "30mb", extended: true }))
// app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.get("/", (_req, res) => {
    res.send("server running")
})

app.get("/health", (_req, res) => {
    res.json({ status: "ok" })
})

app.use("/api/restaurant-recs", restaurantRecsRouter)

// catch-all for routes that didn't match
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found.` })
})

// error handler
app.use((error, _req, res, _next) => {
    const status = error.status || 500
    res.status(status).json({
        error: error.message || "Internal server error.",
    })
})

app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`)
})
