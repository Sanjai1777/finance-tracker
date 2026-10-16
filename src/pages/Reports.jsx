import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import "./Reports.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function Reports() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );

    if (!currentUser) {
      navigate("/login");
      return;
    }

    const email = currentUser.email.trim().toLowerCase();

    const key = `transactions_${email}`;

    const savedTransactions = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    setTransactions(savedTransactions);
  }, [navigate]);

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce(
      (total, item) => total + Number(item.amount),
      0
    );

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce(
      (total, item) => total + Number(item.amount),
      0
    );

  const savings = income - expenses;

  // Category expenses
  const categories = {};

  transactions
    .filter((item) => item.type === "expense")
    .forEach((item) => {
      const category = item.category || "Other";

      categories[category] =
        (categories[category] || 0) +
        Number(item.amount);
    });

  const categoryNames = Object.keys(categories);
  const categoryAmounts = Object.values(categories);

  // Income vs Expense chart
  const incomeExpenseData = {
  labels: ["Income", "Expenses"],
  datasets: [
    {
      label: "Amount",
      data: [income, expenses],
      backgroundColor: [
        "rgba(34, 197, 94, 0.75)",
        "rgba(239, 68, 68, 0.75)",
      ],
      borderColor: [
        "rgb(22, 163, 74)",
        "rgb(220, 38, 38)",
      ],
      borderWidth: 2,
      borderRadius: 8,
    },
  ],
};

  // Category chart
  const categoryData = {
  labels: categoryNames,
  datasets: [
    {
      label: "Expenses",
      data: categoryAmounts,
      backgroundColor: [
        "#6366f1",
        "#22c55e",
        "#f59e0b",
        "#ef4444",
        "#06b6d4",
        "#8b5cf6",
        "#ec4899",
      ],
      borderColor: "#ffffff",
      borderWidth: 2,
    },
  ],
};

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <div className="reports-page">

      {/* Header */}
      <div className="reports-header">

        <div>
          <h1>Reports & Analytics</h1>
          <p>
            Analyze your income and spending patterns
          </p>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </div>

      {/* Summary Cards */}
      <div className="report-summary">

        <div className="report-card">
          <h3>Total Income</h3>
          <h2>{formatCurrency(income)}</h2>
        </div>

        <div className="report-card">
          <h3>Total Expenses</h3>
          <h2>{formatCurrency(expenses)}</h2>
        </div>

        <div className="report-card">
          <h3>Total Savings</h3>
          <h2>{formatCurrency(savings)}</h2>
        </div>

      </div>

      {/* Charts */}
      {transactions.length === 0 ? (

        <div className="no-reports">

          <div className="report-icon">
            📊
          </div>

          <h2>No transaction data yet</h2>

          <p>
            Add some income and expense transactions
            to view your reports.
          </p>

          <button
            onClick={() => navigate("/transactions")}
          >
            Add Transaction
          </button>

        </div>

      ) : (

        <div className="charts-container">

          {/* Income Expense */}
          <div className="chart-card">

            <h2>Income vs Expenses</h2>

            <div className="chart-wrapper">
              <Bar
                data={incomeExpenseData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>

          </div>

          {/* Category Expenses */}
          <div className="chart-card">

            <h2>Expenses by Category</h2>

            {categoryNames.length > 0 ? (

              <div className="chart-wrapper">
                <Doughnut
                  data={categoryData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>

            ) : (

              <div className="no-category">
                No expense data available.
              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default Reports;