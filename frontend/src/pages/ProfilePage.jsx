import { useState } from "react";
import toast from "react-hot-toast";

import api from "../api/axios";
import useAuth from "../hooks/useAuth";

const buildProfileForm = (user) => ({
  username: user.username || "",
  email: user.email || "",
  fullName: user.fullName || "",
  jobTitle: user.jobTitle || "",
  company: user.company || "",
  location: user.location || "",
  website: user.website || "",
  phone: user.phone || "",
  bio: user.bio || "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const ProfileForm = ({ user, setUser }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(() => buildProfileForm(user));

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const payload = {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        jobTitle: formData.jobTitle,
        company: formData.company,
        location: formData.location,
        website: formData.website,
        phone: formData.phone,
        bio: formData.bio,
        currentPassword: formData.currentPassword || undefined,
        newPassword: formData.newPassword || undefined,
        confirmPassword: formData.confirmPassword || undefined,
      };

      const res = await api.patch("/auth/profile", payload);
      setUser(res.data.user);
      setFormData((current) => ({
        ...current,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.userMessage || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-[var(--muted)]">
          Username
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-[var(--page-text)] outline-none transition focus:border-blue-400"
          />
        </label>

        <label className="text-sm text-[var(--muted)]">
          Email
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-[var(--page-text)] outline-none transition focus:border-blue-400"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-[var(--muted)]">
          Full name
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            maxLength={80}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-[var(--page-text)] outline-none transition focus:border-blue-400"
            placeholder="Your public display name"
          />
        </label>

        <label className="text-sm text-[var(--muted)]">
          Job title
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            maxLength={80}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-[var(--page-text)] outline-none transition focus:border-blue-400"
            placeholder="Founder, marketer, developer..."
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-[var(--muted)]">
          Company
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            maxLength={100}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-[var(--page-text)] outline-none transition focus:border-blue-400"
            placeholder="Organization or brand"
          />
        </label>

        <label className="text-sm text-[var(--muted)]">
          Location
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            maxLength={120}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-[var(--page-text)] outline-none transition focus:border-blue-400"
            placeholder="City, country"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-[var(--muted)]">
          Website
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            maxLength={200}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-[var(--page-text)] outline-none transition focus:border-blue-400"
            placeholder="https://example.com"
          />
        </label>

        <label className="text-sm text-[var(--muted)]">
          Phone
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            maxLength={30}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-[var(--page-text)] outline-none transition focus:border-blue-400"
            placeholder="+1 555 0100"
          />
        </label>
      </div>

      <label className="text-sm text-[var(--muted)]">
        Bio
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          maxLength={500}
          rows={4}
          className="mt-2 w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-[var(--page-text)] outline-none transition focus:border-blue-400"
          placeholder="A short profile description for your workspace and public profile."
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm text-[var(--muted)]">
          Current password
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-[var(--page-text)] outline-none transition focus:border-blue-400"
            placeholder="Required only for password changes"
          />
        </label>

        <label className="text-sm text-[var(--muted)]">
          New password
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-[var(--page-text)] outline-none transition focus:border-blue-400"
            placeholder="Minimum 6 characters"
          />
        </label>

        <label className="text-sm text-[var(--muted)]">
          Confirm password
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-[var(--page-text)] outline-none transition focus:border-blue-400"
            placeholder="Confirm new password"
          />
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
};

const ProfilePage = () => {
  const { user, setUser } = useAuth();

  if (!user) {
    return (
      <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-8 text-[var(--muted)]">
        Loading profile...
      </div>
    );
  }

  return (
    <main className="px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
          <p className="text-sm uppercase tracking-[0.35em] text-blue-600">Profile</p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[var(--page-text)]">Account details</h1>
              <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
                Manage your identity, professional details, password, and contact information from one profile panel.
              </p>
            </div>
            <div className="rounded-2xl border border-blue-500/20 bg-[var(--accent-soft)] px-4 py-3 text-sm text-blue-600">
              <p>Plan</p>
              <p className="mt-1 text-lg font-semibold capitalize">{user.subscriptionType || "free"}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6">
          <ProfileForm key={user.id || user.email} user={user} setUser={setUser} />
        </section>
      </div>
    </main>
  );
};

export default ProfilePage;
