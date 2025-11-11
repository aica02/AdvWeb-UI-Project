import { createBrowserRouter } from "react-router-dom";
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

// Admin
import ProtectedAdminRoute from "./ProtectedAdminRoute.jsx";
import DashboardSection from "../admin/dashboard.jsx";
import AdminAccount from "../admin/admin.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/auth", element: <AuthPage /> },
      { path: "/bookCard", element: <BookCard /> },
      { path: "/viewAll", element: <ViewAll /> },
      { path: "/wishlist", element: <Wishlists /> },
      { path: "/profile", element: <Profile /> },
      { path: "/profile/edit", element: <EditProfile /> },
      { path: "/profile/change-password", element: <ChangePassword /> },
      { path: "/orders", element: <Orders /> },

      // Admin Routes
      {
        path: "/admin/dashboard",
        element: (
          <ProtectedAdminRoute>
            <DashboardSection />
          </ProtectedAdminRoute>
        ),
      },
      {
        path: "/admin",
        element: (
          <ProtectedAdminRoute>
            <AdminAccount />
          </ProtectedAdminRoute>
        ),
      },
    ],
  },
]);

export default router;
