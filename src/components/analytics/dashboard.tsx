"use client";

import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { useBudget } from "@/lib/budget-context";
import { HistoryChart } from "./history-chart";

export function AnalyticsDashboard() {
  const { income, expenses, categories } = useBudget(); // Removed currency as it was not used

  const monthlyData = [
    { month: "Jan", income, expenses },
    { month: "Feb", income: income * 1.04, expenses: expenses * 1.06 },
    { month: "Mar", income: income * 1.02, expenses: expenses * 0.97 },
    { month: "Apr", income: income * 1.06, expenses: expenses * 1.12 },
    { month: "May", income: income * 1.08, expenses: expenses * 1.03 },
    { month: "Jun", income: income * 1.04, expenses },
  ];

  const categoryData = categories.map((category) => ({
    name: category.name,
    value: category.spent,
    color: `hsl(var(--chart-${Math.floor(Math.random() * 5 + 1)}))`,
  }));

  const savingsData = monthlyData.map((data) => ({
    month: data.month,
    amount: data.income - data.expenses,
  }));

  const spendingTrendData = [
    { date: "Week 1", amount: expenses / 4 },
    { date: "Week 2", amount: (expenses / 4) * 1.125 },
    { date: "Week 3", amount: (expenses / 4) * 0.9375 },
    { date: "Week 4", amount: (expenses / 4) * 1.1875 },
  ];

  // Updated xAxisProps with proper scale type
  const xAxisProps = {
    allowDataOverflow: false,
    allowDecimals: true,
    allowDuplicatedCategory: true,
    hide: false,
    mirror: false,
    orientation: "bottom" as "bottom" | "top", // Typecast to the correct type
    padding: { left: 0, right: 0 },
    reversed: false,
    scale: "auto" as "auto" | "band" | "point" | undefined, // Proper scale type
    tickCount: 5,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* History Chart */}
      <HistoryChart />

      {/* Income vs Expenses */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Income vs Expenses</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" {...xAxisProps} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="hsl(var(--chart-1))" name="Income" />
              <Bar dataKey="expenses" fill="hsl(var(--chart-2))" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Expense Distribution */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Expense Distribution</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Savings Trend */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Savings Trend</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={savingsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" {...xAxisProps} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-3))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Weekly Spending Trend */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Weekly Spending Trend</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spendingTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" {...xAxisProps} />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--chart-4))"
                fill="hsl(var(--chart-4) / 0.2)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
