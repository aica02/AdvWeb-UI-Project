// routers/router.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App.jsx";

// User pages
import Home from "../pages/home.jsx";
import AuthPage from "../pages/authpage.jsx";
import BookCard from "../pages/bookCard.jsx";
import ViewAll from "../pages/viewall.jsx";
import Wishlists from "../pages/wishlist.jsx";
import Profile from "../pages/profile.jsx";
import EditProfile from "../pages/editProfile.jsx";
import ChangePassword from "../pages/changePassword.jsx";
import Orders from "../pages/orders.jsx";
import Cart from "../pages/cart.jsx";
import Payment from "../pages/payment.jsx";

// Admin pages
import ProtectedAdminRoute from "./ProtectedAdminRoute.jsx";
import DashboardSection from "../admin/dashboard.jsx";
import AdminAccount from "../admin/admin.jsx";
import AddBooksSection from "../admin/addBook.jsx";
import EditDeleteBooksSection from "../admin/editDeleteBook.jsx";

// User protection
import { ProtectedUserRoute } from "./ProtectedUserRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Public routes
      { path: "/", element: <Home /> },
      { path: "/auth", element: <AuthPage /> },
      { path: "/bookCard", element: <BookCard /> },
      { path: "/viewAll", element: <ViewAll /> },

      // User protected routes
      {path: "/wishlist",element: (<ProtectedUserRoute> <Wishlists /></ProtectedUserRoute>),},
      {path: "/cart",element: (<ProtectedUserRoute> <Cart /></ProtectedUserRoute>),},
      {path: "/profile",element: (<ProtectedUserRoute><Profile /></ProtectedUserRoute>),},
      {path: "/profile/edit",element: (<ProtectedUserRoute><EditProfile /></ProtectedUserRoute>),},
      {path: "/profile/change-password",element: (<ProtectedUserRoute> <ChangePassword /></ProtectedUserRoute>),},
      {path: "/orders",element: (<ProtectedUserRoute><Orders /></ProtectedUserRoute>),},
      {path: "/payment",element: (<ProtectedUserRoute><Payment /></ProtectedUserRoute>),},

      // Admin Routes
      {
        path: "/admin",
        element: (
          <ProtectedAdminRoute>
            <AdminAccount />
          </ProtectedAdminRoute>
        ),
        children: [
          { path: "dashboard", element: <DashboardSection /> },
          { path: "addbook", element: <AddBooksSection /> },
          { path: "editdeletebook", element: <EditDeleteBooksSection /> },
          { path: "", element: <DashboardSection /> }, // default
        ],
      },

      // Fallback
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default router;
