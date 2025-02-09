const DEBUG_MODE = process.env.DEBUG_MODE?.toLowerCase() === "true";

// DEBUG - Only shows when DEBUG_MODE is true
function debugLog(...args) {
  if (process.env.DEBUG_MODE === "true") {
    console.log("[DEBUG]", ...args);
  }
}

// INFO - Always shows, for stage progress
function infoLog(...args) {
  console.log(...args); // No prefix, clean output
}

// WARN - Always shows, for non-critical issues
function warnLog(...args) {
  console.warn("[WARN]", ...args);
}

// ERROR - Always shows, for critical issues
function errorLog(...args) {
  console.error("[ERROR]", ...args);
}

// TIMING - Always shows, for performance tracking
function timeLog(stage, duration) {
  console.log(`✓ ${stage} complete (${duration.toFixed(2)} ms)`);
}

module.exports = {
  DEBUG_MODE,
  debugLog,
  infoLog,
  warnLog,
  errorLog,
  timeLog,
};
