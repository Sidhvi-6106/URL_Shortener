import { useState } from "react";
import { motion } from "framer-motion";

import UrlForm from "../components/UrlForm";

const features = [
  {
    title: "Fast",
    description: "Shorten links in an instant with enterprise-grade reliability.",
  },
  {
    title: "Secure",
    description: "Protected links, cookie-based auth, and analytics you can trust.",
  },
  {
    title: "Insightful",
    description: "Track every click with country, device, and browser data.",
  },
];

const Home = () => {
  const [previewUrl, setPreviewUrl] = useState(null);

  return (
    <main className="min-h-screen bg-[var(--page-bg)] text-[var(--page-text)]">
      <section className="relative overflow-hidden px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.2fr_0.9fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="min-w-0 space-y-8"
          >
            <span className="inline-flex rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-blue-600 ring-1 ring-blue-500/20">
              Premium link shortening for modern teams
            </span>
            <div className="space-y-6">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[var(--page-text)] sm:text-6xl">
                Shorten your links, broaden your reach.
              </h1>
              <p className="max-w-2xl text-lg text-[var(--muted)] sm:text-xl">
                Nano URL delivers precision analytics, enterprise-grade security, and a modern SaaS experience for links that work harder.
              </p>
            </div>

            <div className="min-w-0 rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow)] sm:p-6">
              <UrlForm onCreated={setPreviewUrl} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--panel-muted)] p-6 transition hover:-translate-y-1"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-lg font-semibold text-blue-600">
                    +
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--page-text)]">{feature.title}</h3>
                  <p className="mt-3 text-sm text-[var(--muted)]">{feature.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="relative min-w-0 overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow)] sm:rounded-[3rem] sm:p-8"
          >
            <div className="relative space-y-6">
              <div className="rounded-[2rem] bg-[var(--panel-muted)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="flex items-center justify-between gap-4 pb-6">
                  <span className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Live Preview</span>
                  <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm text-blue-600">Nano URL</span>
                </div>

                {previewUrl ? (
                  <div className="min-w-0 space-y-4">
                    <div>
                      <p className="text-sm text-[var(--muted)]">Original URL</p>
                      <p className="mt-1 max-w-full overflow-hidden break-all text-sm text-[var(--page-text)]">
                        {previewUrl.originalUrl}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--muted)]">Short URL</p>
                      <a
                        href={previewUrl.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block max-w-full overflow-hidden break-all text-lg font-semibold text-blue-600"
                      >
                        {previewUrl.shortUrl}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="h-3 w-24 rounded-full bg-[var(--border)]" />
                    <div className="h-3 w-full max-w-48 rounded-full bg-[var(--border)]" />
                    <div className="h-3 w-32 rounded-full bg-[var(--border)]" />
                  </div>
                )}
              </div>

              <div className="rounded-[2rem] bg-[var(--panel-muted)] p-6 ring-1 ring-[var(--border)]">
                <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-blue-600">
                    *
                  </span>
                  <span>{previewUrl ? "Your new link is ready to copy, share, and track." : "Analytics pipeline is active across all links."}</span>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-[var(--panel)] p-5">
                    <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">Clicks</p>
                    <p className="mt-3 text-3xl font-semibold text-[var(--page-text)]">{previewUrl?.totalClicks || "2.4K"}</p>
                  </div>
                  <div className="rounded-3xl bg-[var(--panel)] p-5">
                    <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">Secure links</p>
                    <p className="mt-3 text-3xl font-semibold text-[var(--page-text)]">{previewUrl?.passwordProtected ? "On" : "100%"}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Home;
