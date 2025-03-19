"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { BudgetOverview } from "@/components/dashboard/budget-overview";
import { CategoryList } from "@/components/dashboard/category-list";
import { SavingsGoals } from "@/components/dashboard/savings-goals";
import { RecurringExpenses } from "@/components/dashboard/recurring-expenses";
import { BillReminders } from "@/components/dashboard/bill-reminders";
import { BudgetTemplates } from "@/components/dashboard/budget-templates";
import { SmartInsights } from "@/components/dashboard/smart-insights";
import { SharedBudget } from "@/components/dashboard/shared-budget";
import { Button } from "@/components/ui/button";
import { BarChart } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto py-8">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex justify-end">
          <Link href="/analytics">
            <Button>
              <BarChart className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </Link>
        </div>
        <BudgetOverview />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SmartInsights />
          <SharedBudget />
        </div>
        <BudgetTemplates />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RecurringExpenses />
          <BillReminders />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CategoryList />
          <SavingsGoals />
        </div>
      </div>
    </main>
  );
}