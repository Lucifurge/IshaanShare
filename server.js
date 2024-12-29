import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";  // ES Module import
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Enable CORS for your frontend only
const corsOptions = {
    origin: "https://frontend-253d.onrender.com",  // Replace with your frontend URL
    methods: ["GET", "POST"],  // Allow only GET and POST methods
    allowedHeaders: ["Content-Type"],  // Allow specific headers
};

app.use(cors(corsOptions));  // Apply CORS with the specified options

// Function to simulate sharing a post
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

        try {
            // Simulate the HTTP request to Facebook (replace with actual logic)
            await fetch(postUrl, {
                method: "POST",  // Use the appropriate method for sharing
                headers: {
                    "Content-Type": "application/json",
                    "Cookie": cookieHeader  // Add cookies to the request headers
                },
                body: JSON.stringify({ someData: "value" })  // Example data, modify as needed
            });
        } catch (error) {
            console.error("Error during fetch request:", error);
            return {
                success: false,
                message: "Failed to share post due to an error."
            };
        }

        // Simulating a delay between shares
        await new Promise((resolve) => setTimeout(resolve, interval * 1000));
    }

    // Return the success result after sharing the post
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
        // Call the sharePost function to simulate sharing the post
        const result = await sharePost(cookies, postUrl, amounts, interval);
        res.json(result);  // Return success response with process details
    } catch (error) {
        console.error("Error during sharing process:", error);
        res.status(500).json({ success: false, message: "An error occurred while processing your request." });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
