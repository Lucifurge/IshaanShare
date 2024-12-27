const express = require("express");
const cookieParser = require("cookie-parser");
const axios = require("axios");
const cors = require("cors");
const winston = require("winston");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Post Spam API",
      version: "1.0.0",
      description: "API to simulate post sharing on Facebook with dynamic cookies",
    },
  },
  apis: ["./server.js"], // Points to the file containing API documentation
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Logger setup
const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://frontend-253d.onrender.com",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Serve the frontend theme (static assets, like HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Root route (added for 404 handling and general response)
app.get("/", (req, res) => {
  res.send("Welcome to Ishaanshares Backend API!");
});

// API Route to handle post sharing requests
/**
 * @swagger
 * /api/spam:
 *   post:
 *     summary: Share posts on Facebook
 *     description: Simulates sharing a post on Facebook using dynamic cookies.
 *     parameters:
 *       - in: body
 *         name: requestBody
 *         description: The request body containing cookies, link, share count, and interval.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             cookies:
 *               type: array
 *               description: The cookies needed to authenticate the requests
 *               items:
 *                 type: object
 *                 properties:
 *                   key:
 *                     type: string
 *                   value:
 *                     type: string
 *             fbLink:
 *               type: string
 *               description: The link of the post to be shared
 *             shareCount:
 *               type: integer
 *               description: Number of times to share the post
 *             interval:
 *               type: integer
 *               description: Interval in seconds between shares
 *     responses:
 *       200:
 *         description: Successfully shared posts
 *       400:
 *         description: Bad request, missing fields
 *       500:
 *         description: Server error
 */
app.post("/api/spam", async (req, res) => {
  const { cookies, fbLink, shareCount, interval } = req.body;

  if (!cookies || !fbLink || !shareCount || !interval) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Prepare cookies header
  const cookiesHeader = cookies
    .map((cookie) => `${cookie.key}=${cookie.value}`)
    .join("; ");

  try {
    const totalShares = Math.min(shareCount, 2000000); // Limit the maximum shares to 2 million

    // Simulate sharing with concurrency control and intervals
    let sharedCount = 0;
    while (sharedCount < totalShares) {
      const sharesToProcess = Math.min(100, totalShares - sharedCount); // Limit concurrent requests to avoid overloading
      const requests = [];

      for (let i = 0; i < sharesToProcess; i++) {
        requests.push(
          axios.post(fbLink, {}, {
            headers: {
              Cookie: cookiesHeader,
              "Content-Type": "application/json",
            },
          })
        );
      }

      // Wait for all requests to complete
      await Promise.all(requests);

      sharedCount += sharesToProcess;

      // Log progress in the backend for internal use
      logger.info(`Shared ${sharedCount} out of ${totalShares} times.`);

      // Simulate delay
      if (sharedCount < totalShares) {
        await new Promise(resolve => setTimeout(resolve, interval * 1000));
      }
    }

    return res.json({
      message: `Successfully shared ${totalShares} times!`,
    });
  } catch (error) {
    logger.error("Error while processing request", error);
    return res.status(500).json({ message: "An error occurred while processing your request." });
  }
});

// Health check route
app.get("/status", (req, res) => {
  res.status(200).json({
    message: "Backend is up and running!",
    status: "OK",
    timestamp: new Date(),
  });
});

// Log request for debugging purposes
app.use((req, res, next) => {
  logger.info(`Request received: ${req.method} ${req.url}`);
  next();
});

// Start the server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
