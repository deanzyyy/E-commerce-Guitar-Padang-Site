import { cookies } from "next/headers";
import { prisma } from "./prisma";

export interface SessionUser {
  id_user: number;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    return null;
  }

  try {
    // In a real app, you'd store sessions in a database or Redis
    // For simplicity, we'll decode the session from the cookie
    const session = JSON.parse(Buffer.from(sessionId, "base64").toString());
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id_user: session.id_user },
      select: {
        id_user: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id_user: user.id_user,
      username: user.username,
      email: user.email,
      role: user.role as "USER" | "ADMIN",
    };
  } catch (error) {
    return null;
  }
}

export async function createSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  const sessionData = JSON.stringify(user);
  const sessionId = Buffer.from(sessionData).toString("base64");

  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth();
  if (session.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }
  return session;
}

