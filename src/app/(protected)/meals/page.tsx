"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MonthPicker } from "@/components/layout/month-picker";
import { getCurrentMonthYear } from "@/lib/utils";
import { Save, UtensilsCrossed } from "lucide-react";

interface Member {
  id: string;
  user: { name: string | null; email: string };
}

interface MealEntry {
  id: string;
  memberId: string;
  date: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  total: number;
}

type MealMap = Record<string, Record<string, MealEntry>>;

export default function MealsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const { month: initMonth, year: initYear } = getCurrentMonthYear();
  const [month, setMonth] = useState(initMonth);
  const [year, setYear] = useState(initYear);
  const [members, setMembers] = useState<Member[]>([]);
  const [mealMap, setMealMap] = useState<MealMap>({});
  const [message, setMessage] = useState("");

  // Detailed entry state
  const today = new Date().getDate();
  const [selectedDay, setSelectedDay] = useState(today);
  const [entries, setEntries] = useState<Record<string, { breakfast: number; lunch: number; dinner: number }>>({});
  const [saving, setSaving] = useState(false);

  const daysInMonth = new Date(year, month, 0).getDate();

  const fetchData = useCallback(async () => {
    const [mr, mealsR] = await Promise.all([
      fetch("/api/members"),
      fetch(`/api/meals?month=${month}&year=${year}`),
    ]);
    const membersData: Member[] = await mr.json();
    const mealsData: MealEntry[] = await mealsR.json();
    setMembers(membersData);
    const map: MealMap = {};
    for (const meal of mealsData) {
      const dk = meal.date.slice(0, 10);
      if (!map[meal.memberId]) map[meal.memberId] = {};
      map[meal.memberId][dk] = meal;
    }
    setMealMap(map);
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Sync entries when day/month/year/members/mealMap changes
  useEffect(() => {
    const dk = `${year}-${String(month).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    const init: Record<string, { breakfast: number; lunch: number; dinner: number }> = {};
    const visible = isAdmin ? members : members.filter((m) => m.user.email === session?.user?.email);
    for (const m of visible) {
      const meal = mealMap[m.id]?.[dk];
      init[m.id] = { breakfast: meal?.breakfast ?? 0, lunch: meal?.lunch ?? 0, dinner: meal?.dinner ?? 0 };
    }
    setEntries(init);
  }, [selectedDay, month, year, members, mealMap, isAdmin, session]);

  async function handleSaveAll() {
    setSaving(true);
    const dk = `${year}-${String(month).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    await Promise.all(
      Object.entries(entries).map(([memberId, e]) =>
        fetch("/api/meals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId, date: dk, ...e }),
        }).then((r) => r.json()).then((saved: MealEntry) => {
          setMealMap((prev) => ({
            ...prev,
            [memberId]: { ...prev[memberId], [dk]: saved },
          }));
        })
      )
    );
    setSaving(false);
    setMessage("Saved!");
    setTimeout(() => setMessage(""), 2000);
  }

  const visibleMembers = isAdmin
    ? members
    : members.filter((m) => m.user.email === session?.user?.email);

  // Monthly totals per member
  const memberTotals = visibleMembers.map((m) => {
    const total = Object.values(mealMap[m.id] ?? {}).reduce((s, mc) => s + mc.total, 0);
    return { member: m, total };
  });

  return (
    <div className="space-y-5">
      {/* Month picker */}
      <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />

      {/* Monthly summary chips */}
      {memberTotals.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {memberTotals.map(({ member, total }) => (
            <div key={member.id} className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {(member.user.name ?? member.user.email)[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-medium">{member.user.name?.split(" ")[0] ?? member.user.email}</span>
              <span className="text-sm font-bold text-primary">{total}</span>
            </div>
          ))}
        </div>
      )}

      {/* Day entry card */}
      <div className="rounded-2xl border bg-card">
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Daily Entry</p>
            {message && <span className="text-sm font-medium text-green-600">{message}</span>}
          </div>
          {/* Day selector */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const dk = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const hasMeals = visibleMembers.some((m) => (mealMap[m.id]?.[dk]?.total ?? 0) > 0);
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                    selectedDay === d
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {d}
                  {hasMeals && selectedDay !== d && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Member meal inputs */}
        <div className="divide-y">
          {visibleMembers.map((member) => {
            const e = entries[member.id] ?? { breakfast: 0, lunch: 0, dinner: 0 };
            const dayTotal = e.breakfast + e.lunch + e.dinner;
            return (
              <div key={member.id} className="px-4 py-3">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {(member.user.name ?? member.user.email)[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium">{member.user.name ?? member.user.email}</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${dayTotal > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {dayTotal}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["breakfast", "lunch", "dinner"] as const).map((meal) => (
                    <div key={meal} className="space-y-1">
                      <label className="block text-center text-xs text-muted-foreground capitalize">
                        {meal === "breakfast" ? "🌅 B" : meal === "lunch" ? "☀️ L" : "🌙 D"}
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={1}
                        className="h-10 text-center text-base font-semibold"
                        value={e[meal]}
                        onChange={(ev) =>
                          setEntries((prev) => ({
                            ...prev,
                            [member.id]: { ...prev[member.id], [meal]: parseInt(ev.target.value) || 0 },
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Save button */}
        <div className="border-t p-4">
          <Button className="w-full rounded-xl" onClick={handleSaveAll} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : `Save Day ${selectedDay}`}
          </Button>
        </div>
      </div>

      {/* Monthly overview */}
      {isAdmin && members.length > 0 && (
        <div className="rounded-2xl border bg-card">
          <div className="border-b px-4 py-3">
            <p className="font-semibold">Monthly Overview</p>
            <p className="text-xs text-muted-foreground">Member · day-by-day totals</p>
          </div>

          {/* Scrollable table with proper sticky column */}
          <div className="relative">
            <div className="overflow-x-auto">
              <table className="border-collapse text-xs" style={{ tableLayout: "fixed" }}>
                <colgroup>
                  {/* Fixed name column */}
                  <col style={{ width: "72px", minWidth: "72px" }} />
                  {/* Day columns */}
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <col key={i} style={{ width: "26px", minWidth: "26px" }} />
                  ))}
                  {/* Total column */}
                  <col style={{ width: "36px", minWidth: "36px" }} />
                </colgroup>

                <thead>
                  <tr className="border-b">
                    {/* Sticky header name cell */}
                    <th
                      className="border-r bg-muted/60 px-2 py-2 text-left font-semibold text-muted-foreground"
                      style={{ position: "sticky", left: 0, zIndex: 2 }}
                    >
                      Name
                    </th>
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const d = i + 1;
                      const isToday =
                        d === new Date().getDate() &&
                        month === new Date().getMonth() + 1 &&
                        year === new Date().getFullYear();
                      return (
                        <th
                          key={d}
                          className={`py-2 text-center font-medium ${
                            isToday
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          {d}
                        </th>
                      );
                    })}
                    <th
                      className="border-l bg-muted/60 py-2 text-center font-semibold text-primary"
                      style={{ position: "sticky", right: 0, zIndex: 2 }}
                    >
                      ∑
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {members.map((member, idx) => {
                    const rowTotal = Array.from({ length: daysInMonth }, (_, i) => i + 1).reduce(
                      (sum, d) => {
                        const dk = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                        return sum + (mealMap[member.id]?.[dk]?.total ?? 0);
                      },
                      0
                    );

                    return (
                      <tr
                        key={member.id}
                        className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}
                      >
                        {/* Sticky name cell */}
                        <td
                          className="border-r py-2 pl-2 pr-1 font-medium"
                          style={{
                            position: "sticky",
                            left: 0,
                            zIndex: 1,
                            background: idx % 2 === 0 ? "hsl(var(--background))" : "hsl(var(--muted) / 0.2)",
                          }}
                        >
                          <span className="block max-w-[64px] truncate">
                            {member.user.name?.split(" ")[0] ?? member.user.email.split("@")[0]}
                          </span>
                        </td>

                        {/* Day cells */}
                        {Array.from({ length: daysInMonth }, (_, i) => {
                          const d = i + 1;
                          const dk = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                          const val = mealMap[member.id]?.[dk]?.total ?? 0;
                          const isToday =
                            d === new Date().getDate() &&
                            month === new Date().getMonth() + 1 &&
                            year === new Date().getFullYear();
                          return (
                            <td
                              key={d}
                              className={`py-2 text-center ${isToday ? "bg-primary/5" : ""}`}
                            >
                              {val > 0 ? (
                                <span className="font-bold text-primary">{val}</span>
                              ) : (
                                <span className="text-muted-foreground/30">·</span>
                              )}
                            </td>
                          );
                        })}

                        {/* Sticky total cell */}
                        <td
                          className="border-l py-2 text-center font-bold text-primary"
                          style={{
                            position: "sticky",
                            right: 0,
                            zIndex: 1,
                            background: idx % 2 === 0 ? "hsl(var(--background))" : "hsl(var(--muted) / 0.2)",
                          }}
                        >
                          {rowTotal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Footer: column totals */}
                <tfoot>
                  <tr className="border-t bg-muted/40">
                    <td
                      className="border-r py-2 pl-2 text-xs font-semibold text-muted-foreground"
                      style={{ position: "sticky", left: 0, zIndex: 1, background: "hsl(var(--muted) / 0.4)" }}
                    >
                      Total
                    </td>
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const d = i + 1;
                      const dk = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                      const dayTotal = members.reduce(
                        (sum, m) => sum + (mealMap[m.id]?.[dk]?.total ?? 0),
                        0
                      );
                      return (
                        <td key={d} className="py-2 text-center text-xs font-semibold">
                          {dayTotal > 0 ? (
                            <span className="text-foreground">{dayTotal}</span>
                          ) : (
                            <span className="text-muted-foreground/30">·</span>
                          )}
                        </td>
                      );
                    })}
                    <td
                      className="border-l py-2 text-center text-xs font-bold text-primary"
                      style={{ position: "sticky", right: 0, zIndex: 1, background: "hsl(var(--muted) / 0.4)" }}
                    >
                      {members.reduce((sum, m) => {
                        return sum + Object.values(mealMap[m.id] ?? {}).reduce((s, mc) => s + mc.total, 0);
                      }, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
