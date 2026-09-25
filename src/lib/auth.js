import { SignJWT, jwtVerify } from "jose";
export const COOKIE = "vidshare_admin";
function key() {
  const value = process.env.ADMIN_JWT_SECRET;
  if (!value || value.length < 32)
    throw new Error("Set ADMIN_JWT_SECRET to at least 32 characters.");
  return new TextEncoder().encode(value);
}
export async function signToken(
  payload = {},
  expires = "8h",
  audience = "admin",
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("vidshare")
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(key());
}
export async function verifyToken(token, audience = "admin") {
  try {
    return (
      await jwtVerify(token, key(), {
        algorithms: ["HS256"],
        issuer: "vidshare",
        audience,
      })
    ).payload;
  } catch {
    return null;
  }
}
