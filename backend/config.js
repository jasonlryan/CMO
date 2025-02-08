// Debug configuration
const DEBUG_MODE = process.env.DEBUG_MODE === "true";

// Helper for debug logging
function debugLog(...args) {
  if (DEBUG_MODE) {
    console.log(...args);
  }
}

module.exports = { DEBUG_MODE, debugLog };
