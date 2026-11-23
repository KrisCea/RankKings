import { createElement, lazy, Suspense, type ReactElement } from "react";
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../components/layout/RootLayout";

const createPostPage = lazy(() => import("../pages/CreatePost/CreatePost"));
const homePage = lazy(() => import("../pages/Home/Home"));
const loginPage = lazy(() => import("../pages/Login/Login"));
const registerPage = lazy(() => import("../pages/Register/Register"));
const profilePage = lazy(() => import("../pages/Profile/Profile"));
const postDetailPage = lazy(() => import("../pages/PostPage/PostPage"));
const itemDetailPage = lazy(() => import("../pages/ItemPage/ItemPage"));
const libraryPage = lazy(() => import("../pages/LibraryPage/LibraryPage"));
const verifyEmailPage = lazy(() => import("../pages/VerifyEmailPage/VerifyEmailPage"));
const adminModerationPage = lazy(() => import("../pages/AdminModeration/AdminModeration"));

function lazyPage(page: ReactElement) {
  return (
    <Suspense fallback={<div className="min-h-[40vh]" aria-label="Cargando" />}>
      {page}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: lazyPage(createElement(homePage)) },
      { path: "login", element: lazyPage(createElement(loginPage)) },
      { path: "register", element: lazyPage(createElement(registerPage)) },
      { path: "profile/:username", element: lazyPage(createElement(profilePage)) },
      { path: "post/:id", element: lazyPage(createElement(postDetailPage)) },
      { path: "create-post", element: lazyPage(createElement(createPostPage)) },
      { path: "item/:id", element: lazyPage(createElement(itemDetailPage)) },
      { path: "library", element: lazyPage(createElement(libraryPage)) },
      { path: "verify-email", element: lazyPage(createElement(verifyEmailPage)) },
      { path: "admin/moderation", element: lazyPage(createElement(adminModerationPage)) },
    ],
  },
]);