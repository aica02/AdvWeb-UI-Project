import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/cart/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(data.books || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // Listen for cart updates from other tabs/components
    const handler = () => fetchCart();
    window.addEventListener("cartUpdated", handler);
    return () => window.removeEventListener("cartUpdated", handler);
  }, [token]);

  const value = { cartItems, setCartItems, fetchCart, loading, error };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
