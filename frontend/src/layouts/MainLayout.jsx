import { useEffect } from "react";

import Navbar from "../components/Navbar";
import useAuth from "../hooks/useAuth";

const MainLayout = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    const theme = user?.settings?.theme || localStorage.getItem("theme") || "dark";
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [user]);

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--page-text)]">
      <Navbar />
      {children}
    </div>
  );
};

export default MainLayout;