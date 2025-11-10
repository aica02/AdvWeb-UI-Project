import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import AuthPage from "../pages/authpage";
import Home from "../pages/home";
import BookCard from "../pages/bookCard";
import ViewAll from "../pages/viewall";
import Wishlists from "../pages/wishlist";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
        { path: "/", element: <Home/> },
        { path: "/auth", element: <AuthPage/>},
        { path: "/bookCard", element: <BookCard/>},
        { path: "/viewAll", element: <ViewAll/>},
        { path: "/wishlist", element: <Wishlists/>}
    ]
  },
]);

export default router;