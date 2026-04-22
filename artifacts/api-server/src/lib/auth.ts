import type { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { db, usersTable, type User } from "@workspace/db";
import { eq } from "drizzle-orm";
import { PLAN_LIMITS } from "./userPlan";

export interface AuthedRequest extends Request {
  userId: string;
  user: User;
}

export async function ensureUser(userId: string): Promise<User> {
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  if (existing.length > 0) return existing[0]!;

  let email: string | null = null;
  let name: string | null = null;
  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    email = clerkUser.emailAddresses[0]?.emailAddress ?? null;
    const parts = [clerkUser.firstName, clerkUser.lastName]
      .filter((v): v is string => typeof v === "string" && v.length > 0)
      .join(" ");
    name = parts || (clerkUser.username as string | null) || null;
  } catch {
    // ignore
  }

  const [created] = await db
    .insert(usersTable)
    .values({
      id: userId,
      email,
      name,
      plan: "free",
      adsLimit: PLAN_LIMITS.free,
    })
    .returning();
  return created!;
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const auth = getAuth(req);
  const userId = ((auth?.sessionClaims as { userId?: string } | undefined)
    ?.userId || auth?.userId) as string | null | undefined;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  ensureUser(userId)
    .then((user) => {
      (req as AuthedRequest).userId = userId;
      (req as AuthedRequest).user = user;
      next();
    })
    .catch((err) => {
      req.log?.error({ err }, "ensureUser failed");
      res.status(500).json({ error: "Auth bootstrap failed" });
    });
}
