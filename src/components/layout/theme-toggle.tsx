"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor, Flame, Droplet, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const options = [
    { value: "light",   icon: Sun,     label: "Light"   },
    { value: "dark",    icon: Moon,    label: "Dark"    },
    { value: "orange",  icon: Flame,   label: "Orange"  },
    { value: "blue",    icon: Droplet, label: "Ocean"   },
    { value: "emerald", icon: Leaf,    label: "Emerald" },
    { value: "system",  icon: Monitor, label: "System"  },
  ] as const;

  return (
    <div className="w-full rounded-xl border border-border bg-muted/40 p-1.5">
      {/* Label */}
      <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Theme
      </p>
      {/* 3-column grid so all 6 buttons fit perfectly */}
      <div className="grid grid-cols-3 gap-1">
        {options.map(({ value, icon: Icon, label }) => {
          const isActive = theme === value;
          return (
            <button
              key={value}
              onClick={() => setTheme(value)}
              title={label}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium transition-all duration-150",
                isActive
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
