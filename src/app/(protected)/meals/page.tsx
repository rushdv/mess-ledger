"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MonthPicker } from "@/components/layout/month-picker";
import { getCurrentMonthYear, formatDate } from "@/lib/utils";
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

// Build a map: memberId -> date -> MealEntry
type MealMap = Record<string, Record<string, MealEntry>>;

export default function MealsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const { month: initMonth, year: initYear } = getCurrentMonthYear();
  const [month, setMonth] = useState(initMonth);
  const [year, setYear] = useState(initYear);

  const [members, setMembers] = useState<Member[]>([]);
  const [mealMap, setMealMap] = useState<MealMap>({});
  const [saving, setSaving] = useState<string | null>(null); // "memberId-date"
  const [message, setMessage] = useState("");

  // Days in the selected month
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const fetchData = useCallback(async () => {
    const [membersRes, mealsRes] = await Promise.all([
      fetch("/api/members"),
      fetch(`/api/meals?month=${month}&year=${year}`),
    ]);
    const membersData: Member[] = await membersRes.json();
    const mealsData: MealEntry[] = await mealsRes.json();

    setMembers(membersData);

    // Build map
    const map: MealMap = {};
    for (const meal of mealsData) {
      const dateKey = meal.date.slice(0, 10);
      if (!map[meal.memberId]) map[meal.memberId] = {};
      map[meal.memberId][dateKey] = meal;
    }
    setMealMap(map);
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function getMeal(memberId: string, day: number) {
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return mealMap[memberId]?.[dateKey];
  }

  async function saveMeal(
    memberId: string,
    day: number,
    field: "breakfast" | "lunch" | "dinner",
    value: number
  ) {
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const existing = mealMap[memberId]?.[dateKey];

    const updated = {
      breakfast: existing?.breakfast ?? 0,
      lunch: existing?.lunch ?? 0,
      dinner: existing?.dinner ?? 0,
      [field]: value,
    };

    const key = `${memberId}-${dateKey}`;
    setSaving(key);

    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId,
        date: dateKey,
        ...updated,
      }),
    });

    if (res.ok) {
      const saved: MealEntry = await res.json();
      setMealMap((prev) => ({
        ...prev,
        [memberId]: {
          ...prev[memberId],
          [dateKey]: saved,
        },
      }));
      setMessage("Saved");
      setTimeout(() => setMessage(""), 1500);
    }
    setSaving(null);
  }

  // For non-admin: only show their own row
  const visibleMembers = isAdmin
    ? members
    : members.filter((m) => {
        // We need to match by userId — members API returns user.id
        return true; // will filter below after we have userId
      });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Meal Count</h1>
          <p className="text-muted-foreground">Track daily meals per member</p>
        </div>
        <div className="flex items-center gap-3">
          {message && <span className="text-sm text-green-600">{message}</span>}
          <MonthPicker
            month={month}
            year={year}
            onChange={(m, y) => { setMonth(m); setYear(y); }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Daily Meal Entry — {daysInMonth} days
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="sticky left-0 bg-card px-3 py-2 text-left font-medium">
                  Member
                </th>
                {days.map((d) => (
                  <th key={d} className="min-w-[60px] px-1 py-2 text-center font-medium">
                    {d}
                  </th>
                ))}
                <th className="px-3 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                // Non-admin can only see/edit their own row
                if (!isAdmin && member.user.email !== session?.user?.email) return null;

                const rowTotal = days.reduce((sum, d) => {
                  return sum + (getMeal(member.id, d)?.total ?? 0);
                }, 0);

                return (
                  <tr key={member.id} className="border-b hover:bg-muted/30">
                    <td className="sticky left-0 bg-card px-3 py-2 font-medium">
                      {member.user.name ?? member.user.email}
                    </td>
                    {days.map((d) => {
                      const meal = getMeal(member.id, d);
                      const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                      const key = `${member.id}-${dateKey}`;
                      const isSaving = saving === key;

                      return (
                        <td key={d} className="px-1 py-1 text-center">
                          <Input
                            type="number"
                            min={0}
                            max={3}
                            className="h-8 w-14 text-center text-xs"
                            defaultValue={meal?.total ?? 0}
                            disabled={isSaving}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              // Simple: treat total as lunch count for quick entry
                              // Full breakdown via the detail view
                              if (val !== (meal?.total ?? 0)) {
                                saveMeal(member.id, d, "lunch", val);
                              }
                            }}
                            title={
                              meal
                                ? `B:${meal.breakfast} L:${meal.lunch} D:${meal.dinner}`
                                : "0"
                            }
                          />
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-right font-semibold">{rowTotal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Detailed entry card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detailed Entry (Breakfast / Lunch / Dinner)</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailedMealEntry
            members={isAdmin ? members : members.filter((m) => m.user.email === session?.user?.email)}
            month={month}
            year={year}
            mealMap={mealMap}
            onSave={(memberId, day, b, l, d) => {
              const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              fetch("/api/meals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ memberId, date: dateKey, breakfast: b, lunch: l, dinner: d }),
              })
                .then((r) => r.json())
                .then((saved: MealEntry) => {
                  setMealMap((prev) => ({
                    ...prev,
                    [memberId]: { ...prev[memberId], [dateKey]: saved },
                  }));
                });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function DetailedMealEntry({
  members,
  month,
  year,
  mealMap,
  onSave,
}: {
  members: Member[];
  month: number;
  year: number;
  mealMap: MealMap;
  onSave: (memberId: string, day: number, b: number, l: number, d: number) => void;
}) {
  const today = new Date().getDate();
  const [selectedDay, setSelectedDay] = useState(today);
  const [entries, setEntries] = useState<
    Record<string, { breakfast: number; lunch: number; dinner: number }>
  >({});

  useEffect(() => {
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    const init: Record<string, { breakfast: number; lunch: number; dinner: number }> = {};
    for (const m of members) {
      const meal = mealMap[m.id]?.[dateKey];
      init[m.id] = {
        breakfast: meal?.breakfast ?? 0,
        lunch: meal?.lunch ?? 0,
        dinner: meal?.dinner ?? 0,
      };
    }
    setEntries(init);
  }, [selectedDay, month, year, members, mealMap]);

  const daysInMonth = new Date(year, month, 0).getDate();

  function handleSaveAll() {
    for (const [memberId, e] of Object.entries(entries)) {
      onSave(memberId, selectedDay, e.breakfast, e.lunch, e.dinner);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">Day:</span>
        <select
          className="rounded-md border px-2 py-1 text-sm"
          value={selectedDay}
          onChange={(e) => setSelectedDay(parseInt(e.target.value))}
        >
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <Button size="sm" onClick={handleSaveAll}>
          <Save className="mr-1 h-3 w-3" />
          Save Day
        </Button>
      </div>

      <div className="space-y-2">
        {members.map((member) => {
          const e = entries[member.id] ?? { breakfast: 0, lunch: 0, dinner: 0 };
          return (
            <div key={member.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
              <span className="w-32 font-medium text-sm">
                {member.user.name ?? member.user.email}
              </span>
              {(["breakfast", "lunch", "dinner"] as const).map((meal) => (
                <div key={meal} className="flex items-center gap-1">
                  <label className="text-xs text-muted-foreground capitalize">{meal[0]}</label>
                  <Input
                    type="number"
                    min={0}
                    max={1}
                    className="h-8 w-14 text-center text-xs"
                    value={e[meal]}
                    onChange={(ev) =>
                      setEntries((prev) => ({
                        ...prev,
                        [member.id]: {
                          ...prev[member.id],
                          [meal]: parseInt(ev.target.value) || 0,
                        },
                      }))
                    }
                  />
                </div>
              ))}
              <span className="text-xs text-muted-foreground">
                Total: {e.breakfast + e.lunch + e.dinner}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
