const express = require("express");
const mongoose = require("mongoose");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

const router = express.Router();

// =============================
// TEST ROUTE
// =============================

router.get("/test", (req, res) => {
  res.json({
    message: "Budget routes are working",
  });
});

// =============================
// ADD / UPDATE BUDGET
// =============================

router.post("/", async (req, res) => {
  try {
    const {
      userId,
      category,
      amount,
      month,
    } = req.body;

    if (
      !userId ||
      !category ||
      amount === undefined ||
      !month
    ) {
      return res.status(400).json({
        message: "All budget fields are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Budget amount must be greater than 0",
      });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        userId,
        category: category.trim(),
        month,
      },
      {
        userId,
        category: category.trim(),
        amount: Number(amount),
        month,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Budget saved successfully",
      budget,
    });
  } catch (error) {
    console.error("Add budget error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// =============================
// GET USER BUDGETS
// =============================

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const budgets = await Budget.find({
      userId,
    }).sort({
      category: 1,
    });

    // Get current month's expenses
    const transactions = await Transaction.find({
      userId,
      type: "expense",
    });

    const budgetData = budgets.map((budget) => {
      const spent = transactions
        .filter(
          (transaction) =>
            transaction.category === budget.category &&
            transaction.date
              .toISOString()
              .substring(0, 7) === budget.month
        )
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0
        );

      const remaining =
        Number(budget.amount) - spent;

      const percentage =
        Number(budget.amount) > 0
          ? Math.round(
              (spent / Number(budget.amount)) * 100
            )
          : 0;

      return {
        ...budget.toObject(),
        spent,
        remaining,
        percentage,
      };
    });

    res.status(200).json({
      budgets: budgetData,
    });
  } catch (error) {
    console.error("Get budgets error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// =============================
// DELETE BUDGET
// =============================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid budget ID",
      });
    }

    const budget = await Budget.findByIdAndDelete(id);

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    res.status(200).json({
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error("Delete budget error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;