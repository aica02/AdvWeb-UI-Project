import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function ForgotPassword({ goBack }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API}/api/auth/forgot-password`, { email });
      setMessage("Check your email for the reset link!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h1>Forgot Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />
        <button type="submit" style={{ width: "100%", padding: 10, background: "black", color: "white", border: "none", cursor: "pointer" }}>
          Send Reset Link
        </button>
      </form>
      {message && <p style={{ marginTop: 10, color: "green" }}>{message}</p>}
      {goBack && (
        <button onClick={goBack} style={{ marginTop: 10 }}>Back</button>
      )}
    </div>
  );
}
