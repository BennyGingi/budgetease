"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingDown, TrendingUp, RefreshCw } from "lucide-react";
import { useBudget } from "@/lib/budget-context";
import { format } from "date-fns";

export function SmartInsights() {
  const { insights, generateInsights } = useBudget();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    generateInsights();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "saving":
        return <TrendingDown className="h-5 w-5 text-green-500" />;
      case "spending":
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Budget Insights</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Insights
        </Button>
      </div>

      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4" />
            <p>No insights available yet. Keep using your budget to generate personalized recommendations.</p>
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className="flex items-start gap-4 p-4 border rounded-lg"
            >
              {getInsightIcon(insight.type)}
              <div className="flex-1">
                <p className="text-sm mb-1">{insight.message}</p>
                {insight.potentialSavings && (
                  <p className="text-sm text-green-500 font-medium">
                    Potential savings: ${insight.potentialSavings.toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(insight.timestamp), "PPp")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}