import { useEffect, useMemo, useRef, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import toast from "react-hot-toast";

import { deleteUrl, getUserUrls, updateUrl } from "../api/urlApi";
import UrlCard from "./UrlCard";

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const lastRefreshAt = useRef(0);

  const loadUrls = async () => {
    try {
      const data = await getUserUrls();
      setUrls(data);
      lastRefreshAt.current = Date.now();
    } catch (error) {
      toast.error(error.userMessage || "Failed to load URLs");
    } finally {
      setLoading(false);
    }
  };

  const refreshUrlsFromBackground = async () => {
    if (Date.now() - lastRefreshAt.current < 30000) {
      return;
    }

    try {
      const data = await getUserUrls();
      setUrls(data);
      lastRefreshAt.current = Date.now();
    } catch {
      // Ignore background refresh failures to avoid noisy UI updates.
    }
  };

  useEffect(() => {
    Promise.resolve().then(loadUrls);

    const handleFocus = () => {
      refreshUrlsFromBackground();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshUrlsFromBackground();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const chartData = useMemo(() => {
    const counts = {};

    urls.forEach((url) => {
      (url.clicks || []).forEach((click) => {
        const day = new Date(click.clickedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        counts[day] = (counts[day] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, count]) => ({ date, count }));
  }, [urls]);

  const totalClicks = useMemo(() => urls.reduce((sum, url) => sum + (url.totalClicks || 0), 0), [urls]);
  const totalUrls = urls.length;

  const handleDelete = async (url) => {
    try {
      await deleteUrl(url._id);
      toast.success("Link deleted");
      setUrls((prev) => prev.filter((item) => item._id !== url._id));
    } catch (error) {
      toast.error(error.userMessage || "Failed to delete URL");
      throw error;
    }
  };

  const handleEdit = async (urlId, payload) => {
    try {
      setSaving(true);
      const updated = await updateUrl(urlId, payload);
      setUrls((prev) => prev.map((item) => (item._id === urlId ? updated : item)));
      toast.success("Link updated");
    } catch (error) {
      toast.error(error.userMessage || "Update failed");
      throw error;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="mx-auto max-w-7xl text-[var(--muted)]">Loading dashboard...</p>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-8 shadow-[var(--shadow)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[var(--muted)]">Dashboard</p>
              <h1 className="mt-3 text-4xl font-semibold text-[var(--page-text)]">Analytics Overview</h1>
            </div>
            <div className="rounded-3xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-foreground)]">
              {totalUrls} Short links
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-[var(--panel-muted)] p-6">
              <p className="text-sm text-[var(--muted)]">Total clicks</p>
              <p className="mt-3 text-3xl font-semibold text-[var(--page-text)]">{totalClicks}</p>
            </div>
            <div className="rounded-3xl bg-[var(--panel-muted)] p-6">
              <p className="text-sm text-[var(--muted)]">Active links</p>
              <p className="mt-3 text-3xl font-semibold text-[var(--page-text)]">{totalUrls}</p>
            </div>
            <div className="rounded-3xl bg-[var(--panel-muted)] p-6">
              <p className="text-sm text-[var(--muted)]">Recent update</p>
              <p className="mt-3 text-3xl font-semibold text-[var(--page-text)]">{saving ? "Saving..." : "Ready"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-8 shadow-[var(--shadow)]">
          <p className="text-sm uppercase tracking-[0.35em] text-[var(--muted)]">Click trend</p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--page-text)]">Recent activity</h2>
          <div className="mt-8 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 24, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 16 }} />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ fill: "#3b82f6" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[var(--muted)]">Your latest shortened links are ready to manage.</p>
            <h2 className="text-3xl font-semibold text-[var(--page-text)]">Recent URLs</h2>
          </div>
        </div>

        {urls.length === 0 ? (
          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-8 text-[var(--muted)]">
            No URLs created yet. Shorten a link from the homepage to get started.
          </div>
        ) : (
          <div className="grid gap-6">
            {urls.map((url) => (
              <UrlCard key={url._id} url={url} onUpdate={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
