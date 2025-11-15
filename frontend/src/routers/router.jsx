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

import AddBooksSection from "../admin/addBook.jsx";
import EditDeleteBooksSection from "../admin/editDeleteBook.jsx";
import UserAccounts from "../admin/userAccounts.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // User pages
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
    { path: "", element: <DashboardSection /> }, // default
  ],
}


    ],
  },
]);


export default router;
