const SafetyIssue = require('../models/reportIssue');

const fetch = require('node-fetch');

async function verifyIssueWithAI(description) {
    try {
        const apiKey = process.env.GEMINI_API_KEY; // ensure this is set in .env
        const url = 'https://gemini.googleapis.com/v1/models/gemini-flash:predict';

        const body = {
            instances: [
                {
                    content: `Please check if this report is a valid safety issue and does NOT contain offensive language or nonsense: "${description}". Respond with "VALID" if ok, "INVALID" if inappropriate.`
                }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        // Example: checking the AI output
        const aiOutput = data.predictions?.[0]?.content || '';

        // Return true if AI says "VALID", false if "INVALID"
        return aiOutput.toUpperCase().includes('VALID');

    } catch (err) {
        console.error('Gemini AI verification error:', err);
        // Default to false if AI fails
        return false;
    }
}


// Create a safety issue
exports.createSafetyIssue = async (req, res) => {
    try {
        const { userId, description, type } = req.body;

        if (!description || !userId) {
            return res.status(400).json({ error: 'User ID and description are required.' });
        }

        // AI verification
        const isValid = await verifyIssueWithAI(description);

        if (!isValid) {
            return res.status(400).json({ 
                error: 'Your report could not be submitted as it contains inappropriate content. Please rephrase politely.' 
            });
        }

        const issue = new SafetyIssue({
            userId,
            description,
            type,
            verified: true
        });

        await issue.save();

        res.status(201).json(issue);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all safety issues (admin or for logs)
exports.getSafetyIssues = async (req, res) => {
    try {
        const issues = await SafetyIssue.find()
            .populate('userId', 'name email') // optional: include user info
            .sort({ createdAt: -1 });

        res.status(200).json(issues);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
