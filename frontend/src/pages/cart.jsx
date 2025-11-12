import React, { useState, useEffect } from 'react';
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/cart.css';

const API = import.meta.env.VITE_API_URL;

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping] = useState(100);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch pending cart from backend
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;

      try {
        const { data } = await axios.get(`${API}/cart/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const items = data.books.map(item => ({
          bookId: item.book._id,  // use bookId instead of id
          title: item.book.title,
          author: item.book.author,
          price: item.price,
          quantity: item.quantity,
          image: item.book.image || "http://localhost:5000/uploads/default.png"
        }));

        setCartItems(items);
        setSubtotal(data.totalAmount || 0);
        setTotal((data.totalAmount || 0) + shipping);
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };
    fetchCart();
  }, [token, shipping]);

  // Update quantity in backend
const updateQuantity = async (bookId, change) => {
  const item = cartItems.find(i => i.bookId === bookId); // Fix this if necessary
  if (!item) return;

  const newQty = Math.max(1, item.quantity + change);

  try {
    await axios.patch(`${API}/cart/update`, {
      bookId: bookId,  // Ensure you're passing the correct bookId
      quantity: newQty
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const updatedItems = cartItems.map(i =>
      i.bookId === bookId ? { ...i, quantity: newQty } : i
    );

    const newSubtotal = updatedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    setCartItems(updatedItems);
    setSubtotal(newSubtotal);
    setTotal(newSubtotal + shipping);
  } catch (err) {
    console.error("Error updating quantity:", err);
  }
};


  // Remove item from cart
  const removeItem = async (bookId) => {
    try {
      await axios.delete(`${API}/cart/remove/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedItems = cartItems.filter(item => item.bookId !== bookId);
      const newSubtotal = updatedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

      setCartItems(updatedItems);
      setSubtotal(newSubtotal);
      setTotal(newSubtotal + shipping);
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  // Proceed to checkout
  const handleProceedToCheckout = () => {
    navigate('/payment');
  };

  return (
    <div className="cart-page-wrapper">
      <div className="cart-page">
        <div className="item-breadcrumb">
          <span className="breadcrumb-home">Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Cart</span>
        </div>

        <div className="cart-container">
          <h1 className="cart-title">Your Shopping Cart</h1>
          <div className="cart-content">

            <section className="cart-items-section" aria-label="Shopping cart items">
              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <article key={item.bookId} className="cart-item">
                    <div className="item-image">
                      <img src={item.image} alt={`Cover of ${item.title}`} loading="lazy" />
                    </div>

                    <div className="item-details">
                      <h3 className="item-title">{item.title}</h3>
                      <p className="item-author">{item.author}</p>

                      <div className="quantity-control" role="group" aria-label="Quantity controls">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.bookId, -1)}
                          aria-label="Decrease quantity"
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="qty-display" aria-label={`Quantity: ${item.quantity}`}> {item.quantity} </span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.bookId, 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="item-actions">
                      <button
                        className="delete-btn"
                        onClick={() => removeItem(item.bookId)} // Use bookId
                        aria-label={`Remove ${item.title} from cart`}
                      >
                        <RiDeleteBin6Line />
                      </button>
                      <div className="item-price" aria-label={`Price: ${item.price * item.quantity} pesos`}>
                        ₱ {item.price * item.quantity}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </section>

            <aside className="order-summary" aria-label="Order summary">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">₱ {subtotal}</span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Shipping</span>
                <span className="summary-value">₱ {shipping}</span>
              </div>

              <div className="summary-divider" role="separator"></div>

              <div className="summary-row summary-total">
                <span className="summary-label">Total</span>
                <span className="summary-value">₱ {total}</span>
              </div>

              <button
                className="checkout-btn"
                disabled={cartItems.length === 0}
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout
              </button>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
