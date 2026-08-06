"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StatCard, SplitStatCard } from "@/components/dashboard/StatCard";
import { ReportChart } from "@/components/dashboard/ReportChart";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { TopProductsWidget } from "@/components/dashboard/TopProductsWidget";
import { BestSellingWidget } from "@/components/dashboard/BestSellingWidget";
import { UsersInsightWidget } from "@/components/dashboard/UsersInsightWidget";
import { AddNewProductWidget } from "@/components/dashboard/AddNewProductWidget";

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <StatCard
          title="Total Sales"
          period="Last 7 days"
          value="$350K"
          changeLabel="+10.4%"
          changeDirection="up"
          footnote="Previous 7days ($235)"
        />
        <StatCard
          title="Total Orders"
          period="Last 7 days"
          value="10.7K"
          changeLabel="+14.4%"
          changeDirection="up"
          footnote="Previous 7days (7.6k)"
        />
        <SplitStatCard
          title="Pending & Canceled"
          period="Last 7 days"
          pendingValue="509"
          pendingSubLabel="user 204"
          canceledValue="94"
          canceledChangeLabel="14.4%"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ReportChart />
        </div>
        <UsersInsightWidget />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TransactionTable />
        </div>
        <TopProductsWidget />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BestSellingWidget />
        </div>
        <AddNewProductWidget />
      </div>
    </AppShell>
  );
}
