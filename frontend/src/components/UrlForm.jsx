import { useState } from "react";
import toast from "react-hot-toast";

import { createShortUrl } from "../api/urlApi";
import useAuth from "../hooks/useAuth";
import UrlCard from "./UrlCard";

const UrlForm = ({ onCreated }) => {
  const { user } = useAuth();
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [password, setPassword] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [guestUrls, setGuestUrls] = useState(() => JSON.parse(localStorage.getItem("guest_urls") || "[]"));

  const guestLimitReached = !user && guestUrls.length >= 3;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!originalUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    if (guestLimitReached) {
      toast.error("Create an account to shorten more than 3 links.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        originalUrl,
        customAlias: customAlias.trim() || undefined,
        expiryDate: expiryDate || undefined,
        passwordProtected: Boolean(password.trim()),
        password: password.trim() || undefined,
      };

      const newUrl = await createShortUrl(payload);
      setGeneratedUrl(newUrl);
      onCreated?.(newUrl);

      if (!user) {
        const existingUrls = JSON.parse(localStorage.getItem("guest_urls") || "[]");
        const limitedUrls = [newUrl, ...existingUrls].slice(0, 3);
        localStorage.setItem("guest_urls", JSON.stringify(limitedUrls));
        setGuestUrls(limitedUrls);
      }

      setOriginalUrl("");
      setCustomAlias("");
      setExpiryDate("");
      setPassword("");
      toast.success("Short URL created successfully");
    } catch (error) {
      toast.error(error.userMessage || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl min-w-0">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow)]">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_0.8fr]">
            <input
              type="text"
              placeholder="Paste your long link here..."
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              className="min-w-0 w-full rounded-3xl border border-[var(--border)] bg-[var(--input)] px-5 py-4 text-[var(--page-text)] outline-none transition focus:border-blue-400"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-3xl bg-[var(--accent)] px-8 py-4 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Shortening..." : "Shorten"}
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Custom alias (optional)"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              className="min-w-0 w-full rounded-3xl border border-[var(--border)] bg-[var(--input)] px-5 py-4 text-[var(--page-text)] outline-none transition focus:border-blue-400"
              autoComplete="off"
            />
            <input
              type="date"
              placeholder="Expiry date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="min-w-0 w-full rounded-3xl border border-[var(--border)] bg-[var(--input)] px-5 py-4 text-[var(--page-text)] outline-none transition focus:border-blue-400"
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              type="password"
              placeholder="Password protect link (optional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-w-0 w-full rounded-3xl border border-[var(--border)] bg-[var(--input)] px-5 py-4 text-[var(--page-text)] outline-none transition focus:border-blue-400"
              autoComplete="off"
            />
            <div className="flex items-center rounded-3xl border border-[var(--border)] bg-[var(--input)] px-5 py-4 text-sm text-[var(--muted)]">
              <span className="text-[var(--page-text)]">Guest mode:</span>
              <span className="ml-auto">{guestUrls.length}/3 links used</span>
            </div>
          </div>
        </div>
      </form>

      {generatedUrl && (
        <div className="mt-8">
          <UrlCard url={generatedUrl} />
        </div>
      )}
    </div>
  );
};

export default UrlForm;
