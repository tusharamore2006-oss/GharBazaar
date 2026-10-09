import { useState } from "react";
import "./Login.css";
import { API_BASE_URL } from "./config";

function Login({
  onLoginSuccess,
  onAdminLogin,
  onBrokerLogin,
  onCustomerLogin,
  onRegister,
  loginType = "customer",
}) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const response = await fetch(
        `${API_BASE_URL}/auth/${loginType === "broker" ? "broker-login" : "login"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
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

      setMessage("Login successful!");

      // Tell App.jsx that login is successful
      if (onLoginSuccess) {
        onLoginSuccess(data);
      }

      setFormData({
        email: "",
        password: "",
      });

    } catch (error) {
      console.log(error);
      setError(
        "Unable to connect to backend server"
      );
    }

    setLoading(false);
  };
  

  return (
    <div className={`login-page ${loginType === "broker" ? "broker-login-page" : ""}`}>
      <div className="login-card">

        <h1>{loginType === "broker" ? "Broker Login" : "Customer Login"}</h1>

        <p className="login-subtitle">
          {loginType === "broker"
            ? "Sign in to your Broker/Seller account"
            : "Login to your GharBazaar customer account"}
        </p>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : (loginType === "broker" ? "Login as Broker" : "Login as Customer")}
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

        <p className="register-text">
          Don't have an account?{" "}
          <a
            href={loginType === "broker" ? "/broker/register" : "/register"}
            onClick={(event) => {
              event.preventDefault();
              onRegister?.();
            }}
          >
            {loginType === "broker" ? "Register as a Broker / Seller" : "Register"}
          </a>
        </p>

        <div className="login-role-links" aria-label="Choose login type">
          {loginType === "broker" ? (
            <a href="/login" onClick={(event) => { event.preventDefault(); onCustomerLogin?.(); }}>
              Customer Login
            </a>
          ) : (
            <a href="/broker/login" onClick={(event) => { event.preventDefault(); onBrokerLogin?.(); }}>
              Broker / Seller Login
            </a>
          )}
          <a href="/admin/login" onClick={(event) => { event.preventDefault(); onAdminLogin?.(); }}>
            Admin Login
          </a>
        </div>

      </div>
    </div>
  );
}

export default Login;
