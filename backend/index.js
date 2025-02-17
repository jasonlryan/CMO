// backend/index.js

// Load environment variables from .env
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const { server } = require("./api/server.js");
const express = require("express");
const { debugLog } = require("./config/logging");

console.log("Starting CMO Assessment Tool backend...");

// List of required environment variables
const requiredEnvVars = [
  "OPENAI_API_KEY",
  "SUPABASE_PROJECT_URL",
  "SUPABASE_ANON_KEY",
];

// Check for missing variables and throw an error if any are missing
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  console.error("❌ Environment validation failed!");
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}`
  );
}
console.log("✓ Environment variables validated");

// Initialize the Supabase client
let supabase;
try {
  supabase = createClient(
    process.env.SUPABASE_PROJECT_URL,
    process.env.SUPABASE_ANON_KEY
  );
  console.log("✓ Supabase client initialized");
  module.exports = { supabase };
} catch (error) {
  console.error("❌ Failed to initialize Supabase client:", error);
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
let serverInstance = null;

// Function to wait for a specified time
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Improved error handling for port conflicts
const startServer = async (port = PORT) => {
  try {
    // If there's an existing server, close it properly first
    if (serverInstance) {
      console.log("Closing existing server instance...");
      await new Promise((resolve) => {
        serverInstance.close(() => {
          console.log("Existing server closed");
          resolve();
        });
      });
      serverInstance = null;
    }

    console.log(`Attempting to start server on port ${port}...`);

    // Create new server instance
    serverInstance = server.listen(port, () => {
      console.log("✓ Server startup complete!");
      console.log(`🚀 Server running at http://localhost:${port}`);
      console.log("Ready to accept connections");
      retryCount = 0; // Reset retry count on successful start
    });

    // Handle server errors
    serverInstance.on("error", async (error) => {
      if (error.code === "EADDRINUSE") {
        console.log(`⚠️  Port ${port} is busy.`);

        if (retryCount < MAX_RETRIES) {
          retryCount++;
          const nextPort = port + 1;
          console.log(
            `Attempting retry ${retryCount} of ${MAX_RETRIES} on port ${nextPort}...`
          );
          await wait(RETRY_DELAY);
          await startServer(nextPort);
        } else {
          console.error(
            `❌ Failed to start server after ${MAX_RETRIES} retries`
          );
        }
      } else {
        console.error("❌ Server error:", error);
      }
    });

    // Handle process termination
    const cleanup = async () => {
      if (serverInstance) {
        console.log("Shutting down server...");
        await new Promise((resolve) => {
          serverInstance.close(() => {
            console.log("✓ Server closed");
            resolve();
          });
        });
        process.exit(0);
      }
    };

    // Handle various termination signals
    process.on("SIGTERM", cleanup);
    process.on("SIGINT", cleanup);
    process.on("SIGHUP", cleanup);

    // Handle uncaught exceptions without crashing
    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught Exception:", error);
      // Log error but don't exit
    });

    // Handle unhandled promise rejections without crashing
    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
      // Log error but don't exit
    });

    return serverInstance;
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Attempting retry ${retryCount} of ${MAX_RETRIES}...`);
      await wait(RETRY_DELAY);
      return startServer(port);
    }
  }
};

// Start the server
startServer().catch((error) => {
  console.error("❌ Fatal error starting server:", error);
});
