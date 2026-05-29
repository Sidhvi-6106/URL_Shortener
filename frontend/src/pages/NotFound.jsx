import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--page-bg)] text-[var(--page-text)]">
      <h1 className="text-7xl font-bold">404</h1>

      <p className="mt-4 text-[var(--muted)]">Page not found</p>

      <Link
        to="/"
        className="mt-6 rounded-xl bg-[var(--accent)] px-6 py-3 font-semibold text-[var(--accent-foreground)]"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;