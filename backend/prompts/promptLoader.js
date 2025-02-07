const fs = require("fs");
const path = require("path");

// Load the master prompt
const promptPath = path.join(__dirname, "transcriptAnalysis.md");
const ANALYSIS_PROMPT = fs.readFileSync(promptPath, "utf8");

module.exports = { ANALYSIS_PROMPT };
