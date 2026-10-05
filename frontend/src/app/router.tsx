import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Profile from "../pages/Profile/Profile";
import MovieDetail from "../pages/MovieDetail/MovieDetail";
import RootLayout from "../components/layout/RootLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "profile/:username", element: <Profile /> },
      { path: "movie/:id", element: <MovieDetail /> },
    ],
  },
]);