import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { AuthSessionResponse } from "../schema";
import { AuthApiError } from "./http-error";

export async function loginWithGoogle(payload: {
  idToken: string;
}): Promise<AuthSessionResponse> {
  try {
    const response = await apiHttp.post<AuthSessionResponse>(
      "/auth/login/google",
      payload,
    );
    return response.data;
  } catch (error) {
    throw new AuthApiError(
      getApiErrorMessage(error, "Não foi possível autenticar com o Google."),
    );
  }
}
