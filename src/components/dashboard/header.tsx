"use client";

import { WalletCards } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SettingsMenu } from "./settings-menu";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <WalletCards className="h-6 w-6" />
          <span className="text-lg font-semibold">BudgetMaster</span>
        </div>
        <div className="flex items-center gap-4">
          <SettingsMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}