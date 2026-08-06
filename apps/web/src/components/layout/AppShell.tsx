"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar title={title} />
          <main className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-slate-950">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
