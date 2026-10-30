
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Render assigns the port automatically
const PORT = process.env.PORT || 5000;

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://finance-tracker-eight-beryl.vercel.app",
  "https://finance-tracker-gav8w2xk-fin-track13.vercel.app",
];

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin, such as health checks
      if (!origin) {
        return callback(null, true);
      }

      // Allow the listed frontend origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel preview deployments
      if (/^https:\/\/finance-tracker-[a-z0-9-]+\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS origin:", origin);
      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Parse JSON
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "FinTrack API is running",
    status: "success",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// User routes
app.use("/api/users", require("./routes/userRoutes"));

// Transaction routes
app.use(
  "/api/transactions",
  require("./routes/transactionRoutes")
);

// Budget routes
app.use(
  "/api/budgets",
  require("./routes/budgetRoutes")
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
    path: req.originalUrl,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  res.status(500).json({
    message: "Internal server error",
  });
});

// Start server
async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing from environment variables"
      );
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
