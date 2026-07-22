import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export interface TokenPayload {
  userId: string;
}

/**
 * Signs a JSON Web Token containing the user payload.
 * Defaults to a 7-day expiration time.
 */
export function generateToken(payload: TokenPayload, expiresIn: jwt.SignOptions["expiresIn"] = "7d"): string {
  const options: jwt.SignOptions = { expiresIn };
  return jwt.sign({ userId: payload.userId }, JWT_SECRET as string, options);
}

/**
 * Verifies a JSON Web Token and returns its decoded payload contents.
 * Throws an error if the token is expired or altered.
 */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET as string) as any as TokenPayload;
}
