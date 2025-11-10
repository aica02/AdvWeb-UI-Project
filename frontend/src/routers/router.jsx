import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import AuthPage from "../pages/authpage";
import Home from "../pages/home";
import { lazy } from "react";
const Profile = lazy(() => import("../pages/profile"));
const EditProfile = lazy(() => import("../pages/editProfile"));
const ChangePassword = lazy(() => import("../pages/changePassword"));
const Orders = lazy(() => import("../pages/orders"));
const CartPage = lazy(() => import("../pages/Cart"));
const PaymentPage = lazy(() => import("../pages/PaymentPage"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/auth", element: <AuthPage /> },
      { path: "/profile", element: <Profile /> },
      { path: "/profile/edit", element: <EditProfile /> },
      { path: "/profile/change-password", element: <ChangePassword /> },
      { path: "/orders", element: <Orders /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/payment", element: <PaymentPage /> },
    ],
  },
]);

export default router;