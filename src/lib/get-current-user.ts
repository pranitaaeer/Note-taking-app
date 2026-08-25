import { cookies } from "next/headers";
import { verifyToken } from "./auth";

export async function getCurrentUserId() {
  const cookieStore = await cookies();

  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}