import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import AuthPage from "../pages/authpage";
import Home from "../pages/home";
import BookCard from "../pages/bookCard";
import ViewAll from "../pages/viewall";
import Wishlists from "../pages/wishlist";
import Profile from "../pages/profile"; 
import EditProfile from "../pages/editProfile"; 
import ChangePassword from "../pages/changePassword"; 
import Orders from "../pages/orders"; 

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
    ],
  },
]);

export default router;
