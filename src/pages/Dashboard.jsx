import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // =============================
  // LOAD USER AND TRANSACTIONS
  // =============================

  useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );

    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!currentUser.id) {
      alert("User information is missing. Please login again.");
      localStorage.removeItem("currentUser");
      navigate("/login");
      return;
    }

    setUser(currentUser);

    fetchTransactions(currentUser.id);
  }, [navigate]);

  // =============================
  // FETCH TRANSACTIONS
  // =============================

  const fetchTransactions = async (userId) => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/transactions/${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to load transactions.");
        return;
      }

      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Fetch transactions error:", error);

      alert(
        "Unable to connect to the server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // CALCULATE INCOME
  // =============================

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce(
      (total, item) => total + Number(item.amount),
      0
    );

  // =============================
  // CALCULATE EXPENSES
  // =============================

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce(
      (total, item) => total + Number(item.amount),
      0
    );

  // =============================
  // CALCULATE BALANCE
  // =============================

  const balance = income - expenses;

  // =============================
  // SAVINGS
  // =============================

  const savings = balance;

  // =============================
  // CURRENCY FORMAT
  // =============================

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  // =============================
  // LOGOUT
  // =============================

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  // =============================
  // RECENT TRANSACTIONS
  // =============================

  const recentTransactions = [...transactions]
    .sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    })
    .slice(0, 5);

  return (
    <div className="dashboard">

      {/* =================================
          SIDEBAR
      ================================= */}

      <aside className="sidebar">

        <div className="logo">
          <h2>FinTrack</h2>
          <span>Personal Finance</span>
        </div>

        <nav>

          {/* Dashboard */}

          <a
            href="#"
            className="active"
            onClick={(e) => {
              e.preventDefault();
              navigate("/dashboard");
            }}
          >
            📊 Dashboard
          </a>

          {/* Transactions */}

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/transactions");
            }}
          >
            💳 Transactions
          </a>

          {/* Budgets */}

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/budgets");
            }}
          >
            🎯 Budgets
          </a>

          {/* Reports */}

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/reports");
            }}
          >
            📈 Reports
          </a>

          {/* Settings */}

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/settings");
            }}
          >
            ⚙️ Settings
          </a>

        </nav>

        {/* Logout */}

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </aside>

      {/* =================================
          MAIN CONTENT
      ================================= */}

      <main className="dashboard-main">

        {/* =================================
            HEADER
        ================================= */}

        <div className="dashboard-header">

          <div>

            <h1>Dashboard</h1>

            <p>
              Welcome back{" "}
              <strong>
                {user?.name || "User"}
              </strong>
            </p>

          </div>

          <button
            className="add-transaction-btn"
            onClick={() => navigate("/transactions")}
          >
            + Add Transaction
          </button>

        </div>

        {/* =================================
            SUMMARY CARDS
        ================================= */}

        <div className="summary-grid">

          {/* BALANCE */}

          <div className="summary-card balance-card">

            <div className="card-icon">
              💰
            </div>

            <div>

              <p>Total Balance</p>

              <h2>
                {formatCurrency(balance)}
              </h2>

            </div>

          </div>

          {/* INCOME */}

          <div className="summary-card income-card">

            <div className="card-icon">
              💵
            </div>

            <div>

              <p>Total Income</p>

              <h2>
                {formatCurrency(income)}
              </h2>

            </div>

          </div>

          {/* EXPENSE */}

          <div className="summary-card expense-card">

            <div className="card-icon">
              💸
            </div>

            <div>

              <p>Total Expenses</p>

              <h2>
                {formatCurrency(expenses)}
              </h2>

            </div>

          </div>

          {/* SAVINGS */}

          <div className="summary-card savings-card">

            <div className="card-icon">
              📈
            </div>

            <div>

              <p>Savings</p>

              <h2>
                {formatCurrency(savings)}
              </h2>

            </div>

          </div>

        </div>

        {/* =================================
            CONTENT GRID
        ================================= */}

        <div className="dashboard-content">

          {/* =================================
              RECENT TRANSACTIONS
          ================================= */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <h2>Recent Transactions</h2>

                <p>
                  Your latest financial activity
                </p>

              </div>

              <button
                onClick={() =>
                  navigate("/transactions")
                }
              >
                View All
              </button>

            </div>

            {/* LOADING */}

            {loading ? (

              <div className="empty-state">

                <div className="empty-icon">
                  ⏳
                </div>

                <h3>
                  Loading transactions...
                </h3>

                <p>
                  Please wait while your transactions
                  are loaded.
                </p>

              </div>

            ) : recentTransactions.length === 0 ? (

              /* NO TRANSACTIONS */

              <div className="empty-state">

                <div className="empty-icon">
                  💳
                </div>

                <h3>
                  No transactions yet
                </h3>

                <p>
                  Start tracking your income and
                  expenses.
                </p>

                <button
                  onClick={() =>
                    navigate("/transactions")
                  }
                >
                  Add Transaction
                </button>

              </div>

            ) : (

              /* TRANSACTION LIST */

              <div className="transaction-list">

                {recentTransactions.map(
                  (transaction) => (

                    <div
                      className="transaction-item"
                      key={transaction._id}
                    >

                      <div className="transaction-left">

                        <div
                          className={
                            transaction.type === "income"
                              ? "transaction-icon income"
                              : "transaction-icon expense"
                          }
                        >

                          {transaction.type === "income"
                            ? "↓"
                            : "↑"}

                        </div>

                        <div>

                          <h3>
                            {transaction.title ||
                              "Transaction"}
                          </h3>

                          <p>
                            {transaction.category ||
                              "Other"}
                          </p>

                        </div>

                      </div>

                      <div className="transaction-right">

                        <strong
                          className={
                            transaction.type === "income"
                              ? "income-text"
                              : "expense-text"
                          }
                        >

                          {transaction.type === "income"
                            ? "+"
                            : "-"}

                          {formatCurrency(
                            Number(
                              transaction.amount
                            )
                          )}

                        </strong>

                        <span>
                          {new Date(
                            transaction.date
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          {/* =================================
              MONTHLY BUDGET
          ================================= */}

          <div className="dashboard-card budget-dashboard-card">

            <div className="card-header">

              <div>

                <h2>Monthly Budget</h2>

                <p>
                  Manage your spending limits
                </p>

              </div>

              <button
                onClick={() =>
                  navigate("/budgets")
                }
              >
                Manage
              </button>

            </div>

            <div className="budget-empty">

              <div className="budget-icon">
                🎯
              </div>

              <h3>
                Track your monthly budgets
              </h3>

              <p>
                Set category limits to control
                your spending.
              </p>

              <button
                onClick={() =>
                  navigate("/budgets")
                }
              >
                Set Budget
              </button>

            </div>

          </div>

        </div>

        {/* =================================
            REPORT BANNER
        ================================= */}

        <div className="report-banner">

          <div>

            <h2>
              View Your Financial Reports
            </h2>

            <p>
              Analyze your income, expenses and
              spending categories.
            </p>

          </div>

          <button
            onClick={() =>
              navigate("/reports")
            }
          >
            View Reports →
          </button>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;

