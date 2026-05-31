"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useMessContext } from "@/hooks/use-mess-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MonthPicker } from "@/components/layout/month-picker";
import { getCurrentMonthYear, cn } from "@/lib/utils";
import { Save } from "lucide-react";

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
  const { messContext } = useMessContext();
  
  // Use mess-specific role
  const canManage = messContext?.canManage ?? false;

  const { month: initMonth, year: initYear } = getCurrentMonthYear();
  const [month, setMonth] = useState(initMonth);
  const [year, setYear] = useState(initYear);
  const [members, setMembers] = useState<Member[]>([]);
  const [mealMap, setMealMap] = useState<MealMap>({});
  const [message, setMessage] = useState("");

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

  const visibleMembers = members;

  // Sync entries on day/data change
  useEffect(() => {
    const dk = `${year}-${String(month).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    const init: Record<string, { breakfast: number; lunch: number; dinner: number }> = {};
    for (const m of visibleMembers) {
      const meal = mealMap[m.id]?.[dk];
      init[m.id] = { breakfast: meal?.breakfast ?? 0, lunch: meal?.lunch ?? 0, dinner: meal?.dinner ?? 0 };
    }
    setEntries(init);
  }, [selectedDay, month, year, mealMap, visibleMembers]);

  async function handleSaveAll() {
    setSaving(true);
    const dk = `${year}-${String(month).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    await Promise.all(
      Object.entries(entries).map(([memberId, e]) =>
        fetch("/api/meals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId, date: dk, ...e }),
        })
          .then((r) => r.json())
          .then((saved: MealEntry) => {
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

  const memberTotals = visibleMembers.map((m) => ({
    member: m,
    total: Object.values(mealMap[m.id] ?? {}).reduce((s, mc) => s + mc.total, 0),
  }));

  // ── Shared: Day selector strip ──────────────────────────────────────────────
  const DayStrip = (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
        const dk = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const hasMeals = visibleMembers.some((m) => (mealMap[m.id]?.[dk]?.total ?? 0) > 0);
        const isToday = d === new Date().getDate() && month === new Date().getMonth() + 1 && year === new Date().getFullYear();
        return (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-medium transition-colors ${
              selectedDay === d
                ? "bg-primary text-primary-foreground"
                : isToday
                ? "ring-2 ring-primary/40 hover:bg-muted"
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
  );

  // ── Shared: Member B/L/D inputs ─────────────────────────────────────────────
  const MemberInputs = (
    <div className="divide-y">
      {visibleMembers.map((member) => {
        const e = entries[member.id] ?? { breakfast: 0, lunch: 0, dinner: 0 };
        const dayTotal = e.breakfast + e.lunch + e.dinner;
        return (
          <div key={member.id} className="px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                  member.id === messContext?.memberId ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                )}>
                  {(member.user.name ?? member.user.email)[0]?.toUpperCase()}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  member.id === messContext?.memberId && "text-primary font-bold"
                )}>
                  {member.user.name?.split(" ")[0] ?? member.user.email}
                  {member.id === messContext?.memberId && " (You)"}
                </span>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${dayTotal > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {dayTotal}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["breakfast", "lunch", "dinner"] as const).map((meal) => {
                const isEditable = canManage || (member.id === messContext?.memberId);
                // Simple lock logic: can't edit past days or today after 10 PM
                const isLocked = !canManage && (
                  new Date(year, month - 1, selectedDay) < new Date(new Date().setHours(0,0,0,0)) ||
                  (new Date().getDate() === selectedDay && new Date().getHours() >= 22)
                );

                return (
                  <div key={meal} className="space-y-1">
                    <label className="block text-center text-xs text-muted-foreground">
                      {meal === "breakfast" ? "🌅 B" : meal === "lunch" ? "☀️ L" : "🌙 D"}
                    </label>
                    <Input
                      type="number" min={0} max={1}
                      className={cn(
                        "h-9 text-center text-sm font-semibold",
                        isEditable && !isLocked ? "border-primary/50" : ""
                      )}
                      value={e[meal]}
                      onChange={(ev) =>
                        setEntries((prev) => ({
                          ...prev,
                          [member.id]: { ...prev[member.id], [meal]: parseInt(ev.target.value) || 0 },
                        }))
                      }
                      disabled={!isEditable || isLocked}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── Shared: Monthly overview table ──────────────────────────────────────────
  const OverviewTable = (
    <div className="overflow-x-auto">
      <table className="border-collapse text-xs" style={{ tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "80px", minWidth: "80px" }} />
          {Array.from({ length: daysInMonth }, (_, i) => (
            <col key={i} style={{ width: "28px", minWidth: "28px" }} />
          ))}
          <col style={{ width: "40px", minWidth: "40px" }} />
        </colgroup>
        <thead>
          <tr className="border-b">
            <th className="border-r bg-muted/50 px-2 py-2.5 text-left text-xs font-semibold text-muted-foreground"
              style={{ position: "sticky", left: 0, zIndex: 2 }}>
              Member
            </th>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1;
              const isToday = d === new Date().getDate() && month === new Date().getMonth() + 1 && year === new Date().getFullYear();
              return (
                <th key={d}
                  className={`py-2.5 text-center text-xs font-medium cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedDay === d ? "bg-primary/15 text-primary font-bold" : isToday ? "bg-primary/8 text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => setSelectedDay(d)}
                  title={`Day ${d}`}
                >
                  {d}
                </th>
              );
            })}
            <th className="border-l bg-muted/50 py-2.5 text-center text-xs font-semibold text-primary"
              style={{ position: "sticky", right: 0, zIndex: 2 }}>
              ∑
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, idx) => {
            const rowTotal = Array.from({ length: daysInMonth }, (_, i) => i + 1).reduce((sum, d) => {
              const dk = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              return sum + (mealMap[member.id]?.[dk]?.total ?? 0);
            }, 0);
            const rowBg = idx % 2 === 0 ? "hsl(var(--background))" : "hsl(var(--muted) / 0.2)";
            return (
              <tr key={member.id} className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                <td className="border-r py-2.5 pl-2 pr-1 font-medium"
                  style={{ position: "sticky", left: 0, zIndex: 1, background: rowBg }}>
                  <span className="block max-w-[72px] truncate text-xs">
                    {member.user.name?.split(" ")[0] ?? member.user.email.split("@")[0]}
                  </span>
                </td>
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const d = i + 1;
                  const dk = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                  const val = mealMap[member.id]?.[dk]?.total ?? 0;
                  const isSelected = selectedDay === d;
                  const isToday = d === new Date().getDate() && month === new Date().getMonth() + 1 && year === new Date().getFullYear();
                  return (
                    <td key={d}
                      className={`py-2.5 text-center cursor-pointer transition-colors hover:bg-primary/10 ${
                        isSelected ? "bg-primary/10" : isToday ? "bg-primary/5" : ""
                      }`}
                      onClick={() => setSelectedDay(d)}
                    >
                      {val > 0 ? (
                        <span className="font-bold text-primary">{val}</span>
                      ) : (
                        <span className="text-muted-foreground/25">·</span>
                      )}
                    </td>
                  );
                })}
                <td className="border-l py-2.5 text-center font-bold text-primary"
                  style={{ position: "sticky", right: 0, zIndex: 1, background: rowBg }}>
                  {rowTotal}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t">
            <td className="border-r bg-muted/40 py-2.5 pl-2 text-xs font-semibold text-muted-foreground"
              style={{ position: "sticky", left: 0, zIndex: 1, background: "hsl(var(--muted) / 0.4)" }}>
              Total
            </td>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1;
              const dk = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const dayTotal = members.reduce((sum, m) => sum + (mealMap[m.id]?.[dk]?.total ?? 0), 0);
              const isSelected = selectedDay === d;
              return (
                <td key={d}
                  className={`py-2.5 text-center text-xs font-semibold ${isSelected ? "bg-primary/10" : "bg-muted/40"}`}
                  style={!isSelected ? { background: "hsl(var(--muted) / 0.4)" } : undefined}
                >
                  {dayTotal > 0 ? <span className="text-foreground">{dayTotal}</span> : <span className="text-muted-foreground/25">·</span>}
                </td>
              );
            })}
            <td className="border-l bg-muted/40 py-2.5 text-center text-xs font-bold text-primary"
              style={{ position: "sticky", right: 0, zIndex: 1, background: "hsl(var(--muted) / 0.4)" }}>
              {members.reduce((sum, m) => sum + Object.values(mealMap[m.id] ?? {}).reduce((s, mc) => s + mc.total, 0), 0)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  return (
    <>
      {/* ══════════════════════════════════════════
          DESKTOP layout
      ══════════════════════════════════════════ */}
      <div className="hidden md:flex md:flex-col md:gap-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Meal Count</h1>
            <p className="text-muted-foreground">Track daily meals per member</p>
          </div>
          <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
        </div>

        {/* Two-column layout */}
        <div className={`grid gap-6 items-start ${canManage ? 'grid-cols-3' : 'grid-cols-1'}`}>

          {/* Left col (2/3 or full): monthly overview table */}
          <div className={`${canManage ? 'col-span-2' : 'col-span-1'} rounded-xl border bg-card`}>
            <div className="border-b px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Monthly Overview</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Click a day column to edit that day →</p>
              </div>
              {/* Member total chips */}
              <div className="flex flex-wrap gap-2">
                {memberTotals.map(({ member, total }) => (
                  <div key={member.id} className="flex items-center gap-1.5 rounded-full border bg-muted/30 px-2.5 py-1">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {(member.user.name ?? member.user.email)[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs font-medium">{member.user.name?.split(" ")[0] ?? member.user.email}</span>
                    <span className="text-xs font-bold text-primary">{total}</span>
                  </div>
                ))}
              </div>
            </div>
            {OverviewTable}
          </div>

          {/* Right col (1/3): day entry panel */}
          {canManage && (
            <div className="rounded-xl border bg-card">
              <div className="border-b px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">Day {selectedDay} Entry</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Breakfast · Lunch · Dinner</p>
                  </div>
                  {message && <span className="text-sm font-medium text-green-600">{message}</span>}
                </div>
                {/* Compact day strip */}
                <div className="mt-3">{DayStrip}</div>
              </div>

              {MemberInputs}

              <div className="border-t p-4">
                <Button className="w-full rounded-xl" onClick={handleSaveAll} disabled={saving || !canManage}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : `Save Day ${selectedDay}`}
                </Button>
                {!canManage && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">Only admin/moderator can add meals</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE layout
      ══════════════════════════════════════════ */}
      <div className="space-y-5 md:hidden">
        <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />

        {/* Member total chips */}
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
        {canManage && (
          <div className="rounded-2xl border bg-card">
            <div className="border-b px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Daily Entry</p>
                {message && <span className="text-sm font-medium text-green-600">{message}</span>}
              </div>
              <div className="mt-3">{DayStrip}</div>
            </div>
            {MemberInputs}
            <div className="border-t p-4">
              <Button className="w-full rounded-xl" onClick={handleSaveAll} disabled={saving || !canManage}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : `Save Day ${selectedDay}`}
              </Button>
              {!canManage && (
                <p className="mt-2 text-center text-xs text-muted-foreground">Only admin/moderator can add meals</p>
              )}
            </div>
          </div>
        )}

        {/* Monthly overview */}
        {members.length > 0 && (
          <div className="rounded-2xl border bg-card">
            <div className="border-b px-4 py-3">
              <p className="font-semibold">Monthly Overview</p>
              <p className="text-xs text-muted-foreground">Scroll horizontally · tap day to edit</p>
            </div>
            {OverviewTable}
          </div>
        )}
      </div>
    </>
  );
}
