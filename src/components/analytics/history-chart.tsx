"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useBudget } from "@/lib/budget-context";
import { format } from "date-fns";

export function HistoryChart() {
  const { budgetHistory, currency } = useBudget();

  const chartData = budgetHistory.map(entry => ({
    date: format(new Date(entry.date), "MMM d"),
    income: entry.income,
    expenses: entry.expenses,
    savings: entry.income - entry.expenses,
  }));

  const xAxisProps = {
    allowDataOverflow: false,
    allowDecimals: true,
    allowDuplicatedCategory: true,
    hide: false,
    mirror: false,
    orientation: "bottom" as "bottom",
    padding: { left: 0, right: 0 },
    reversed: false,
    scale: undefined,
    tickCount: 5,
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Budget History</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" {...xAxisProps} />
            <YAxis />
            <Tooltip
              formatter={(value) => `${currency} ${value.toLocaleString()}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke="hsl(var(--chart-1))"
              name="Income"
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="hsl(var(--chart-2))"
              name="Expenses"
            />
            <Line
              type="monotone"
              dataKey="savings"
              stroke="hsl(var(--chart-3))"
              name="Savings"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}