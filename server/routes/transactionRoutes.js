const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

const router = express.Router();

// ==========================================
// TEST TRANSACTION ROUTE
// ==========================================
router.get("/test", (req, res) => {
  res.json({
    message: "Transaction routes are working",
  });
});

// ==========================================
// ADD TRANSACTION
// ==========================================
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      title,
      amount,
      type,
      category,
      date,
    } = req.body;

    if (
      !userId ||
      !title ||
      amount === undefined ||
      !type ||
      !category ||
      !date
    ) {
      return res.status(400).json({
        message: "All transaction fields are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Transaction type must be income or expense",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    const transaction = new Transaction({
      userId,
      title: title.trim(),
      amount: Number(amount),
      type,
      category: category.trim(),
      date,
    });

    await transaction.save();

    res.status(201).json({
      message: "Transaction added successfully",
      transaction,
    });
  } catch (error) {
    console.error("Add transaction error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==========================================
// GET USER TRANSACTIONS
// ==========================================
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const transactions = await Transaction.find({
      userId,
    }).sort({
      date: -1,
      createdAt: -1,
    });

    res.status(200).json({
      transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==========================================
// DELETE TRANSACTION
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid transaction ID",
      });
    }

    const transaction =
      await Transaction.findByIdAndDelete(id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete transaction error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;