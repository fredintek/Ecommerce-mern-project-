const app = require("./app");
const dotenv = require("dotenv");

// import DB
const connectDB = require("./db/Database");

// config settings
dotenv.config({ path: "backend/config/.env" });

// connect Database
connectDB();

// handling uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Shutting down server for ${err.message}`);
  console.log(`Shutting down server due to uncaught exception`);
});

// create server
const port = process.env.PORT || 8000;
const server = app.listen(process.env.PORT, () => {
  console.log(`server running on port ${port}`);
});

// unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Shutting down server for ${err.message}`);
  console.log(`Shutting down server due to unhandled promise rejection`);
  server.close(() => process.exit(1));
});
