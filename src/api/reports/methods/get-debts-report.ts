import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { DebtsReport, DebtsReportQueryParams } from "../schema";

export async function getDebtsReport(
  params: DebtsReportQueryParams = {},
): Promise<DebtsReport> {
  try {
    const response = await apiHttp.get<DebtsReport>("/reports/debts", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível carregar o relatório."),
    );
  }
}
