// app/layout.tsx

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import { BudgetProvider } from "@/lib/budget-context";
import { Toaster } from "@/components/ui/sonner"; // Ensure the import is correct

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BudgetMaster - Smart Household Budget Management',
  description: 'Manage your household budget with ease using our modern and intuitive budget management application.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Any additional meta tags or head elements go here */}
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <BudgetProvider>
            {children}
            {/* Ensure the Toaster component is placed here */}
            <Toaster position="top-right" />
          </BudgetProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
