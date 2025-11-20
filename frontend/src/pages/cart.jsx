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
    if (img.includes("://")) return img; // full URL
    if (img.startsWith("/uploads/")) return `${API}${img}`;
    if (img.startsWith("uploads/")) return `${API}/${img}`;
    if (img.startsWith("/")) return `${API}${img}`;
    return `${API}/uploads/${img}`;
  };

  // Fetch pending cart from backend
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;

      try {
        const { data } = await axios.get(`${API}/api/cart/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const items = data.books.map(item => ({
          bookId: item.book._id,  
          title: item.book.title,
          author: item.book.author,
          price: item.price,
          quantity: item.quantity,
          image: getImageUrl(item.book.coverImage || item.book.image, `${API}/uploads/default.png`)
        }));

        setCartItems(items);
        // default select all items
        const all = new Set(items.map(i => i.bookId));
        setSelectedIds(all);
        setSelectAll(true);
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
  const item = cartItems.find(i => i.bookId === bookId); 
  if (!item) return;

  const newQty = Math.max(1, item.quantity + change);

  try {
    await axios.patch(`${API}/api/cart/update`, {
      bookId: bookId, 
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
      await axios.delete(`${API}/api/cart/remove/${bookId}`, {
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
    // store selected book ids for checkout
    const arr = Array.from(selectedIds);
    localStorage.setItem('selectedBookIds', JSON.stringify(arr));
    navigate('/payment');
  };

  const toggleSelect = (bookId) => {
    const next = new Set(selectedIds);
    if (next.has(bookId)) next.delete(bookId);
    else next.add(bookId);
    setSelectedIds(next);
    setSelectAll(next.size === cartItems.length && cartItems.length > 0);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      // deselect all
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      const all = new Set(cartItems.map(i => i.bookId));
      setSelectedIds(all);
      setSelectAll(true);
    }
  };

  // Calculate subtotal and total for SELECTED items only
  useEffect(() => {
    const selectedItems = cartItems.filter(item => selectedIds.has(item.bookId));
    const selectedSubtotal = selectedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    setSubtotal(selectedSubtotal);
    setTotal(selectedSubtotal + shipping);
  }, [selectedIds, cartItems, shipping]);

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
                  <article key={item.bookId} className="cart-item">
                    <div style={{display:'flex',alignItems:'center',marginRight:12}}>
                      <input type="checkbox" checked={selectedIds.has(item.bookId)} onChange={()=>toggleSelect(item.bookId)} aria-label={`Select ${item.title} for checkout`} />
                    </div>
                    <div className="item-image">
                      <img src={item.image} alt={`Cover of ${item.title}`} loading="lazy" style={{ maxWidth: '100%', height: 'auto' }} />
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