"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar title={title} onMenuClick={() => setMobileNavOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
