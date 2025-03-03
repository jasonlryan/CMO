const fs = require("fs");
const path = require("path");
const logFile = path.join(__dirname, "test_timings.log");

function logTestResult(testType, result, duration) {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  const timestamp = `${dd}${mm}${yyyy}_${hh}${min}${ss}`;
  const logEntry = `${timestamp} | ${testType} | ${result} | ${duration}ms\n`;
  fs.appendFileSync(logFile, logEntry);
}

module.exports = {
  logTestResult,
};
