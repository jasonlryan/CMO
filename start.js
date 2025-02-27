// start.js - Entry point for Render deployment
console.log("Starting CMO Assessment Tool API...");

// Load environment variables
require("dotenv").config();

// Import the backend server
const server = require("./backend/index.js");

// The server will start listening on the appropriate port in backend/index.js
// when NODE_ENV is not 'production', or it will export the handler function
// when NODE_ENV is 'production'

// For Render, we need to explicitly start the server
const PORT = process.env.PORT || 3000;
const app = server;

// Start the server
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ ChatGPT endpoint available at /api/chatgpt/assessment`);
});
