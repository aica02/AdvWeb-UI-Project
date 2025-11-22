import React, { useState, useEffect } from 'react';
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/cart.css';
import Header from './header';
import Footer from './footer';
import InfoBanner from './services';

const API = import.meta.env.VITE_API_URL;

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping] = useState(100);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const getImageUrl = (img, fallback = `${API}/uploads/default.png`) => {
    if (!img) return fallback;
    if (img.startsWith("http")) return img;
    if (img.includes("://")) return img; 
    if (img.startsWith("/uploads/")) return `${API}${img}`;
    if (img.startsWith("uploads/")) return `${API}/${img}`;
    if (img.startsWith("/")) return `${API}${img}`;
    return `${API}/uploads/${img}`;
  };

  // Fetch cart from backend
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;

      try {
        const { data } = await axios.get(`${API}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const items = data.books.map((item, index) => ({
          bookId: item.book.id,
          title: item.book.title,
          author: item.book.author,
          price: Number(item.book.price) || 0,
          quantity: Number(item.quantity) || 1,
          image: getImageUrl(item.book.image, `${API}/uploads/default.png`),
          key: item.book.id || index
        }));

        setCartItems(items);

        const all = new Set(items.map(i => i.bookId));
        setSelectedIds(all);
        setSelectAll(true);

        const totalAmount = data.totalAmount || 0;
        setSubtotal(totalAmount);
        setTotal(totalAmount + shipping);
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };
    fetchCart();
  }, [token, shipping]);

  // Update quantity
  const updateQuantity = async (bookId, change) => {
    const item = cartItems.find(i => i.bookId === bookId); 
    if (!item) return;

    const newQty = Math.max(1, item.quantity + change);

    try {
      await axios.patch(`${API}/api/cart/update`, { bookId, quantity: newQty }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedItems = cartItems.map(i =>
        i.bookId === bookId ? { ...i, quantity: newQty } : i
      );

      setCartItems(updatedItems);
      recalcTotal(updatedItems, selectedIds);
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  // Remove item
  const removeItem = async (bookId) => {
    try {
      await axios.delete(`${API}/api/cart/remove/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedItems = cartItems.filter(item => item.bookId !== bookId);
      setCartItems(updatedItems);

      const updatedSelected = new Set(selectedIds);
      updatedSelected.delete(bookId);
      setSelectedIds(updatedSelected);

      recalcTotal(updatedItems, updatedSelected);
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  // Recalculate subtotal & total
  const recalcTotal = (items, selected) => {
    const selectedItems = items.filter(i => selected.has(i.bookId));
    const newSubtotal = selectedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    setSubtotal(newSubtotal);
    setTotal(newSubtotal + shipping);
  };

  const toggleSelect = (bookId) => {
    const next = new Set(selectedIds);
    if (next.has(bookId)) next.delete(bookId);
    else next.add(bookId);
    setSelectedIds(next);
    setSelectAll(next.size === cartItems.length && cartItems.length > 0);
    recalcTotal(cartItems, next);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
      recalcTotal(cartItems, new Set());
    } else {
      const all = new Set(cartItems.map(i => i.bookId));
      setSelectedIds(all);
      setSelectAll(true);
      recalcTotal(cartItems, all);
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedIds.size === 0) return alert("Please select at least one item.");
    const selectedArray = cartItems.filter(i => selectedIds.has(i.bookId));
    localStorage.setItem('selectedCartItems', JSON.stringify(selectedArray));
    navigate('/payment');
  };

  return (
    <div className="cart-page-wrapper">
      <Header/>
      <div className="cart-page">
        <div className="item-breadcrumb">
          <span className="breadcrumb-home">Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Cart</span>
        </div>

        <div className="cart-container">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
            <h1 className="cart-title">Your Shopping Cart</h1>
            <div className="cart-controls" style={{display:'flex',alignItems:'center',gap:12}}>
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
                <span style={{fontSize:14,color:'#333'}}>Select All</span>
              </label>
              <span style={{color:'#666',fontSize:14}}>{selectedIds.size} selected</span>
            </div>
          </div>

          <div className="cart-content">
            <section className="cart-items-section" aria-label="Shopping cart items">
              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <article key={item.key} className="cart-item">
                    <div style={{display:'flex',alignItems:'center',marginRight:12}}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.bookId)}
                        onChange={() => toggleSelect(item.bookId)}
                        aria-label={`Select ${item.title} for checkout`}
                      />
                    </div>

                    <div className="item-image">
                      <img src={item.image} alt={`Cover of ${item.title}`} loading="lazy" style={{ maxWidth: '100%', height: 'auto' }} />
                    </div>

                    <div className="item-details">
                      <h3 className="item-title">{item.title}</h3>
                      <p className="item-author">{item.author}</p>

                      <div className="quantity-control" role="group" aria-label="Quantity controls">
                        <button className="qty-btn" onClick={() => updateQuantity(item.bookId, -1)} disabled={item.quantity <= 1}>−</button>
                        <span className="qty-display">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.bookId, 1)}>+</button>
                      </div>
                    </div>

                    <div className="item-actions">
                      <button className="delete-btn" onClick={() => removeItem(item.bookId)} aria-label={`Remove ${item.title}`}>
                        <RiDeleteBin6Line />
                      </button>
                      <div className="item-price">₱ {item.price * item.quantity}</div>
                    </div>
                  </article>
                ))
              )}
            </section>

            <aside className="order-summary">
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
                disabled={cartItems.length === 0 || selectedIds.size === 0}
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout
              </button>
            </aside>
          </div>
        </div>
      </div>
      <InfoBanner />
      <Footer />
    </div>
  );
}

export default Cart;
