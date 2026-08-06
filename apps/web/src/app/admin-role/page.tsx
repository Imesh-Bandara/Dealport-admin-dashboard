"use client";

import { useState } from "react";
import { Pencil, Share2, Eye, EyeOff } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";

export default function AdminRolePage() {
  const { user } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const name = user?.name ?? "Wade Warren";
  const email = user?.email ?? "wade.warren@example.com";
  const [first, ...rest] = name.split(" ");
  const last = rest.join(" ") || "Warren";

  return (
    <AppShell title="Admin role">
      <h1 className="text-base font-semibold text-slate-900">About section</h1>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Profile</h2>
              <div className="flex gap-1">
                <button aria-label="Edit" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600">
                  <Pencil className="h-4 w-4" />
                </button>
                <button aria-label="Share" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-xl font-semibold text-emerald-700">
                {first.charAt(0)}
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{name}</p>
              <p className="text-xs text-slate-400">{email}</p>

              <p className="mt-4 text-xs text-slate-400">Linked with Social media</p>
              <div className="mt-2 flex gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>Google &bull; Linked</span>
                <span>Facebook &bull; Linked</span>
                <span>X</span>
              </div>
              <button className="mt-3 rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                + Social media
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Change Password</h2>
              <a className="text-xs font-medium text-emerald-600 hover:underline" href="#">Need help?</a>
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Current Password</label>
                <div className="relative mt-1">
                  <input
                    type={showCurrent ? "text" : "password"}
                    placeholder="Enter password"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-9 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <a className="mt-1 inline-block text-xs text-emerald-600 hover:underline" href="#">
                  Forgot Current Password? Click here
                </a>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">New Password</label>
                <div className="relative mt-1">
                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="Enter password"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-9 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Re-enter Password</label>
                <div className="relative mt-1">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Enter password"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-9 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
                Save Change
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Profile Update</h2>
            <button className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
              {first.charAt(0)}
            </div>
            <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">
              Upload New
            </button>
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              Delete
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="First Name" defaultValue={first} />
            <Field label="Last Name" defaultValue={last} />
            <Field label="Password" defaultValue="••••••••••" type="password" />
            <Field label="Phone Number" defaultValue="(406) 555-0120" />
            <Field label="E-mail" defaultValue={email} />
            <Field label="Date of Birth" defaultValue="12-January-1999" />
          </div>

          <div className="mt-3">
            <Field label="Location" defaultValue="2972 Westheimer Rd, Santa Ana, Illinois 85486" full />
          </div>
          <div className="mt-3">
            <Field label="Credit Card" defaultValue="843-4359-4444" full />
          </div>

          <div className="mt-3">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Biography</label>
            <textarea
              rows={3}
              placeholder="Enter a biography about you"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900"
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  defaultValue,
  type = "text",
  full = false,
}: {
  label: string;
  defaultValue: string;
  type?: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : undefined}>
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900"
      />
    </div>
  );
}
