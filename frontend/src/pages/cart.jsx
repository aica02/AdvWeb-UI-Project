import React, { useState, useEffect } from 'react';
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import '../css/cart.css';

function Cart() {
  const [cartItems, setCartItems] = useState([
    { id: 1, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", price: 342, quantity: 1, image: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=200&h=280&fit=crop" },
    { id: 2, title: "Harry Potter and the Goblet of Fire", author: "J.K. Rowling", price: 395, quantity: 1, image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=280&fit=crop" }
  ]);

  const [subtotal, setSubtotal] = useState(0);
  const [shipping] = useState(100);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const sub = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setSubtotal(sub);
    setTotal(sub + shipping);
  }, [cartItems, shipping]);

  const updateQuantity = (id, change) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

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

        {/* Cart Container */}
        <div className="cart-container">
          <h1 className="cart-title">Your Shopping Cart</h1>
          <div className="cart-content">

            {/* Cart Items */}
            <section className="cart-items-section" aria-label="Shopping cart items">
              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <article key={item.id} className="cart-item">
                    <div className="item-image">
                      <img src={item.image} alt={`Cover of ${item.title}`} loading="lazy" />
                    </div>

                    <div className="item-details">
                      <h3 className="item-title">{item.title}</h3>
                      <p className="item-author">{item.author}</p>

                      <div className="quantity-control" role="group" aria-label="Quantity controls">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="qty-display" aria-label={`Quantity: ${item.quantity}`}> {item.quantity} </span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="item-actions">
                      <button
                        className="delete-btn"
                        onClick={() => removeItem(item.id)}
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

            {/* Order Summary */}
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