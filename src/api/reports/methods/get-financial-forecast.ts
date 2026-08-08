import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { FinancialForecast, FinancialForecastPayload } from "../schema";

export async function getFinancialForecast(
  payload: FinancialForecastPayload,
): Promise<FinancialForecast> {
  try {
    const response = await apiHttp.post<FinancialForecast>(
      "/reports/forecast",
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível calcular a previsão."),
    );
  }
}
