import { isAxiosError } from "axios";
import { api } from "../../lib/axios";
import type { User, UserProfile, UserSummary } from "../../types/user";

export interface AdminAssignment {
  username: string;
  role: "admin";
  changed: boolean;
}

export interface AdminVerificationRequest {
  id: string;
  username: string;
  displayName: string;
  accountType: "individual" | "business";
  profileLink: string;
  explanation: string;
  requestedAt: string;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await api.get<User>("/users/me");
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) return null;
    throw error;
  }
}

export async function getUserProfile(username: string): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>(`/users/${username}`);
  return data;
}

export async function toggleFollow(username: string): Promise<UserProfile> {
  const { data } = await api.post<UserProfile>(`/users/${username}/follow`);
  return data;
}

export async function getShareContacts(): Promise<UserSummary[]> {
  const { data } = await api.get<UserSummary[]>("/users/me/share-contacts");
  return data;
}

export async function promoteUserToAdmin(email: string): Promise<AdminAssignment> {
  const { data } = await api.post<AdminAssignment>("/admin/users/promote", { email });
  return data;
}

export async function requestAccountVerification(input: {
  profileLink: string;
  explanation: string;
}): Promise<User> {
  const { data } = await api.post<User>("/users/me/verification-request", input);
  return data;
}

export async function getPendingVerificationRequests(): Promise<AdminVerificationRequest[]> {
  const { data } = await api.get<AdminVerificationRequest[]>("/admin/users/verification-requests");
  return data;
}

export async function approveAccountVerification(userId: string): Promise<void> {
  await api.post(`/admin/users/${encodeURIComponent(userId)}/verification/approve`);
}

export async function rejectAccountVerification(userId: string, reason: string): Promise<void> {
  await api.post(`/admin/users/${encodeURIComponent(userId)}/verification/reject`, { reason });
}