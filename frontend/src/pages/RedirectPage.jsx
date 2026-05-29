import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const RedirectPage = () => {
  const { shortCode } = useParams();
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  const resolveLink = useCallback(async (providedPassword = "") => {
    setLoading(true);
    setErrorMessage("");

    try {
      const params = new URLSearchParams({ resolve: "1" });

      if (providedPassword) {
        params.set("password", providedPassword);
      }

      const response = await fetch(`/api/url/${shortCode}?${params.toString()}`, {
        credentials: "same-origin",
      });

      const data = await response.json().catch(() => ({}));

      if (data.requiresPassword) {
        setStatus("password");

        if (providedPassword) {
          setErrorMessage(data.message || "Invalid password. Please try again.");
        }

        return;
      }

      if (response.status === 410) {
        setStatus("expired");
        setErrorMessage("This link has expired and is no longer available.");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to open this link right now.");
      }

      if (!data.targetUrl) {
        throw new Error("Redirect target is missing.");
      }

      window.location.assign(data.targetUrl);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error.message || "Unable to open this link right now.");
    } finally {
      setLoading(false);
    }
  }, [shortCode]);

  useEffect(() => {
    Promise.resolve().then(() => resolveLink());
  }, [resolveLink]);

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    const enteredPassword = password.trim();

    if (!enteredPassword) {
      setErrorMessage("Please enter the password to continue.");
      setStatus("password");
      return;
    }

    resolveLink(enteredPassword);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--page-bg)] px-6 py-16 text-[var(--page-text)]">
      <div className="w-full max-w-xl rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-8 shadow-[var(--shadow)]">
        <p className="text-sm uppercase tracking-[0.35em] text-blue-600">
          {status === "password" ? "Secure redirect" : "Nano URL"}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--page-text)]">
          {status === "password" ? "Unlock this link" : "Opening your link"}
        </h1>

        {status === "loading" && (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-5 text-[var(--muted)]">
            Resolving the destination...
          </div>
        )}

        {status === "password" && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-[var(--muted)]">
              This link is password protected. Enter the password to continue to the destination.
            </p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-[var(--page-text)] outline-none transition focus:border-blue-400"
                autoComplete="current-password"
                autoFocus
              />
              {errorMessage && <p className="text-sm text-rose-500">{errorMessage}</p>}
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-95 disabled:opacity-70"
              >
                {loading ? "Checking password..." : "Continue"}
              </button>
            </form>
          </div>
        )}

        {status === "expired" && (
          <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-5 text-rose-100">
            {errorMessage}
          </div>
        )}

        {status === "error" && (
          <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-5 text-rose-100">
            {errorMessage}
          </div>
        )}
      </div>
    </main>
  );
};

export default RedirectPage;
