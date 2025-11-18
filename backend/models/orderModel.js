import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  books: [
    {
      book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true },
      title: String,
      author: String,
      image: String,
    },
  ],
  shippingInfo: {
    firstName: String,
    lastName: String,
    phone: String,
    province: String,
    city: String,
    barangay: String,
    street: String,
    postalCode: String,
  },
  paymentMethod: { type: String, default: "Card" },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: "Pending", enum: ["Pending", "Complete", "Cancelled"] },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;