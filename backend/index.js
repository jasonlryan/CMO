// backend/index.js

// Load environment variables from .env
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const { server } = require("./api/server.js");
const express = require("express");
const { debugLog } = require("./config/logging");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

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
} catch (error) {
  console.error("❌ Failed to initialize Supabase client:", error);
  process.exit(1);
}

// In development environment, start the server on port
if (process.env.NODE_ENV !== "production") {
  const PORT = 3000; // Always use port 3000
  let serverInstance = null;

  // Function to wait for a specified time
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Function to check if port 3000 is in use and kill the process if needed
  const freeUpPort = async (port) => {
    try {
      console.log(`Checking if port ${port} is in use...`);

      // Command to find process using port 3000
      const findCommand =
        process.platform === "win32"
          ? `netstat -ano | findstr :${port}`
          : `lsof -i :${port} | grep LISTEN`;

      const { stdout } = await execPromise(findCommand);

      if (stdout) {
        console.log(`Port ${port} is in use. Attempting to free it up...`);

        // Extract PID and kill the process
        let pid;
        if (process.platform === "win32") {
          // Windows: PID is the last column
          pid = stdout.trim().split(/\s+/).pop();
        } else {
          // Unix/Mac: PID is the second column
          pid = stdout.trim().split(/\s+/)[1];
        }

        if (pid) {
          console.log(`Killing process with PID: ${pid}`);
          const killCommand =
            process.platform === "win32"
              ? `taskkill /F /PID ${pid}`
              : `kill -9 ${pid}`;

          await execPromise(killCommand);
          console.log(`✓ Successfully freed up port ${port}`);
          await wait(1000); // Wait for the port to be fully released
        }
      } else {
        console.log(`Port ${port} is available.`);
      }
      return true;
    } catch (error) {
      console.error(`Error freeing up port ${port}:`, error);
      return false;
    }
  };

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

      // Always try to free up port 3000 first
      await freeUpPort(port);

      console.log(`Attempting to start server on port ${port}...`);

      // Create new server instance
      serverInstance = server.listen(port, () => {
        console.log("✓ Server startup complete!");
        console.log(`🚀 Server running at http://localhost:${port}`);
        console.log("Ready to accept connections");
      });

      // Handle server errors
      serverInstance.on("error", async (error) => {
        if (error.code === "EADDRINUSE") {
          console.log(
            `⚠️  Port ${port} is still busy after attempt to free it.`
          );
          console.log("Trying again to free up the port...");

          const success = await freeUpPort(port);
          if (success) {
            console.log("Retrying server startup...");
            await wait(1000);
            await startServer(port); // Try again with the same port
          } else {
            console.error(
              `❌ Failed to free up port ${port}. Please check manually.`
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
      console.log("Retrying in 2 seconds...");
      await wait(2000);
      return startServer(port); // Always retry with the same port
    }
  };

  // Start the server
  startServer().catch((error) => {
    console.error("❌ Fatal error starting server:", error);
  });
}

// Export the server as the default export for Vercel
module.exports = server;

// Attach Supabase to the server object for access in other files
server.supabase = supabase;
