"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Settings } from "lucide-react";
import { ExportTools } from "./export-tools";
import { CurrencySelector } from "./currency-selector";
import { Separator } from "@/components/ui/separator";

export function SettingsMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Open settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Configure your budget settings and tools
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6">
          <CurrencySelector />
          <Separator />
          <ExportTools />
        </div>
      </SheetContent>
    </Sheet>
  );
}