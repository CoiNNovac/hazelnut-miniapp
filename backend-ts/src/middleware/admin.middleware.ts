import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

/**
 * Middleware to require admin role (admin or superadmin)
 * Must be used after authenticate middleware
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (!AuthService.isAdmin(req.user.role)) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}

/**
 * Middleware to require superadmin role
 * Must be used after authenticate middleware
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (!AuthService.isSuperAdmin(req.user.role)) {
    res.status(403).json({ error: 'Superadmin access required' });
    return;
  }

  next();
}

/**
 * Middleware to require farmer role or higher
 * Must be used after authenticate middleware
 */
export function requireFarmer(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const validRoles = ['farmer', 'admin', 'superadmin'];
  if (!validRoles.includes(req.user.role)) {
    res.status(403).json({ error: 'Farmer access required' });
    return;
  }

  next();
}
