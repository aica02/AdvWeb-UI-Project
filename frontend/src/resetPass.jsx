import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { token } = useParams(); // get token from URL
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!token) return setMessage("Reset token missing!");
      const { data } = await axios.post(`${API}/api/auth/reset-password/${token}`, { password });
      setMessage(data.message || "Password reset successful!");
      setTimeout(() => navigate("/login"), 3000); // redirect to login
    } catch (err) {
      setMessage(err.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />
        <button type="submit" style={{ width: "100%", padding: 10, background: "black", color: "white", border: "none", cursor: "pointer" }}>
          Reset Password
        </button>
      </form>
      {message && <p style={{ marginTop: 10, color: "green" }}>{message}</p>}
    </div>
  );
}
