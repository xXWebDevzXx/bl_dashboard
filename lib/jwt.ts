import jwt from "jsonwebtoken";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const signToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
};