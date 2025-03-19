"use client";

import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBudget } from "@/lib/budget-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner"; // Import from sonner
import { useEffect } from "react";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel" },
];

const MAX_CURRENCY_CHANGES = 5;

export function CurrencySelector() {
  const { currency, setCurrency, exchangeRates, currencyChangesCount } = useBudget();

  const hasRates = Object.keys(exchangeRates).length > 0;

  const handleCurrencyChange = (newCurrency: string) => {
    if (currencyChangesCount >= MAX_CURRENCY_CHANGES) {
      toast.error(
        "You've reached the maximum number of currency changes allowed in the free tier (5 changes)."
      );
      return;
    }
    setCurrency(newCurrency);
    const remainingChanges = MAX_CURRENCY_CHANGES - (currencyChangesCount + 1);
    toast.success(
      `Currency updated to ${newCurrency}. You have ${remainingChanges} currency changes remaining.`
    );
  };

  useEffect(() => {
    if (currencyChangesCount === MAX_CURRENCY_CHANGES - 1) {
      toast(() => (
        <div className="flex items-center gap-2 p-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <span>You have 1 currency change remaining in the free tier.</span>
        </div>
      ), {
        duration: 4000,
        style: {
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          color: '#9a3412',
        },
      });
    }
  }, [currencyChangesCount]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Currency Settings</h2>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Currency</label>
          <Select value={currency} onValueChange={handleCurrencyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code} - {curr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-2">
            Currency changes remaining: {MAX_CURRENCY_CHANGES - currencyChangesCount}
          </p>
        </div>
        {!hasRates && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to fetch exchange rates. Some currency conversions may be unavailable.
            </AlertDescription>
          </Alert>
        )}
        <p className="text-sm text-muted-foreground">
          Exchange rates are automatically updated hourly. Last update: {" "}
          {hasRates ? new Date().toLocaleTimeString() : "Never"}
        </p>
      </div>
    </Card>
  );
}
