import { getDebtsReport } from "@/api/reports/methods/get-debts-report";
import {
  DebtsReportSchema,
  type DebtsReport,
  type DebtsReportQueryParams,
} from "@/api/reports/schema";
import { reportUiCopy } from "../model/messages";

export async function fetchDebtsReport(
  params: DebtsReportQueryParams = {},
): Promise<DebtsReport> {
  const response = await getDebtsReport(params);
  const parsed = DebtsReportSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error(reportUiCopy.errors.invalidResponseData);
  }

  return parsed.data;
}
