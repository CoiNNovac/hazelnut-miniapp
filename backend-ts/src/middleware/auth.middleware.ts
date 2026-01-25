import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";
import { JwtClaims } from "../types";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtClaims;
    }
  }
}

/**
 * Middleware to authenticate JWT token from Authorization header
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "Authorization header required" });
    return;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    res
      .status(401)
      .json({ error: "Invalid authorization format. Use: Bearer <token>" });
    return;
  }

  const token = parts[1];

  try {
    const claims = AuthService.verifyJwt(token);
    req.user = claims;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Optional authentication - sets user if token is present but doesn't require it
 */
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next();
    return;
  }

  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0] === "Bearer") {
    try {
      const claims = AuthService.verifyJwt(parts[1]);
      req.user = claims;
    } catch {
      // Token invalid, continue without user
    }
  }

  next();
}

/**
 * Get user address from X-User-Identity header (legacy support)
 */
export function getUserAddress(req: Request): string | null {
  const identity = req.headers["x-user-identity"] as string;
  return identity || null;
}

/**
 * Alias for authenticate - for backward compatibility
 */
export const authenticateToken = authenticate;

/**
 * Middleware to require admin role
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (!AuthService.isAdmin(req.user.role)) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  next();
}

/**
 * Middleware to require superadmin role
 */
export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (!AuthService.isSuperAdmin(req.user.role)) {
    res.status(403).json({ error: "Superadmin access required" });
    return;
  }

  next();
}
