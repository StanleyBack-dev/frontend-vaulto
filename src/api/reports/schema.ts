import { z } from "zod";

export const DebtsReportStatusCountsSchema = z.object({
  open: z.number(),
  overdue: z.number(),
  partiallyPaid: z.number(),
  paid: z.number(),
});

export const DebtsReportSchema = z.object({
  totalAmountDue: z.number(),
  totalAmountPaid: z.number(),
  totalOutstanding: z.number(),
  totalCount: z.number(),
  countByStatus: DebtsReportStatusCountsSchema,
});

export type DebtsReportStatusCounts = z.infer<
  typeof DebtsReportStatusCountsSchema
>;
export type DebtsReport = z.infer<typeof DebtsReportSchema>;

export interface DebtsReportQueryParams {
  dueDateFrom?: string;
  dueDateTo?: string;
  debtType?: string;
  idCategory?: string;
}
