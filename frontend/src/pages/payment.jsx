import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoCashOutline } from "react-icons/io5";
import { FaCreditCard } from "react-icons/fa";
import { BsBank } from "react-icons/bs";
import "../css/PaymentPage.css";
import { useNavigate } from "react-router-dom";
import Header from './header';
import Footer from './footer';
import InfoBanner from './services';

const API = import.meta.env.VITE_API_URL;

function Payment() {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardInfo, setCardInfo] = useState({ cardNumber: "", expiry: "", cvc: "" });
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const shipping = 100;

  //  Fetch user info
  const fetchUser = async () => {
    try {
      const { data } = await axios.get(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data.user);
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    }
  };
  //  Fetch cart info (Pending cart from database)
  const fetchCart = async () => {
    try {
      const localSelected = localStorage.getItem('selectedCartItems');
      if (localSelected) {
        const items = JSON.parse(localSelected);
        setCartItems(items);
        setLoading(false);
        return;
      }
      const res = await axios.get(`${API}/api/cart/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = res.data.books || [];
      const mapped = raw.map(b => ({
        id: b.book?._id || b.bookId || b._id,
        title: b.book?.title || b.title || "",
        author: b.book?.author || b.author || "",
        price: b.price || (b.book?.newPrice ?? b.book?.oldPrice) || 0,
        quantity: b.quantity || 1,
        image: b.book?.coverImage || b.book?.image || null
      }));
      setCartItems(mapped);
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchUser();
    fetchCart();
  }, [token]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = Math.max(subtotal + shipping - discount, 0);
  const formatCurrency = (n) => n.toFixed(2);

  // Card Validation
  const validateCard = () => {
    const { cardNumber, expiry, cvc } = cardInfo;
    const cardRegex = /^\d{16}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvcRegex = /^\d{3,4}$/;

    if (!cardRegex.test(cardNumber.replace(/\s+/g, ""))) {
      setErrorMessage("Invalid card number. Must be 16 digits.");
      return false;
    }
    if (!expiryRegex.test(expiry)) {
      setErrorMessage("Invalid expiry date. Format MM/YY.");
      return false;
    }
    if (!cvcRegex.test(cvc)) {
      setErrorMessage("Invalid CVC. Must be 3 or 4 digits.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  // Shipping completeness check
  const shippingFields = user
    ? [
        user.firstName,
        user.lastName,
        user.phone,
        user.province,
        user.city,
        user.barangay,
        user.street,
        user.postalCode,
      ]
    : [];

  const isShippingComplete = shippingFields.every((f) => f && f.trim() !== "");

  // Edit Info redirect
  const handleEditShipping = () => {
    window.location.href = "http://localhost:5173/profile/edit";
  };

  // Apply Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await axios.post(
        `${API}/apply-coupon`,
        { code: couponCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setDiscount(res.data.discount);
        alert(`Coupon applied! Discount: ₱${res.data.discount}`);
      } else {
        setDiscount(0);
        alert("Invalid coupon code.");
      }
    } catch (err) {
      console.error("Error applying coupon:", err);
      alert("Failed to apply coupon.");
    }
  };


  const handleCheckout = async () => {
    if (!paymentMethod) return alert("Select a payment method");

    if (paymentMethod === "card" && !validateCard()) {
      return;
    }

    if (!isShippingComplete) {
      return alert("Please complete your shipping details.");
    }

    try {
      const selectedBookIds = JSON.parse(localStorage.getItem("selectedBookIds"));
      if (!selectedBookIds || selectedBookIds.length === 0) {
        alert("No items selected for checkout.");
        return;
      }

      const checkoutData = {
        paymentMethod,
        status: "Pending",
        selectedBookIds,
      };

      if (paymentMethod === "card") {
        checkoutData.cardInfo = cardInfo;
      }

      const { data } = await axios.post(
        `${API}/api/cart/checkout`,
        checkoutData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.message || data.order) {
        alert(`Order placed successfully! Your order ID: ${data.order?._id || "N/A"}`);
        localStorage.removeItem("selectedBookIds");
        localStorage.removeItem("selectedCartItems");
        window.dispatchEvent(new Event("cartUpdated"));
        navigate("/orders");
      } else {
        alert("Failed to place order. Try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert(err.response?.data?.message || "Checkout failed");
    }
  };



  const paymentMethods = [
    { id: "card", icon: <FaCreditCard />, label: "Card" },
    { id: "bank", icon: <BsBank />, label: "Bank" },
    { id: "cod", icon: <IoCashOutline />, label: "Cash On Delivery" },
  ];



  return (
    <> 
    <Header/>
    
    <div className="payment-page">
      <div className="content-wrapper">
        {/* LEFT SIDE */}
        <div className="left-section">
          <section className="shipping-section">
            <h1 className="section-title">Shipping Details</h1>

            {user ? (
              <div className="info-container">
                <div className="info-header">Information</div>
                <div className="info-content">
                  {[{ label: "First Name", value: user.firstName },
                    { label: "Last Name", value: user.lastName },
                    { label: "Phone", value: user.phone },
                    { label: "Province", value: user.province },
                    { label: "City/Municipality", value: user.city },
                    { label: "Barangay", value: user.barangay },
                    { label: "Street", value: user.street },
                    { label: "Postal Code", value: user.postalCode },
                  ].map((f, i) => (
                    <div key={i} className="info-item">
                      <span className="info-label">{f.label}</span>
                      <span className="info-value">{f.value}</span>
                    </div>
                  ))}
                </div>
                <div className="info-actions">
                  <button onClick={handleEditShipping} className="edit-button">
                    Edit
                  </button>
                </div>
              </div>
            ) : (
              <p>Please log in to view your shipping information.</p>
            )}
          </section>

          {/* PAYMENT METHOD */}
          <section className="payment-section">
            <h2 className="payment-title">
              Payment Method <span className="required">*</span>
            </h2>
            <div className="payment-methods">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`payment-method ${paymentMethod === method.id ? "active" : ""}`}
                >
                  <span className="payment-icon">{method.icon}</span>
                  <span>{method.label}</span>
                </button>
              ))}
            </div>

            {paymentMethod === "card" && (
              <div className="card-form">
                {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
                <label className="form-field">
                  <span className="form-label">
                    Card Number <span className="required">*</span>
                  </span>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="Enter here..."
                    value={cardInfo.cardNumber}
                    onChange={(e) => setCardInfo({ ...cardInfo, cardNumber: e.target.value })}
                    maxLength="19"
                    className="form-input"
                  />
                </label>
                <div className="form-row">
                  <label className="form-field">
                    <span className="form-label">
                      Expiry <span className="required">*</span>
                    </span>
                    <input
                      type="text"
                      name="expiry"
                      placeholder="MM / YY"
                      value={cardInfo.expiry}
                      onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                      maxLength="7"
                      className="form-input"
                    />
                  </label>
                  <label className="form-field">
                    <span className="form-label">
                      CVC <span className="required">*</span>
                    </span>
                    <input
                      type="text"
                      name="cvc"
                      placeholder="CVC"
                      value={cardInfo.cvc}
                      onChange={(e) => setCardInfo({ ...cardInfo, cvc: e.target.value })}
                      maxLength="4"
                      className="form-input"
                    />
                  </label>
                </div>
                <p className="form-disclaimer">
                  By providing your card information, you allow this store to charge your card for future payments.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT SIDE */}
        <aside className="order-summary">
          <h2 className="summary-title">Order Summary</h2>
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <article key={item.id} className="cart-item">
                
                <div className="item-details">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-author">{item.author}</p>
                  <p className="item-quantity">Quantity: {item.quantity}</p>
                  <p className="item-price">₱{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </article>
            ))
          )}

          <div className="coupon-section">
            <input
              type="text"
              placeholder="Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="coupon-input"
            />
            <button onClick={handleApplyCoupon} className="coupon-button">
              Apply
            </button>
          </div>

          <div className="pricing-details">
            <div className="pricing-row">
              <span className="pricing-label">Subtotal</span>
              <span className="pricing-value">₱ {formatCurrency(subtotal)}</span>
            </div>
            <div className="pricing-row">
              <span className="pricing-label">Shipping</span>
              <span className="pricing-value">₱ {formatCurrency(shipping)}</span>
            </div>
            {discount > 0 && (
              <div className="pricing-row">
                <span className="pricing-label">Discount</span>
                <span className="pricing-value">-₱ {formatCurrency(discount)}</span>
              </div>
            )}
            <hr className="pricing-divider" />
            <div className="pricing-row total">
              <span className="pricing-label">Total</span>
              <span className="pricing-value">₱ {formatCurrency(total)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cartItems.length === 0 || !isShippingComplete}
            className={`checkout-button ${cartItems.length === 0 || !isShippingComplete ? "disabled" : ""}`}
          >
            Place Order
          </button>
        </aside>
      </div>
    </div>
    <InfoBanner/>
    <Footer/>
    </>
  );
}

export default Payment;
