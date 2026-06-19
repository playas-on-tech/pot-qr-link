"use client";

import { useState, useTransition } from "react";
import { claimCard } from "./actions";
import type { Link } from "./actions";

const NETWORKS: { label: string; toUrl: (u: string) => string }[] = [
  { label: "LinkedIn",  toUrl: (u) => `https://linkedin.com/in/${u}` },
  { label: "X",         toUrl: (u) => `https://x.com/${u}` },
  { label: "Instagram", toUrl: (u) => `https://instagram.com/${u}` },
  { label: "GitHub",    toUrl: (u) => `https://github.com/${u}` },
  { label: "Facebook",  toUrl: (u) => `https://facebook.com/${u}` },
  { label: "TikTok",    toUrl: (u) => `https://tiktok.com/@${u}` },
  { label: "YouTube",   toUrl: (u) => `https://youtube.com/@${u}` },
  { label: "Threads",   toUrl: (u) => `https://threads.net/@${u}` },
];

type Defaults = {
  name: string; lastName: string; company: string; jobTitle: string;
  phone: string; email: string; links: Link[];
};

function parseDefaults(defaults: Defaults) {
  const presets: Record<string, string> = {};
  const custom: Link[] = [];
  for (const lk of defaults.links) {
    const net = NETWORKS.find((n) => n.label === lk.label);
    if (net) {
      const base = net.toUrl("");
      presets[lk.label] = lk.url.startsWith(base) ? lk.url.slice(base.length).replace(/^@/, "") : lk.url;
    } else {
      custom.push(lk);
    }
  }
  return { presets, custom };
}

export default function ClaimForm({ id, defaults }: { id: string; defaults: Defaults }) {
  const parsed = parseDefaults(defaults);
  const [presets, setPresets] = useState<Record<string, string>>(parsed.presets);
  const [links, setLinks] = useState<Link[]>(parsed.custom);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleNetwork(label: string) {
    setPresets((p) => {
      const next = { ...p };
      if (label in next) delete next[label];
      else next[label] = "";
      return next;
    });
  }

  function addLink() {
    setLinks((l) => [...l, { label: "", url: "" }]);
  }

  function removeLink(i: number) {
    setLinks((l) => l.filter((_, idx) => idx !== i));
  }

  function updateLink(i: number, field: keyof Link, value: string) {
    setLinks((l) => l.map((lk, idx) => (idx === i ? { ...lk, [field]: value } : lk)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    const allLinks: Link[] = [
      ...Object.entries(presets)
        .filter(([, username]) => username.trim())
        .map(([label, username]) => {
          const net = NETWORKS.find((n) => n.label === label)!;
          return { label, url: net.toUrl(username.trim().replace(/^@/, "")) };
        }),
      ...links.filter((lk) => lk.label && lk.url),
    ];

    allLinks.forEach((lk, i) => {
      fd.set(`link_label_${i}`, lk.label);
      fd.set(`link_url_${i}`, lk.url);
    });

    startTransition(async () => {
      const result = await claimCard(id, fd);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First name *" name="name" required defaultValue={defaults.name} />
        <Field label="Last name *" name="lastName" required defaultValue={defaults.lastName} />
        <Field label="Company" name="company" defaultValue={defaults.company} />
        <Field label="Job title" name="jobTitle" defaultValue={defaults.jobTitle} />
        <Field label="Phone" name="phone" type="tel" defaultValue={defaults.phone} />
        <Field label="Email" name="email" type="email" defaultValue={defaults.email} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Profile photo</label>
        <input
          type="file"
          name="photo"
          accept="image/*"
          className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-400">Optional · max 5 MB</p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Social profiles</p>
        <div className="flex flex-wrap gap-2">
          {NETWORKS.map(({ label }) => {
            const active = label in presets;
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleNetwork(label)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {NETWORKS.filter(({ label }) => label in presets).map(({ label }) => (
          <div key={label} className="flex gap-2 items-center">
            <span className="text-sm font-medium text-gray-600 w-24 shrink-0">{label}</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">@</span>
              <input
                type="text"
                placeholder="username"
                value={presets[label]}
                onChange={(e) => setPresets((p) => ({ ...p, [label]: e.target.value }))}
                className="input w-full pl-7"
                autoFocus
              />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Other links</p>
        {links.map((lk, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              placeholder="Label"
              value={lk.label}
              onChange={(e) => updateLink(i, "label", e.target.value)}
              className="input w-1/3"
            />
            <input
              type="url"
              placeholder="https://..."
              value={lk.url}
              onChange={(e) => updateLink(i, "url", e.target.value)}
              className="input flex-1"
            />
            <button
              type="button"
              onClick={() => removeLink(i)}
              className="text-gray-400 hover:text-red-500 px-1"
              aria-label="Remove link"
            >
              ✕
            </button>
          </div>
        ))}
        <button type="button" onClick={addLink} className="btn-secondary text-sm">
          + Add custom link
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? "Saving…" : "Save my card"}
      </button>
    </form>
  );
}

function Field({ label, name, required, type = "text", defaultValue }: {
  label: string; name: string; required?: boolean; type?: string; defaultValue?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input type={type} name={name} required={required} defaultValue={defaultValue} className="input w-full" />
    </div>
  );
}
