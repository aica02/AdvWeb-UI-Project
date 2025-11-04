// Example in /src/App.jsx
import { useState } from "react";
import axios from "axios";
axios.get(`${import.meta.env.VITE_API_URL}/api/auth/login`);

function App() {
  const [message, setMessage] = useState("");

  const getData = async () => {
    const res = await axios.get("http://localhost:5000/api/auth/test");
    setMessage(res.data.message);
  };

  return (
    <div>
      <h1>Vite + React Frontend</h1>
      <button onClick={getData}>Test Backend</button>
      <p>{message}</p>
    </div>
  );
}

export default App;
