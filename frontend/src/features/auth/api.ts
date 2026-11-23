import { api } from "../../lib/axios";
import type {
  LoginInput,
  RegisterInput,
  RegisterResult,
} from "../../types/auth";
import type { User } from "../../types/user";

export async function login(input: LoginInput): Promise<User> {
  const { data } = await api.post<User>("/auth/login", input);
  return data;
}

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const { data } = await api.post<RegisterResult>("/auth/register", input);
  return data;
}

export async function verifyEmail(token: string): Promise<void> {
  await api.post("/auth/verify-email", { token });
}

export async function resendVerification(email: string): Promise<void> {
  await api.post("/auth/resend-verification", { email });
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}