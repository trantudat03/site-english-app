import { fetchWithAuth } from "@/features/api";
import type { Profile } from "@/features/profile/types";

export async function getMyProfile(): Promise<Profile> {
  return fetchWithAuth<Profile>("/api/users/me");
}

