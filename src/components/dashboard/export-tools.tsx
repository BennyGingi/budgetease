"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, File as FilePdf } from "lucide-react";
import { useBudget } from "@/lib/budget-context";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";

export function ExportTools() {
  const { categories, income, expenses, currency } = useBudget();

  const exportToCSV = () => {
    const data = categories.flatMap(category => 
      category.items.map(item => ({
        Category: category.name,
        "Category Budget": `${currency} ${category.budget}`,
        Item: item.name,
        Amount: `${currency} ${item.amount}`,
        "Receipt Count": item.receipts?.length || 0
      }))
    );

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `budget_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("Budget Report", 20, 20);
    
    // Add summary
    doc.setFontSize(12);
    doc.text(`Total Income: ${currency} ${income}`, 20, 35);
    doc.text(`Total Expenses: ${currency} ${expenses}`, 20, 45);
    doc.text(`Remaining: ${currency} ${income - expenses}`, 20, 55);

    // Add categories and items
    const tableData = categories.flatMap(category => 
      category.items.map(item => [
        category.name,
        item.name,
        `${currency} ${item.amount}`,
        item.receipts?.length || 0
      ])
    );

    (doc as any).autoTable({
      startY: 70,
      head: [["Category", "Item", "Amount", "Receipts"]],
      body: tableData,
    });

    doc.save(`budget_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Export Budget</h2>
      </div>
      <div className="flex gap-4">
        <Button onClick={exportToCSV} className="flex-1">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
        <Button onClick={exportToPDF} className="flex-1">
          <FilePdf className="mr-2 h-4 w-4" />
          Export to PDF
        </Button>
      </div>
    </Card>
  );
}