const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Enable CORS for your frontend only
const corsOptions = {
    origin: "https://frontend-253d.onrender.com",  // Allow requests only from this domain
    methods: ["GET", "POST"], // Allow GET and POST methods
    allowedHeaders: ["Content-Type"], // Allow specific headers
};

app.use(cors(corsOptions)); // Apply CORS with the specified options

// Placeholder function to simulate the sharing process
async function sharePost(cookies, postUrl, amounts, interval) {
    // Format cookies into a single string for the 'cookie' header
    const cookieHeader = cookies.map(cookie => `${cookie.key}=${cookie.value}`).join("; ");

    const process = [];
    for (let i = 1; i <= amounts; i++) {
        process.push({
            index: i,
            status: "Sharing...",
            progress: Math.min(100, (i / amounts) * 100)
        });

        // Simulate the HTTP request to Facebook (replace with actual logic)
        await fetch(postUrl, {
            method: "POST",  // Or GET depending on the URL and the required method
            headers: {
                "Content-Type": "application/json",
                "Cookie": cookieHeader  // Adding the cookies to the request headers
            },
            body: JSON.stringify({ someData: "value" })  // Example body data, modify as needed
        });

        // Simulating a delay between shares
        await new Promise((resolve) => setTimeout(resolve, interval * 1000));
    }

    // Returning the response after sharing process
    return {
        success: true,
        process: process.map((p) => ({
            ...p,
            status: "Shared successfully!"
        }))
    };
}

// POST endpoint to handle the sharing request
app.post("/share", async (req, res) => {
    const { cookies, postUrl, amounts, interval } = req.body;

    // Check if required fields are provided
    if (!cookies || !postUrl || !amounts || !interval) {
        return res.status(400).json({ success: false, message: "Missing required parameters." });
    }

    try {
        // Simulate sharing the post
        const result = await sharePost(cookies, postUrl, amounts, interval);
        res.json(result); // Return success response with process details
    } catch (error) {
        console.error("Error during sharing process:", error);
        res.status(500).json({ success: false, message: "An error occurred while processing your request." });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
