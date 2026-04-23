import crypto from "node:crypto";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 8;
const ADMIN_NAME = "Felipe";

function getSecret(): string {
  return (
    process.env.ADMIN_PASSWORD ||
    process.env.SESSION_SECRET ||
    "dev-fallback-secret"
  );
}

function sign(data: string): string {
  return crypto.createHmac("sha256", getSecret()).update(data).digest("hex");
}

export function getAdminName(): string {
  return ADMIN_NAME;
}

export function checkAdminCredentials(name: string, password: string): boolean {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) return false;
  if ((name ?? "").trim().toLowerCase() !== ADMIN_NAME.toLowerCase()) {
    return false;
  }
  const a = Buffer.from(password ?? "");
  const b = Buffer.from(expectedPassword);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createAdminToken(): string {
  const expiry = Date.now() + TOKEN_TTL_MS;
  const payload = `admin:${expiry}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return false;
    const [scope, expiryStr, sig] = parts;
    if (scope !== "admin") return false;
    const expiry = Number(expiryStr);
    if (!Number.isFinite(expiry) || expiry < Date.now()) return false;
    const expected = sign(`${scope}:${expiryStr}`);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
