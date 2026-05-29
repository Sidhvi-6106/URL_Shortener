import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

const navLinkClass =
  "rounded-full border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-2 text-sm font-semibold text-[var(--page-text)] transition hover:border-blue-400 hover:bg-[var(--accent-soft)] hover:text-blue-600";
const authLinkClass =
  "rounded-full border border-[var(--border)] bg-[var(--panel-muted)] px-5 py-2 text-sm font-semibold text-[var(--page-text)] transition hover:border-blue-400 hover:bg-[var(--accent-soft)] hover:text-blue-600";
const primaryActionClass =
  "rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-95";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out");
      navigate("/");
    } catch (error) {
      toast.error(error.userMessage || "Logout failed");
    }
  };

  return (
    <nav className="sticky top-0 z-30 w-full border-b border-[var(--border)] bg-[var(--panel)]/95 text-[var(--page-text)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-6 py-4 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <Link to="/" className="flex w-fit items-center gap-3 text-xl font-bold tracking-tight text-[var(--page-text)]">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-black text-[var(--accent-foreground)] shadow-[0_12px_40px_rgba(59,130,246,0.28)]">
            N
          </span>
          <span>Nano URL</span>
        </Link>

        <div className="hidden items-center justify-center gap-3 lg:flex">
          <Link to="/" className={navLinkClass}>
            Home
          </Link>
          {user && (
            <>
              <Link to="/dashboard" className={navLinkClass}>
                Dashboard
              </Link>
              <Link to="/profile" className={navLinkClass}>
                Profile
              </Link>
              <Link to="/settings" className={navLinkClass}>
                Settings
              </Link>
            </>
          )}
        </div>

        <div className="hidden items-center justify-end gap-4 lg:flex">
          {!user ? (
            <>
              <Link className={authLinkClass} to="/login">
                Login
              </Link>
              <Link className={primaryActionClass} to="/signup">
                Signup
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-[var(--muted)]">{user.username}</p>
              <button type="button" onClick={handleLogout} className={authLinkClass}>
                Logout
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-[var(--border)] px-3 text-sm font-semibold text-[var(--page-text)] transition hover:border-blue-400 lg:hidden"
        >
          <span className="sr-only">Toggle menu</span>
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--panel)] px-6 py-5 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            <Link to="/" onClick={() => setMenuOpen(false)} className={navLinkClass}>
              Home
            </Link>
            {user && (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className={navLinkClass}>
                  Dashboard
                </Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className={navLinkClass}>
                  Profile
                </Link>
                <Link to="/settings" onClick={() => setMenuOpen(false)} className={navLinkClass}>
                  Settings
                </Link>
              </>
            )}
            {!user ? (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className={authLinkClass}>
                  Login
                </Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className={primaryActionClass}>
                  Signup
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className={authLinkClass}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
