import { z } from "zod";

// ── Common helpers ──────────────────────────────────────────────
const positiveAmount = z.number().positive("Amount must be greater than 0");
const nonNegativeAmount = z.number().nonnegative("Amount cannot be negative");
const monthInt = z.number().int().min(1).max(12);
const yearInt = z.number().int().min(2000).max(2100);
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");
const memberIdString = z.string().min(1, "memberId is required");

// ── Meals ───────────────────────────────────────────────────────
export const MealPostSchema = z.object({
  memberId: memberIdString,
  date: dateString,
  breakfast: nonNegativeAmount.default(0),
  lunch: nonNegativeAmount.default(0),
  dinner: nonNegativeAmount.default(0),
});

// ── Bazar Cost ──────────────────────────────────────────────────
export const BazarPostSchema = z.object({
  month: monthInt,
  year: yearInt,
  amount: positiveAmount,
  description: z.string().optional().nullable(),
  date: dateString.optional(),
  memberId: z.string().optional().nullable(),
});

// ── Payments ────────────────────────────────────────────────────
export const PaymentBulkEntrySchema = z.object({
  memberId: memberIdString,
  amount: positiveAmount,
  note: z.string().optional().nullable(),
});

export const PaymentPostSchema = z.union([
  z.object({
    bulk: z.literal(true),
    month: monthInt,
    year: yearInt,
    date: dateString.optional(),
    note: z.string().optional().nullable(),
    entries: z.array(PaymentBulkEntrySchema).min(1, "At least one entry is required"),
  }),
  z.object({
    bulk: z.literal(false).optional(),
    memberId: memberIdString,
    month: monthInt,
    year: yearInt,
    amount: positiveAmount,
    note: z.string().optional().nullable(),
    date: dateString.optional(),
  }),
]);

// ── Individual Cost ─────────────────────────────────────────────
export const IndividualCostBulkEntrySchema = z.object({
  memberId: memberIdString,
  amount: positiveAmount,
  description: z.string().optional().nullable(),
});

export const IndividualCostPostSchema = z.union([
  z.object({
    bulk: z.literal(true),
    month: monthInt,
    year: yearInt,
    date: dateString.optional(),
    description: z.string().optional().nullable(),
    entries: z.array(IndividualCostBulkEntrySchema).min(1),
  }),
  z.object({
    bulk: z.literal(false).or(z.undefined()),
    memberId: memberIdString,
    month: monthInt,
    year: yearInt,
    amount: positiveAmount,
    description: z.string().optional().nullable(),
    date: dateString.optional(),
  }),
]);

// ── Utility Cost ────────────────────────────────────────────────
export const UtilityPostSchema = z.object({
  month: monthInt,
  year: yearInt,
  type: z.string().min(1, "Type is required"),
  amount: positiveAmount,
  description: z.string().optional().nullable(),
  date: dateString.optional(),
});

// ── Shared Cost ─────────────────────────────────────────────────
export const SharedCostPostSchema = z.object({
  month: monthInt,
  year: yearInt,
  amount: positiveAmount,
  description: z.string().optional().nullable(),
  memberIds: z.array(memberIdString).min(1, "At least one member is required"),
  date: dateString.optional(),
});

// ── Helper: extract first error message from Zod result ──────
export function zodFirstError(result: { success: false; error: { issues: Array<{ message?: string }> } }): string {
  return result.error.issues[0]?.message ?? "Invalid input";
}
