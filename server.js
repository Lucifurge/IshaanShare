const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Add CORS middleware
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: 'https://frontend-253d.onrender.com' })); // Allow only the specific frontend origin
app.use(bodyParser.json());
app.use(express.static('public'));  // For serving frontend files

// Cookie storage for validation
let cookiesStorage = [];

// Helper function to validate the cookies
function isValidCookie(cookie) {
    const requiredKeys = ["dbln", "sb", "ps_l", "ps_n", "datr", "locale", "c_user", "wd", "fr", "xs"];
    return requiredKeys.every(key => cookie.hasOwnProperty(key));
}

// Simulate sharing functionality
app.post('/submit', (req, res) => {
    const { serviceType, fbstate, url, amount, interval, cookies } = req.body;

    if (!serviceType || !fbstate || !url || !amount || !interval || !Array.isArray(cookies)) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate cookies
    cookies.forEach(cookie => {
        if (isValidCookie(cookie)) {
            cookiesStorage.push(cookie);
        }
    });

    // Ensure valid range for amount and interval
    if (amount < 1 || amount > 1000000) {
        return res.status(400).json({ error: 'Amount must be between 1 and 1 million' });
    }
    if (interval < 1 || interval > 60) {
        return res.status(400).json({ error: 'Interval must be between 1 and 60' });
    }

    // Simulate sharing action
    setTimeout(() => {
        res.json({ message: `${amount} shares completed in intervals of ${interval} seconds` });
    }, amount * interval * 1000);  // Simulate sharing with delays based on amount and interval
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
