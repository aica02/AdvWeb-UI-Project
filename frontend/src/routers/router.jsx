import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import AuthPage from "../pages/authpage";
import Home from "../pages/home";
<<<<<<< Updated upstream
import { lazy } from "react";
const Profile = lazy(() => import("../pages/profile"));
const EditProfile = lazy(() => import("../pages/editProfile"));
const ChangePassword = lazy(() => import("../pages/changePassword"));
const Orders = lazy(() => import("../pages/orders"));
const CartPage = lazy(() => import("../pages/Cart"));
const PaymentPage = lazy(() => import("../pages/PaymentPage"));
=======
import BookCard from "../pages/bookCard";
import ViewAll from "../pages/viewall";
import Wishlists from "../pages/wishlist";
import Profile from "../pages/profile"; 
import EditProfile from "../pages/editProfile"; 
import ChangePassword from "../pages/changePassword"; 
import Orders from "../pages/orders"; 
import CartPage from "../pages/Cart";
import PaymentPage from "../pages/PaymentPage";
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
      { path: "/orders", element: <Orders /> },
=======
      { path: "/orders", element: <Orders /> }, 
>>>>>>> Stashed changes
      { path: "/cart", element: <CartPage /> },
      { path: "/payment", element: <PaymentPage /> },
    ],
  },
]);

export default router;