import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Budgets.css";

function Budgets() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );

    if (!currentUser) {
      navigate("/login");
      return;
    }

    setUser(currentUser);

    const email = currentUser.email.trim().toLowerCase();

    const budgetKey = `budgets_${email}`;
    const transactionKey = `transactions_${email}`;

    const savedBudgets = JSON.parse(
      localStorage.getItem(budgetKey) || "[]"
    );

    const savedTransactions = JSON.parse(
      localStorage.getItem(transactionKey) || "[]"
    );

    setBudgets(savedBudgets);
    setTransactions(savedTransactions);
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid budget amount.");
      return;
    }

    const existingBudget = budgets.find(
      (budget) => budget.category === category
    );

    let updatedBudgets;

    if (existingBudget) {
      updatedBudgets = budgets.map((budget) =>
        budget.category === category
          ? {
              ...budget,
              amount: Number(amount),
            }
          : budget
      );
    } else {
      const newBudget = {
        id: Date.now(),
        category: category,
        amount: Number(amount),
      };

      updatedBudgets = [...budgets, newBudget];
    }

    setBudgets(updatedBudgets);

    if (user?.email) {
      const key =
        "budgets_" + user.email.trim().toLowerCase();

      localStorage.setItem(
        key,
        JSON.stringify(updatedBudgets)
      );
    }

    setAmount("");
  };

  const handleDelete = (id) => {
    const updatedBudgets = budgets.filter(
      (budget) => budget.id !== id
    );

    setBudgets(updatedBudgets);

    if (user?.email) {
      const key =
        "budgets_" + user.email.trim().toLowerCase();

      localStorage.setItem(
        key,
        JSON.stringify(updatedBudgets)
      );
    }
  };

  const getSpentAmount = (category) => {
    return transactions
      .filter(
        (transaction) =>
          transaction.type === "expense" &&
          transaction.category === category
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );
  };

  const getPercentage = (budget, spent) => {
    if (budget === 0) {
      return 0;
    }

    return Math.min((spent / budget) * 100, 100);
  };

  return (
    <div className="budgets-page">

      <div className="budgets-header">
        <div>
          <h1>Budgets</h1>
          <p>Manage your monthly spending limits</p>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      <div className="budget-card">

        <h2>Set Monthly Budget</h2>

        <form
          className="budget-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">
            <label>Category</label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >
              <option value="Food">Food</option>
              <option value="Shopping">Shopping</option>
              <option value="Travel">Travel</option>
              <option value="Education">Education</option>
              <option value="Bills">Bills</option>
              <option value="Entertainment">
                Entertainment
              </option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Budget Amount (₹)</label>

            <input
              type="number"
              min="1"
              placeholder="Enter monthly budget"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
            />
          </div>

          <button
            type="submit"
            className="budget-btn"
          >
            + Set Budget
          </button>

        </form>
      </div>

      <div className="budget-card">

        <div className="budget-title">
          <div>
            <h2>Monthly Budgets</h2>

            <p>
              {budgets.length} budget
              {budgets.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {budgets.length === 0 ? (

          <div className="empty-budget">
            <div className="budget-icon">📊</div>

            <h3>No budgets created</h3>

            <p>
              Create a monthly budget to track your
              spending.
            </p>
          </div>

        ) : (

          <div className="budget-list">

            {budgets.map((budget) => {

              const spent = getSpentAmount(
                budget.category
              );

              const remaining =
                Number(budget.amount) - spent;

              const percentage = getPercentage(
                Number(budget.amount),
                spent
              );

              return (
                <div
                  className="budget-item"
                  key={budget.id}
                >

                  <div className="budget-item-top">

                    <div>
                      <h3>{budget.category}</h3>

                      <p>
                        ₹{spent.toLocaleString("en-IN")}
                        {" "}spent of{" "}
                        ₹
                        {Number(
                          budget.amount
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <button
                      className="delete-budget"
                      onClick={() =>
                        handleDelete(budget.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                  <div className="progress-bar">

                    <div
                      className={
                        "progress-fill " +
                        (percentage >= 100
                          ? "danger"
                          : percentage >= 80
                          ? "warning"
                          : "")
                      }
                      style={{
                        width: `${percentage}%`,
                      }}
                    ></div>

                  </div>

                  <div className="budget-bottom">

                    <span>
                      {Math.round(percentage)}% used
                    </span>

                    <span
                      className={
                        remaining < 0
                          ? "over-budget"
                          : "remaining"
                      }
                    >
                      {remaining >= 0
                        ? `₹${remaining.toLocaleString(
                            "en-IN"
                          )} remaining`
                        : `₹${Math.abs(
                            remaining
                          ).toLocaleString(
                            "en-IN"
                          )} over budget`}
                    </span>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </div>
  );
}

export default Budgets;