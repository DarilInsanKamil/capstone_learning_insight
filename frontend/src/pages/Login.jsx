import { useState } from "react";
import { useAuth } from "../context/useAuth";
import "../style/Login.css";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/authentications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      const token = data?.data?.accessToken;
      const refreshToken = data?.data?.refreshToken;
      const userId = data?.data?.userId;

      if (!token) throw new Error("Token not received");

      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      if (userId) localStorage.setItem("userId", userId);

      login(token);
      window.location.href = "/";
    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-form-container">
          <form onSubmit={handleSubmit} className="login-form">
            <h1>Log In</h1>
            {error && <p className="error">{error}</p>}

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        <div className="login-info-panel">
          <h2>Welcome!</h2>
          <p>Sign in to your account to continue</p>
        </div>
      </div>
    </div>
  );
}