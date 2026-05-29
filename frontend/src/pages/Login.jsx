import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";
import useAuth from "../hooks/useAuth";

const benefits = [
  "Realtime click insights",
  "Password-protected links",
  "Guest mode and fast auth",
];

const Login = () => {
  const navigate = useNavigate();
  const { loginSuccess } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", formData);
      await loginSuccess(res.data.user);
      toast.success("Logged in successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.userMessage || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--page-bg)] px-6 py-16 text-[var(--page-text)] lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_40%)]" />
      <div className="mx-auto grid max-w-7xl items-stretch gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col justify-center rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-8 backdrop-blur"
        >
          <span className="inline-flex w-fit rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-blue-600 ring-1 ring-blue-500/20">
            Welcome back to Nano URL
          </span>
          <div className="mt-7 space-y-5">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Sign in to your dashboard and keep every campaign in sync.
            </h1>
            <p className="max-w-2xl text-lg text-[var(--muted)]">
              Review clicks, manage protected links, and keep your short links polished with the same premium experience as your homepage.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {benefits.map((item) => (
              <div key={item} className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-5 text-sm text-[var(--page-text)] shadow-[0_18px_60px_-45px_rgba(56,189,248,0.9)]">
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-8 shadow-[var(--shadow)] backdrop-blur"
        >
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--muted)]">Login</p>
            <h2 className="text-3xl font-semibold text-[var(--page-text)]">Access your links</h2>
            <p className="text-sm text-[var(--muted)]">
              Use your credentials to open your dashboard and keep insights fresh.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
              className="w-full rounded-[1.4rem] border border-[var(--border)] bg-[var(--input)] px-5 py-4 text-[var(--page-text)] outline-none transition focus:border-blue-400"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              className="w-full rounded-[1.4rem] border border-[var(--border)] bg-[var(--input)] px-5 py-4 text-[var(--page-text)] outline-none transition focus:border-blue-400"
            />

            <button
              disabled={loading}
              className="w-full rounded-[1.4rem] bg-[var(--accent)] px-5 py-4 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-4 text-sm text-[var(--muted)]">
            New here? <Link to="/signup" className="font-semibold text-blue-600">Create an account</Link> to unlock dashboard analytics and custom branding.
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Login;
