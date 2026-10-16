
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS: Origin not allowed"));
    },
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "FinTrack API is running",
    status: "success",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// Existing route files
app.use("/api/users", require("./routes/userRoutes"));
app.use(
  "/api/transactions",
  require("./routes/transactionRoutes")
);
app.use("/api/budgets", require("./routes/budgetRoutes"));

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.message);

  if (err.message === "CORS: Origin not allowed") {
    return res.status(403).json({ message: err.message });
  }

  res.status(500).json({ message: "Internal server error" });
});

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Atlas connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`FinTrack API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
