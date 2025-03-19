"use client";

import * as React from "react";
import { Moon, Sun, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {theme === "dark" ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          ) : theme === "light" ? (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Palette className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          className="flex items-center gap-2" 
          onClick={() => setTheme("light")}
        >
          <Sun className="h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-2" 
          onClick={() => setTheme("dark")}
        >
          <Moon className="h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="flex items-center gap-2" 
          onClick={() => setTheme("sunset")}
        >
          <div className="h-4 w-4 rounded-full bg-[hsl(24,95%,50%)]" />
          Sunset
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-2" 
          onClick={() => setTheme("forest")}
        >
          <div className="h-4 w-4 rounded-full bg-[hsl(142,70%,40%)]" />
          Forest
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-2" 
          onClick={() => setTheme("ocean")}
        >
          <div className="h-4 w-4 rounded-full bg-[hsl(199,85%,45%)]" />
          Ocean
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-2" 
          onClick={() => setTheme("candy")}
        >
          <div className="h-4 w-4 rounded-full bg-[hsl(318,80%,55%)]" />
          Candy
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}