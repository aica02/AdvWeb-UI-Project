import express from "express";
import {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  checkoutCart,
  getPendingOrders,
  getCompletedOrders
} from "../controllers/cartController.js";

import {
  receiveOrder,
  cancelOrder,
  updateOrderStatus,
  getAllOrdersAdmin,
  getAllOrdersUser
} from "../controllers/orderController.js";

import { protect, adminOnly } from "../middleware/authMiddlew.js";

const router = express.Router();


// CART ROUTES
router.post("/add", protect, addToCart);
router.get("/", protect, getCart);
router.patch("/update", protect, updateCart);
router.delete("/remove/:bookId", protect, removeFromCart);
router.post("/checkout", protect, checkoutCart);


// USER ORDER ROUTES
router.get("/orders/pending", protect, getPendingOrders);
router.get("/orders/completed", protect, getCompletedOrders);
router.get("/orders/all", protect, getAllOrdersUser);
router.put("/orders/receive/:orderId", protect, receiveOrder);
router.put("/orders/cancel/:orderId", protect, cancelOrder);



// ADMIN ORDER ROUTES
router.put("/orders/update-status/:orderId", protect, adminOnly, updateOrderStatus);
router.get("/orders/admin/all", protect, adminOnly, getAllOrdersAdmin);


export default router;
