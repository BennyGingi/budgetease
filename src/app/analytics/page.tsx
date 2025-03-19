"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { AnalyticsDashboard } from "@/components/analytics/dashboard";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Budget Analytics</h1>
          <Link href="/">
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <AnalyticsDashboard />
      </div>
    </main>
  );
}