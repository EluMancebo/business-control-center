import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET ?? "dev_secret_change_me";
const JWT_EXPIRES = (process.env.JWT_EXPIRES ?? "7d") as SignOptions["expiresIn"];
export type JwtPayload = {
  id: string;
  businessId: string;
  role: "owner" | "marketing" | "staff" | "admin";
  email: string;
};

export function signToken(payload: JwtPayload) {
  const options: SignOptions = { expiresIn: JWT_EXPIRES };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

