import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function RootLayout() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}