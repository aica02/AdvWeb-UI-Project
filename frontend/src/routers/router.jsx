import {createBrowserRouter} from "react-router-dom";
import App from "../App";
import AuthPage from "../pages/authpage";
import Home from "../pages/home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    children: [
        { path: "/", element: <Home/> },
        { path: "/auth", element: <AuthPage/>}
    ]
  },
]);

export default router;