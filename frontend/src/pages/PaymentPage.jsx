import React, { useState } from 'react';
import { IoCashOutline } from "react-icons/io5";
import { FaCreditCard } from "react-icons/fa";
import { BsBank } from "react-icons/bs";
import Header from './header';
import Footer from './footer';
import InfoBanner from './services';
import '../css/PaymentPage.css';

function PaymentPage() {
  const [cartItems, setCartItems] = useState([
    { id: 1, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", price: 342, quantity: 1, image: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=200&h=280&fit=crop"},
    { id: 2, title: "Harry Potter and the Goblet of Fire", author: "J.K. Rowling", price: 395, quantity: 1, image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=280&fit=crop"}
  ]);

  const [user] = useState({
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '09123456789',
    province: 'Metro Manila',
    city: 'Quezon City',
    barangay: 'San Isidro',
    street: '123 Mabini Street',
    postalCode: '38102'
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  const [couponCode, setCouponCode] = useState('');
  const shipping = 100;
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal + shipping;

  const handleCheckout = () => alert('Proceeding to checkout...');
  const handleCardChange = (e) => setCardInfo({ ...cardInfo, [e.target.name]: e.target.value });
  const handleApplyCoupon = () => alert(`Applying coupon: ${couponCode}`);
  const handleEditShipping = () => alert('Edit shipping information');

  const shippingFields = [
    { label: 'First Name', value: user.firstName },
    { label: 'Last Name', value: user.lastName },
    { label: 'Phone Number', value: user.phoneNumber },
    { label: 'Province', value: user.province },
    { label: 'City/Municipality', value: user.city },
    { label: 'Barangay', value: user.barangay },
    { label: 'Street', value: user.street },
    { label: 'Postal Code', value: user.postalCode }
  ];

  const paymentMethods = [
    { id: 'card', icon: <FaCreditCard />, label: 'Card' },
    { id: 'bank', icon: <BsBank />, label: 'Bank' },
    { id: 'cod', icon: <IoCashOutline />, label: 'Cash On Delivery' }
  ];

  return (
    <>
<<<<<<< Updated upstream
    <Header/>
        {/* ✅ Scoped wrapper */}
        <div className="payment-page">
            <div className="content-wrapper">
                <div className="left-section">
                    {/* Shipping Details */}
                    <section className="shipping-section">
              <h1 className="section-title">Shipping Details</h1>
              
              <div className="info-container">
                <div className="info-header">Information</div>
                
=======
    {/* ✅ Scoped wrapper */}
    <div className="payment-page">
        {/* Breadcrumb */}
        <div className="item-breadcrumb">
            <span className="breadcrumb-home">Home</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-Cart">Cart</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Shipping Details</span>
        </div>

        <div className="content-wrapper">
            <div className="left-section">
                {/* Shipping Details */}
                <section className="shipping-section">
            <h1 className="section-title">Shipping Details</h1>
              
            <div className="info-container">
                <div className="info-header">
                    Information
                </div>
>>>>>>> Stashed changes
                <div className="info-content">
                  {shippingFields.map((field, idx) => (
                    <div key={idx} className="info-item">
                      <span className="info-label">{field.label}</span>
                      <span className="info-value">{field.value}</span>
                    </div>
                  ))}
                </div>

                <div className="info-actions">
<<<<<<< Updated upstream
                  <button onClick={handleEditShipping} className="edit-button">
                    Edit
                  </button>
                </div>
              </div>
=======
                    <button onClick={handleEditShipping} className="edit-button">
                        Edit
                    </button>
                </div>
            </div>
>>>>>>> Stashed changes
            </section>

            {/* Payment Method */}
            <section className="payment-section">
              <h2 className="payment-title">
                Payment Method <span className="required">*</span>
              </h2>
              
              <div className="payment-methods">
                {paymentMethods.map(method => (
                  <button 
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`payment-method ${paymentMethod === method.id ? 'active' : ''}`}
                  >
                    <span className="payment-icon">{method.icon}</span>
                    <span>{method.label}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === 'card' && (
                <div className="card-form">
                  <label className="form-field">
                    <span className="form-label">
                      Card Number <span className="required">*</span>
                    </span>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="Enter here..."
                      value={cardInfo.cardNumber}
                      onChange={handleCardChange}
                      maxLength="19"
                      className="form-input"
                    />
                  </label>
                  
                  <div className="form-row">
                    <label className="form-field">
                      <span className="form-label">Expiry <span className="required">*</span></span>
                      <input
                        type="text"
                        name="expiry"
                        placeholder="MM / YY"
                        value={cardInfo.expiry}
                        onChange={handleCardChange}
                        maxLength="7"
                        className="form-input"
                      />
                    </label>
                    
                    <label className="form-field">
                      <span className="form-label">CVC <span className="required">*</span></span>
                      <input
                        type="text"
                        name="cvc"
                        placeholder="CVC"
                        value={cardInfo.cvc}
                        onChange={handleCardChange}
                        maxLength="4"
                        className="form-input"
                      />
                    </label>
                  </div>

                  <p className="form-disclaimer">
                    By providing your card information, you allow Logo Here to charge your 
                    card for future payments in accordance with their terms.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Order Summary */}
          <aside className="order-summary">
            <h2 className="summary-title">Order Summary</h2>
            
            {cartItems.map(item => (
              <article key={item.id} className="cart-item">
                <img src={item.image} alt={item.title} className="item-image" />
                <div className="item-details">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-author">{item.author}</p>
                  <p className="item-quantity">Quantity: {item.quantity}</p>
                  <p className="item-price">₱{item.price * item.quantity}</p>
                </div>
              </article>
            ))}

            <div className="coupon-section">
              <input
                type="text"
                placeholder="Coupon Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="coupon-input"
              />
              <button onClick={handleApplyCoupon} className="coupon-button">Apply</button>
            </div>

            <div className="pricing-details">
              <div className="pricing-row">
                <span className="pricing-label">Subtotal</span>
                <span className="pricing-value">₱ {subtotal}</span>
              </div>
              <div className="pricing-row">
                <span className="pricing-label">Shipping</span>
                <span className="pricing-value">₱ {shipping}</span>
              </div>
              <hr className="pricing-divider" />
              <div className="pricing-row total">
                <span className="pricing-label">Total</span>
                <span className="pricing-value">₱ {total}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className={`checkout-button ${cartItems.length === 0 ? 'disabled' : ''}`}
            >
              Place Order
            </button>
          </aside>
        </div>
      </div>

<<<<<<< Updated upstream
      <InfoBanner/>
      <Footer/>
=======
>>>>>>> Stashed changes
    </>
  );
}

export default PaymentPage;
