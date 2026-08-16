import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { IncomesReport, IncomesReportQueryParams } from "../schema";

export async function getIncomesReport(
  params: IncomesReportQueryParams = {},
): Promise<IncomesReport> {
  try {
    const response = await apiHttp.get<IncomesReport>("/reports/incomes", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível carregar o relatório."),
    );
  }
}
