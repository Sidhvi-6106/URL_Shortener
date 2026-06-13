import { useState } from "react";
import toast from "react-hot-toast";

const formatDateInput = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const UrlCard = ({ url, onDelete, onUpdate, onVisit }) => {
  const [qrOpen, setQrOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    originalUrl: url.originalUrl || "",
    customAlias: url.customAlias || "",
    expiryDate: formatDateInput(url.expiryDate),
    passwordProtected: Boolean(url.passwordProtected),
    password: "",
  });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const shareLink = async () => {
    if (!navigator.share) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({
        title: "Short URL",
        text: "Check this short URL",
        url: url.shortUrl,
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        toast.error("Share failed");
      }
    }
  };

  const downloadQr = () => {
    if (!url.qrCodeUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = url.qrCodeUrl;
    link.download = `nano-url-${url.shortCode || "qr"}.png`;
    link.click();
  };

  const openEdit = () => {
    setFormData({
      originalUrl: url.originalUrl || "",
      customAlias: url.customAlias || "",
      expiryDate: formatDateInput(url.expiryDate),
      passwordProtected: Boolean(url.passwordProtected),
      password: "",
    });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await onUpdate(url._id, {
        originalUrl: formData.originalUrl,
        customAlias: formData.customAlias || "",
        expiryDate: formData.expiryDate || "",
        passwordProtected: formData.passwordProtected,
        password: formData.passwordProtected ? formData.password : undefined,
      });
      setEditOpen(false);
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(url);
      setDeleteOpen(false);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const qrLink = url.qrCodeUrl || url.qrCode;

  return (
    <>
      <div className="min-w-0 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
              <span className="rounded-full bg-[var(--accent-soft)] px-2 py-1 text-blue-600">
                {url.isExpired ? "Expired" : "Live"}
              </span>
              {url.passwordProtected && (
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-600">Protected</span>
              )}
              {url.customAlias && (
                <span className="max-w-full break-all rounded-full bg-fuchsia-500/10 px-2 py-1 text-fuchsia-700">{url.customAlias}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[var(--muted)]">Original URL</p>
              <p className="max-w-full overflow-hidden break-all text-[var(--page-text)]">{url.originalUrl}</p>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[var(--muted)]">Short URL</p>
              <a href={url.shortUrl} target="_blank" rel="noreferrer" className="block max-w-full overflow-hidden break-all text-blue-600">
                {url.shortUrl}
              </a>
            </div>
          </div>

          <div className="space-y-3 text-sm text-[var(--muted)] sm:text-right">
            <p>
              Total clicks: <span className="text-[var(--page-text)]">{url.totalClicks || 0}</span>
            </p>
            {url.expiryDate && (
              <p>
                Expires: <span className="text-[var(--page-text)]">{new Date(url.expiryDate).toLocaleDateString()}</span>
              </p>
            )}
            {url.createdAt && (
              <p>
                Created: <span className="text-[var(--page-text)]">{new Date(url.createdAt).toLocaleDateString()}</span>
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copyLink}
            className="rounded-2xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-95"
          >
            Copy
          </button>
          <button
            type="button"
            onClick={shareLink}
            className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-2 text-sm text-[var(--page-text)] transition hover:bg-[var(--accent-soft)]"
          >
            Share
          </button>
          <a
            href={url.shortUrl}
            target="_blank"
            rel="noreferrer"
            onClick={onVisit}
            className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-2 text-sm text-[var(--page-text)] transition hover:bg-[var(--accent-soft)]"
          >
            Visit
          </a>
          {qrLink && (
            <button
              type="button"
              onClick={() => setQrOpen((current) => !current)}
              className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-2 text-sm text-[var(--page-text)] transition hover:bg-[var(--accent-soft)]"
            >
              {qrOpen ? "Hide QR" : "Preview QR"}
            </button>
          )}
          {onUpdate && (
            <button
              type="button"
              onClick={openEdit}
              className="rounded-2xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-95"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="rounded-2xl bg-rose-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Delete
            </button>
          )}
        </div>

        {qrOpen && qrLink && (
          <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel-muted)] p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-600">QR preview</p>
                <p className="mt-2 text-sm text-[var(--muted)]">Preview and save the QR image before sharing it.</p>
              </div>
              <button
                type="button"
                onClick={downloadQr}
                className="rounded-2xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-95"
              >
                Save QR
              </button>
            </div>
            <div className="mt-4 flex justify-center">
              <img src={qrLink} alt="QR code preview" className="max-h-64 w-auto rounded-2xl bg-white p-3" />
            </div>
          </div>
        )}
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-4 py-10">
          <div className="w-full max-w-2xl rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Edit link</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--page-text)]">Update your shortened link</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded-full border border-[var(--border)] bg-[var(--panel-muted)] px-3 py-1 text-sm text-[var(--page-text)]"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block text-sm text-[var(--muted)]">
                Destination URL
                <input
                  type="url"
                  value={formData.originalUrl}
                  onChange={(event) => setFormData((prev) => ({ ...prev, originalUrl: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-[var(--page-text)] outline-none focus:border-blue-400"
                />
              </label>

              <label className="block text-sm text-[var(--muted)]">
                Custom alias
                <input
                  type="text"
                  value={formData.customAlias}
                  onChange={(event) => setFormData((prev) => ({ ...prev, customAlias: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-[var(--page-text)] outline-none focus:border-blue-400"
                  placeholder="my-brand-link"
                />
              </label>

              <label className="block text-sm text-[var(--muted)]">
                Expiry date
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(event) => setFormData((prev) => ({ ...prev, expiryDate: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-[var(--page-text)] outline-none focus:border-blue-400"
                />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-[var(--muted)]">
                <div>
                  <p className="font-medium text-[var(--page-text)]">Password protect this link</p>
                  <p className="text-[var(--muted)]">Require a password before the redirect works.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.passwordProtected}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      passwordProtected: event.target.checked,
                    }))
                  }
                  className="h-5 w-5 rounded border-[var(--border)] bg-[var(--panel)]"
                />
              </label>

              {formData.passwordProtected && (
                <label className="block text-sm text-[var(--muted)]">
                  Password
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-[var(--page-text)] outline-none focus:border-blue-400"
                    placeholder="Set a new password"
                  />
                </label>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-2 text-sm text-[var(--page-text)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={saving}
                className="rounded-2xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground)] disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-4 py-10">
          <div className="w-full max-w-md rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-600">Delete link</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--page-text)]">Delete this shortened link?</h2>
            <p className="mt-3 text-sm text-[var(--muted)]">
              This action will remove the link permanently and it will no longer redirect.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-2 text-sm text-[var(--page-text)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-2xl bg-rose-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UrlCard;
