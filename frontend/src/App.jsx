import { useState } from "react";
import axios from "axios";
import ForgotPassword from "./forgotPass.jsx";
import ResetPassword from "./resetPass.jsx";

const API = import.meta.env.VITE_API_URL;

function App() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [token, setToken] = useState(""); // For JWT or reset token
  const [message, setMessage] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [page, setPage] = useState("main"); // main, forgot and reset password

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin ? { email: form.email, password: form.password } : form;
      const { data } = await axios.post(`${API}${endpoint}`, payload);
      setMessage(isLogin ? "Logged in successfully!" : "Registered successfully!");
      if (data.token) setToken(data.token);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  // Ensure at least something renders
  const renderMain = page === "main";
  const renderForgot = page === "forgot";
  const renderReset = page === "reset";

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      {renderMain && (
        <>
          <h1>{isLogin ? "Login" : "Register"}</h1>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: 8, marginBottom: 10 }}
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                padding: 10,
                background: "black",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </form>
          <p style={{ marginTop: 10, color: "green" }}>{message}</p>
          {token && (
            <div style={{ marginTop: 10, fontSize: 12 }}>
              <strong>JWT Token:</strong> <br />
              <code>{token}</code>
            </div>
          )}
          {isLogin && (
            <button
              style={{
                marginTop: 10,
                background: "none",
                border: "none",
                color: "#646cff",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={() => setPage("forgot")}
            >
              Forgot Password?
            </button>
          )}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
            style={{
              marginTop: 20,
              background: "transparent",
              border: "1px solid gray",
              padding: 8,
              cursor: "pointer",
            }}
          >
            Switch to {isLogin ? "Register" : "Login"}
          </button>
          <button
            onClick={() => setPage("reset")}
            style={{
              marginTop: 10,
              background: "none",
              border: "none",
              color: "#646cff",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Reset Password (Demo)
          </button>
        </>
      )}

      {renderForgot && (
        <ForgotPassword
          goBack={() => setPage("main")}
        />
      )}

      {renderReset && (
        <ResetPassword
          goBack={() => setPage("main")}
        />
      )}
    </div>
  );
}

export default App;
