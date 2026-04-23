import type { Request, Response, NextFunction } from "express";
import type { AuthedRequest } from "./auth";
import { requireAuth } from "./auth";
import { verifyAdminToken } from "./adminToken";

export function getAdminEmail(): string | null {
  const v = process.env.ADMIN_EMAIL;
  return v && v.trim() ? v.trim().toLowerCase() : null;
}

export function isUserAdmin(user: { role?: string; email?: string | null }): boolean {
  if (user.role === "admin") return true;
  const adminEmail = getAdminEmail();
  if (!adminEmail) return false;
  return (user.email ?? "").trim().toLowerCase() === adminEmail;
}

function extractBearer(req: Request): string | null {
  const auth = req.headers["authorization"];
  if (typeof auth !== "string") return null;
  if (!auth.toLowerCase().startsWith("bearer ")) return null;
  return auth.slice(7).trim() || null;
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const bearer = extractBearer(req);
  if (bearer && verifyAdminToken(bearer)) {
    next();
    return;
  }
  requireAuth(req, res, () => {
    const ar = req as AuthedRequest;
    if (!isUserAdmin(ar.user)) {
      res.status(403).json({ error: "Acesso restrito ao administrador." });
      return;
    }
    next();
  });
}
