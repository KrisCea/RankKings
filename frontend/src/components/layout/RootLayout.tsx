import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function RootLayout() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 2xl:max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}