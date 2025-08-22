const { GoogleGenerativeAI } = require("@google/generative-ai");
const SafetyIssue = require('../models/reportIssue');
require("dotenv").config();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// AI verification function with multilingual support
async function verifyIssueWithAI(description) {
  try {
    const systemPrompt = `
You are a safety officer AI. Determine if a user report is a valid safety issue.
The text may be in English, Kiswahili, or Sheng.
Answer ONLY "YES" if the report is appropriate, neutral, and does NOT contain offensive language, nonsense, or spam.
Answer "NO" otherwise.
Example of valid Kiswahili report: "Kila kitu iko sawa"
Example of valid Sheng report: "Sasa bro, place iko fresh"
`;

    const userPrompt = `Report: "${description}"`;

    const result = await model.generateContent([systemPrompt, userPrompt]);
    const responseText = result.response.text().trim();

    console.log("Gemini AI raw output:", responseText);

    return responseText.toUpperCase().startsWith("YES");

  } catch (err) {
    console.error("Gemini AI verification error:", err);
    return true; // allow submission if AI fails
  }
}


// Create a safety issue
exports.createSafetyIssue = async (req, res) => {
  try {
    const { description, type } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Description is required." });
    }

    const isValid = await verifyIssueWithAI(description);

    if (!isValid) {
      return res.status(400).json({
        error: "Your report could not be submitted as it contains inappropriate content. Please rephrase politely."
      });
    }

    const issue = new SafetyIssue({
      description,
      type: type || "safety",
      verified: true
    });

    await issue.save();
    res.status(201).json(issue);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all safety issues
exports.getSafetyIssues = async (req, res) => {
  try {
    const issues = await SafetyIssue.find().sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
