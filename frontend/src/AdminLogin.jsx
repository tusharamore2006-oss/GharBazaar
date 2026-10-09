import { useState } from "react";
import "./Login.css";
import "./AdminLogin.css";
import { API_BASE_URL } from "./config";

function AdminLogin({
  onLoginSuccess,
  onBackToCustomerLogin,
  onBrokerLogin,
}) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegistering ? "admin-register" : "admin-login";
      const response = await fetch(
        `${API_BASE_URL}/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(data.message || `Admin request failed (${response.status})`);
        setLoading(false);
        return;
      }

      if (isRegistering) {
        setMessage(data.message || "Admin account created. You can now sign in.");
        setIsRegistering(false);
        setFormData({ email: formData.email, password: "" });
        setLoading(false);
        return;
      }

      // Save login information
      localStorage.setItem(
        "gharbazaar_token",
        data.token
      );

      localStorage.setItem(
        "gharbazaar_user",
        JSON.stringify(data.user)
      );

      setMessage("Admin login successful!");

      // Tell App.jsx that admin login is successful
      if (onLoginSuccess) {
        onLoginSuccess(data);
      }

      setFormData({
        email: "",
        password: "",
      });
    } catch (error) {
      console.log(error);
      setError("Unable to connect to backend server");
    }

    setLoading(false);
  };

  return (
    <div className="login-page admin-login-page">
      <div className="login-card admin-login-card">

        <div className="admin-login-badge">
          🛡️ Admin Portal
        </div>

        <h1>{isRegistering ? "Admin Registration" : "Admin Login"}</h1>

        <p className="login-subtitle">
          {isRegistering
            ? "Create an administrator account"
            : "Restricted access for GharBazaar administrators"}
        </p>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          {isRegistering && (
            <>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name || ""}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </>
          )}

          <label htmlFor="email">
            Admin Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter admin email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Enter admin password"
            value={formData.password}
            onChange={handleChange}
            minLength={isRegistering ? 8 : undefined}
            autoComplete={isRegistering ? "new-password" : "current-password"}
            required
          />

          <button
            className="login-button admin-login-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? (isRegistering ? "Creating account..." : "Signing in...")
              : (isRegistering ? "Create Admin Account" : "Login as Admin")}
          </button>
        </form>

        {message && (
          <p
            style={{
              color: "green",
              marginTop: "15px",
            }}
          >
            {message}
          </p>
        )}

        {error && (
          <p
            style={{
              color: "red",
              marginTop: "15px",
            }}
          >
            {error}
          </p>
        )}

        <p className="register-text admin-register-toggle">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setMessage("");
              setError("");
            }}
          >
            {isRegistering ? "Already have an admin account? Sign in" : "Register as an admin"}
          </button>
        </p>

        <div className="login-role-links">
          <a href="/broker/login" onClick={(event) => { event.preventDefault(); onBrokerLogin?.(); }}>
            Broker / Seller Login
          </a>
        </div>

        <p className="register-text">
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              if (onBackToCustomerLogin) {
                onBackToCustomerLogin();
              }
            }}
          >
            ← Back to Customer Login
          </a>
        </p>

      </div>
    </div>
  );
}

export default AdminLogin;