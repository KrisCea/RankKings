import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Profile from "../pages/Profile/Profile";
import MovieDetail from "../pages/MovieDetail/MovieDetail";
import PostPage from "../pages/PostPage/PostPage";
import RootLayout from "../components/layout/RootLayout";
import ItemPage from "../pages/ItemPage/ItemPage";
import LibraryPage from "../pages/LibraryPage/LibraryPage";
import VerifyEmailPage from "../pages/VerifyEmailPage/VerifyEmailPage";

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
      { path: "post/:id", element: <PostPage /> },
      { path: "item/:id", element: <ItemPage /> },
      { path: "library", element: <LibraryPage /> },
      { path: "verify-email", element: <VerifyEmailPage /> },
    ],
  },
]);