import type { RouteObject } from "react-router-dom";
import RootLayout from "../components/layout/RootLayout";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import VerifyEmailPage from "../pages/VerifyEmailPage/VerifyEmailPage";
import Profile from "../pages/Profile/Profile";
import ItemPage from "../pages/ItemPage/ItemPage";
import PostPage from "../pages/PostPage/PostPage";
import LibraryPage from "../pages/LibraryPage/LibraryPage";

// Las rutas viven aparte del router del navegador para poder montarlas también en las pruebas
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "verify-email", element: <VerifyEmailPage /> },
      { path: "profile/:username", element: <Profile /> },
      { path: "item/:id", element: <ItemPage /> },
      { path: "post/:id", element: <PostPage /> },
      { path: "library", element: <LibraryPage /> },
    ],
  },
];