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

import BestSellingBooks from "../pages/bestselling.jsx";
import NewReleaseBooks from "../pages/newrelease.jsx";
import BookSales from "../pages/bookSales.jsx";
// Admin
import ProtectedAdminRoute from "./ProtectedAdminRoute.jsx";
import DashboardSection from "../admin/dashboard.jsx";
import AdminAccount from "../admin/admin.jsx";

import AddBooksSection from "../admin/addBook.jsx";
import EditDeleteBooksSection from "../admin/editDeleteBook.jsx";
import UserAccounts from "../admin/userAccounts.jsx";
import AdminOrders from "../admin/adminOrders.jsx";
import AdminLogs from "../admin/adminLogs.jsx";
import { ProtectedUserRoute } from "./ProtectedUserRoute.jsx";
import Header from "../pages/header.jsx";
import Footer from "../pages/footer.jsx";
import InfoBanner from "../pages/services.jsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Public routes
      { path: "/", element: <Home/> },
      { path: "/auth", element: <AuthPage /> },
      { path: "/bookCard/:id", element: <BookCard /> },
      { path: "/viewAll", element: <ViewAll /> },
      { path: "/bestSelling", element: <BestSellingBooks /> },
      { path: "/newReleases", element: <NewReleaseBooks /> },
      { path: "/bookSales", element: <BookSales />},
      { path: "/header", element: <Header />},
      { path: "/footer", element: <Footer />},
      { path: "/services", element: <InfoBanner />},
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
          { path: "useraccountsdelete", element: <UserAccounts /> },
          { path: "orders", element: <AdminOrders /> },
          { path: "logs", element: <AdminLogs /> },
          { path: "", element: <DashboardSection /> }, // default
        ],
      },

      // Fallback
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);



export default router;