import { useState } from "react";
import toast from "react-hot-toast";

import api from "../api/axios";
import useAuth from "../hooks/useAuth";

const defaultSettings = {
  theme: "dark",
  notifications: { email: true },
  privacy: { publicProfile: false, shareAnalytics: false },
};

const applyTheme = (theme) => {
  const nextTheme = theme === "light" ? "light" : "dark";
  document.documentElement.classList.toggle("light", nextTheme === "light");
  document.documentElement.classList.toggle("dark", nextTheme === "dark");
  localStorage.setItem("theme", nextTheme);
};

const buildSettingsForm = (user) => {
  const settings = user.settings || defaultSettings;

  return {
    theme: settings.theme || defaultSettings.theme,
    notifications: {
      email: settings.notifications?.email ?? defaultSettings.notifications.email,
    },
    privacy: {
      publicProfile: settings.privacy?.publicProfile ?? defaultSettings.privacy.publicProfile,
      shareAnalytics: settings.privacy?.shareAnalytics ?? defaultSettings.privacy.shareAnalytics,
    },
    customDomains: Array.isArray(user.customDomains) ? user.customDomains.join("\n") : "",
  };
};

const SettingsForm = ({ user, setUser }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(() => buildSettingsForm(user));

  const handleThemeChange = (theme) => {
    setFormData((prev) => ({
      ...prev,
      theme,
    }));

    applyTheme(theme);
    setUser((current) =>
      current
        ? {
            ...current,
            settings: {
              ...current.settings,
              theme,
            },
          }
        : current
    );
  };

  const handleToggle = (section, key) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key],
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        theme: formData.theme,
        notifications: formData.notifications,
        privacy: formData.privacy,
        customDomains: formData.customDomains
          .split("\n")
          .map((domain) => domain.trim())
          .filter(Boolean),
      };

      const res = await api.patch("/auth/profile", payload);

      setUser(res.data.user);
      applyTheme(res.data.user.settings.theme);
      toast.success("Profile settings updated");
    } catch (error) {
      toast.error(error.userMessage || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6 text-[var(--page-text)] shadow-[var(--shadow)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Profile</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--page-text)]">Personalize your workspace</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
              Keep your links polished, control what is public, and manage your custom domains from one premium settings panel.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-500/20 bg-[var(--accent-soft)] px-4 py-3 text-sm text-blue-600">
            <p>Current plan</p>
            <p className="mt-1 text-lg font-semibold capitalize">{user.subscriptionType || "free"}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Workspace</p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--page-text)]">Theme & notifications</h2>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <p className="text-sm text-[var(--muted)]">Appearance</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleThemeChange("dark")}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                    formData.theme === "dark"
                      ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                      : "border border-[var(--border)] bg-[var(--panel-muted)] text-[var(--page-text)]"
                  }`}
                >
                  Dark mode
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange("light")}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                    formData.theme === "light"
                      ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                      : "border border-[var(--border)] bg-[var(--panel-muted)] text-[var(--page-text)]"
                  }`}
                >
                  Light mode
                </button>
              </div>
            </div>

            <label className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-3">
              <div>
                <p className="font-medium text-[var(--page-text)]">Email notifications</p>
                <p className="text-sm text-[var(--muted)]">Receive the updates you need about clicks and account activity.</p>
              </div>
              <input
                type="checkbox"
                checked={formData.notifications.email}
                onChange={() => handleToggle("notifications", "email")}
                className="h-5 w-5 rounded border-[var(--border)] bg-[var(--panel)] accent-blue-600"
              />
            </label>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Privacy</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--page-text)]">Link visibility & analytics</h2>
          </div>

          <div className="mt-6 space-y-4">
            <label className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-3">
              <div>
                <p className="font-medium text-[var(--page-text)]">Public profile</p>
                <p className="text-sm text-[var(--muted)]">Allow your profile information to be visible to other users.</p>
              </div>
              <input
                type="checkbox"
                checked={formData.privacy.publicProfile}
                onChange={() => handleToggle("privacy", "publicProfile")}
                className="h-5 w-5 rounded border-[var(--border)] bg-[var(--panel)] accent-blue-600"
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-3">
              <div>
                <p className="font-medium text-[var(--page-text)]">Share analytics</p>
                <p className="text-sm text-[var(--muted)]">Allow aggregated analytics to be shared for your shortened links.</p>
              </div>
              <input
                type="checkbox"
                checked={formData.privacy.shareAnalytics}
                onChange={() => handleToggle("privacy", "shareAnalytics")}
                className="h-5 w-5 rounded border-[var(--border)] bg-[var(--panel)] accent-blue-600"
              />
            </label>
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Custom domains</p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--page-text)]">Domain facility</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Add one domain per line to prepare branded links for your team or customers.
          </p>
        </div>

        <div className="mt-6">
          <textarea
            value={formData.customDomains}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                customDomains: event.target.value,
              }))
            }
            rows={5}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-[var(--page-text)] outline-none transition focus:border-blue-400"
            placeholder="example.com\nbrand.example"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-2xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </section>
      </div>
  );
};

const ProfileSettings = () => {
  const { user, setUser } = useAuth();

  if (!user) {
    return (
      <main className="px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-8 text-[var(--muted)]">
          Loading profile settings...
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-10 lg:px-10">
      <SettingsForm key={user.id || user.email} user={user} setUser={setUser} />
    </main>
  );
};

export default ProfileSettings;
