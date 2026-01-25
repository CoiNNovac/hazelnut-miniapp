import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { config } from "../config";
import { JwtClaims, UserRole } from "../types";

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
  }

  static async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  static createJwt(userId: string, username: string, role: UserRole): string {
    const payload = {
      sub: userId,
      username,
      role,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  static verifyJwt(token: string): JwtClaims {
    try {
      return jwt.verify(token, config.jwtSecret) as JwtClaims;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  static isAdmin(role: UserRole): boolean {
    return role === "admin" || role === "superadmin";
  }

  static isSuperAdmin(role: UserRole): boolean {
    return role === "superadmin";
  }
}
