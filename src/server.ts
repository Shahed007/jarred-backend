import { Server as HTTPServer } from "http";
import app, { corsOptions } from "./app";

import config from "./config";

let server: HTTPServer;

// Main function to start the server
async function main() {
  try {
    server = app.listen(config.port, () => {
      console.log("Server is running on port", config.port);
    });
  } catch (error) {
    console.log(error);
  }
}

// Start the server
main();

process.on("unhandledRejection", (err) => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`, err);
  shutdown();
});

process.on("uncaughtException", (err) => {
  console.log(`😈 uncaughtException is detected , shutting down ...`, err);
  shutdown();
});

async function shutdown() {
  // Clean up socket connections
  if (server) {
    server.close(() => {
      console.log("Server closed");
      process.exit(1); // Exit with error code since shutdown was triggered by an error
    });
  } else {
    process.exit(1);
  }
}
