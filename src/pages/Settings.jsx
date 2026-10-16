import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  WalletCards,
  PieChart,
  Settings as SettingsIcon,
  LogOut,
  User,
  Mail,
  Lock,
} from "lucide-react";

import "./Settings.css";

function Settings() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      setUser(JSON.parse(savedUser));
    } catch (error) {
      console.error("User data error:", error);
      navigate("/login");
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div className="settings-page">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="logo-icon">₹</div>

          <div>
            <h2>FinTrack</h2>
            <span>Personal Finance</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <button
            className="nav-item"
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/transactions")}
          >
            <ArrowLeftRight size={19} />
            Transactions
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/budgets")}
          >
            <WalletCards size={19} />
            Budgets
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/reports")}
          >
            <PieChart size={19} />
            Reports
          </button>

          <button className="nav-item active">
            <SettingsIcon size={19} />
            Settings
          </button>

        </nav>

        <button
          className="logout-button"
          onClick={logout}
        >
          <LogOut size={19} />
          Logout
        </button>

      </aside>

      {/* MAIN CONTENT */}
      <main className="settings-main">

        <header className="settings-header">
          <div>
            <h1>Settings</h1>
            <p>Manage your account information.</p>
          </div>
        </header>

        {/* PROFILE */}
        <section className="settings-card">

          <div className="settings-title">
            <User size={22} />

            <div>
              <h2>Profile Information</h2>
              <p>Your registered account details</p>
            </div>
          </div>

          <div className="profile-box">

            <div className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="profile-details">

              <div className="detail-item">
                <User size={18} />
                <div>
                  <span>Name</span>
                  <strong>
                    {user?.name || "User"}
                  </strong>
                </div>
              </div>

              <div className="detail-item">
                <Mail size={18} />
                <div>
                  <span>Email</span>
                  <strong>
                    {user?.email || "Not available"}
                  </strong>
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* PASSWORD */}
        <section className="settings-card">

          <div className="settings-title">
            <Lock size={22} />

            <div>
              <h2>Security</h2>
              <p>Manage your account security</p>
            </div>
          </div>

          <div className="security-info">
            <Lock size={20} />

            <div>
              <strong>Password</strong>
              <p>
                Your password is securely stored in the
                database.
              </p>
            </div>
          </div>

          <button
            className="password-button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >
            {showPassword
              ? "Hide Password Option"
              : "Change Password"}
          </button>

          {showPassword && (
            <div className="password-message">
              Password change functionality can be
              connected to the backend in the next stage.
            </div>
          )}

        </section>

        {/* ACCOUNT */}
        <section className="settings-card account-card">

          <div className="settings-title">
            <LogOut size={22} />

            <div>
              <h2>Account</h2>
              <p>Sign out from your FinTrack account</p>
            </div>
          </div>

          <button
            className="logout-settings-button"
            onClick={logout}
          >
            <LogOut size={18} />
            Logout
          </button>

        </section>

        <footer className="settings-footer">
          FinTrack Personal Finance & Monthly Budget
          Tracker
        </footer>

      </main>
    </div>
  );
}

export default Settings;

