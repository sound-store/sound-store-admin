import useSWRMutation from "swr/mutation";
import { buildApiUrl, ENDPOINTS } from "@/apis";

interface LoginRequest {
  email: string;
  password: string;
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  role: string;
  token: string;
}

interface LoginResponse {
  isSuccess: boolean;
  message: string;
  value: UserData;
}

interface LoginError extends Error {
  info?: LoginResponse;
}

async function loginFetcher(
  url: string,
  { arg }: { arg: LoginRequest }
): Promise<LoginResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  const data = await response.json();

  if (!response.ok || !data.isSuccess) {
    const error = new Error(data.message ?? "Login failed") as LoginError;
    error.info = data;
    throw error;
  }

  return data;
}

export function useLogin() {
  const { trigger, data, error, isMutating } = useSWRMutation(
    buildApiUrl(ENDPOINTS.AUTH.LOGIN),
    loginFetcher
  );

  return {
    login: trigger,
    data,
    error,
    isLoading: isMutating,
  };
}

export type { LoginRequest, LoginResponse, UserData, LoginError };
