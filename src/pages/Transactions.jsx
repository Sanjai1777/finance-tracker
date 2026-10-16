import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Transactions.css";

function Transactions() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [loading, setLoading] = useState(false);

  // ==========================================
  // LOAD USER AND TRANSACTIONS
  // ==========================================

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
      navigate("/login");
      return;
    }

    setUser(currentUser);

    const today = new Date().toISOString().split("T")[0];
    setDate(today);

    fetchTransactions(currentUser.id);
  }, [navigate]);

  // ==========================================
  // GET TRANSACTIONS
  // ==========================================

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

  // ==========================================
  // ADD TRANSACTION
  // ==========================================

  const handleAddTransaction = async (e) => {
    e.preventDefault();

    if (
      !title.trim() ||
      !amount ||
      Number(amount) <= 0 ||
      !date
    ) {
      alert("Please fill all fields correctly.");
      return;
    }

    if (!user?.id) {
      alert("User not found. Please login again.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/transactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            title: title.trim(),
            amount: Number(amount),
            type: type,
            category: category,
            date: date,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to add transaction.");
        return;
      }

      setTransactions((previousTransactions) => [
        ...previousTransactions,
        data.transaction,
      ]);

      setTitle("");
      setAmount("");
      setType("expense");
      setCategory("Food");

      const today = new Date().toISOString().split("T")[0];
      setDate(today);

      alert("Transaction added successfully.");
    } catch (error) {
      console.error("Add transaction error:", error);

      alert(
        "Unable to connect to the server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DELETE TRANSACTION
  // ==========================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/transactions/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete transaction.");
        return;
      }

      setTransactions((previousTransactions) =>
        previousTransactions.filter(
          (transaction) => transaction._id !== id
        )
      );

      alert("Transaction deleted successfully.");
    } catch (error) {
      console.error("Delete transaction error:", error);

      alert(
        "Unable to connect to the server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const filteredTransactions = transactions
    .filter((transaction) => {
      const searchText = search.toLowerCase();

      const transactionTitle = String(
        transaction.title || ""
      ).toLowerCase();

      const transactionCategory = String(
        transaction.category || "Other"
      ).toLowerCase();

      return (
        transactionTitle.includes(searchText) ||
        transactionCategory.includes(searchText)
      );
    })
    .filter((transaction) => {
      if (filterType === "all") {
        return true;
      }

      return transaction.type === filterType;
    })
    .sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="transactions-page">

      {/* HEADER */}

      <div className="transactions-header">
        <div>
          <h1>Transactions</h1>
          <p>Manage your income and expenses</p>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      {/* ADD TRANSACTION */}

      <div className="transaction-form-card">
        <h2>Add Transaction</h2>

        <form onSubmit={handleAddTransaction}>
          <div className="form-grid">

            {/* TITLE */}

            <div className="form-group">
              <label>Title</label>

              <input
                type="text"
                placeholder="Example: Grocery Shopping"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* AMOUNT */}

            <div className="form-group">
              <label>Amount</label>

              <input
                type="number"
                placeholder="Enter amount"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* TYPE */}

            <div className="form-group">
              <label>Type</label>

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            {/* CATEGORY */}

            <div className="form-group">
              <label>Category</label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Food">Food</option>
                <option value="Shopping">Shopping</option>
                <option value="Travel">Travel</option>
                <option value="Education">Education</option>
                <option value="Bills">Bills</option>
                <option value="Entertainment">
                  Entertainment
                </option>
                <option value="Salary">Salary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* DATE */}

            <div className="form-group">
              <label>Date</label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <button
            className="add-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Please wait..." : "+ Add Transaction"}
          </button>
        </form>
      </div>

      {/* TRANSACTION HISTORY */}

      <div className="transactions-card">

        <div className="transactions-card-header">

          <div>
            <h2>Transaction History</h2>

            <p>
              {transactions.length} transaction
              {transactions.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* FILTERS */}

          <div className="filters">

            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>

          </div>
        </div>

        {/* LOADING */}

        {loading && transactions.length === 0 ? (

          <div className="empty-transactions">
            <div className="empty-icon">⏳</div>

            <h3>Loading transactions...</h3>

            <p>
              Please wait while your transactions are loaded.
            </p>
          </div>

        ) : filteredTransactions.length === 0 ? (

          /* EMPTY */

          <div className="empty-transactions">
            <div className="empty-icon">💳</div>

            <h3>No transactions found</h3>

            <p>
              Add a transaction or change your search filter.
            </p>
          </div>

        ) : (

          /* TRANSACTION TABLE */

          <div className="transaction-table">

            <div className="table-header">
              <span>Transaction</span>
              <span>Category</span>
              <span>Date</span>
              <span>Amount</span>
              <span>Action</span>
            </div>

            {filteredTransactions.map((transaction) => (

              <div
                className="table-row"
                key={transaction._id}
              >

                {/* TRANSACTION */}

                <div className="transaction-name">

                  <div
                    className={
                      transaction.type === "income"
                        ? "transaction-circle income"
                        : "transaction-circle expense"
                    }
                  >
                    {transaction.type === "income"
                      ? "↓"
                      : "↑"}
                  </div>

                  <div>
                    <strong>
                      {transaction.title || "Transaction"}
                    </strong>

                    <small>
                      {transaction.type === "income"
                        ? "Income"
                        : "Expense"}
                    </small>
                  </div>

                </div>

                {/* CATEGORY */}

                <span>
                  {transaction.category || "Other"}
                </span>

                {/* DATE */}

                <span>
                  {new Date(
                    transaction.date
                  ).toLocaleDateString("en-IN")}
                </span>

                {/* AMOUNT */}

                <strong
                  className={
                    transaction.type === "income"
                      ? "amount-income"
                      : "amount-expense"
                  }
                >
                  {transaction.type === "income"
                    ? "+"
                    : "-"}

                  ₹
                  {Number(
                    transaction.amount
                  ).toLocaleString("en-IN")}
                </strong>

                {/* DELETE */}

                <button
                  className="delete-btn"
                  onClick={() =>
                    handleDelete(transaction._id)
                  }
                >
                  Delete
                </button>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Transactions;

