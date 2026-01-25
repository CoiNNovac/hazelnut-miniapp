import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../services/AuthService';
import { cacheService, CacheService } from '../services/CacheService';
import { User } from '../db/models';
import { CreateUserRequest, UserResponse } from '../types';
import { BadRequestError, NotFoundError, ConflictError } from '../middleware/error.middleware';

export class UserController {
  /**
   * List all users
   * GET /admin/users
   */
  static async list(req: Request, res: Response): Promise<void> {
    // Check cache
    const cacheKey = CacheService.keys.userList();
    const cached = await cacheService.get<UserResponse[]>(cacheKey);

    if (cached) {
      res.json({ users: cached });
      return;
    }

    const users = await User.find().sort({ createdAt: -1 });

    const response = users.map((user): UserResponse => ({
      id: user._id,
      username: user.username,
      address: user.address,
      role: user.role,
      name: user.name,
      isDisabled: user.isDisabled,
      createdAt: user.createdAt,
    }));

    await cacheService.set(cacheKey, response, CacheService.ttl.userList);

    res.json({ users: response });
  }

  /**
   * Get user by ID
   * GET /admin/users/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const response: UserResponse = {
      id: user._id,
      username: user.username,
      address: user.address,
      role: user.role,
      name: user.name,
      isDisabled: user.isDisabled,
      createdAt: user.createdAt,
    };

    res.json({ user: response });
  }

  /**
   * Create new user
   * POST /admin/users
   */
  static async create(req: Request, res: Response): Promise<void> {
    const { username, password, address, role, name } = req.body as CreateUserRequest;

    if (!username || !password || !address || !role) {
      throw new BadRequestError('Username, password, address, and role required');
    }

    // Check for existing user
    const existingByUsername = await User.findOne({ username });
    if (existingByUsername) {
      throw new ConflictError('Username already exists');
    }

    const existingByAddress = await User.findOne({ address });
    if (existingByAddress) {
      throw new ConflictError('Address already registered');
    }

    // Only superadmin can create admin/superadmin
    if ((role === 'admin' || role === 'superadmin') && !AuthService.isSuperAdmin(req.user!.role)) {
      throw new BadRequestError('Only superadmin can create admin users');
    }

    const passwordHash = await AuthService.hashPassword(password);

    const user = new User({
      _id: uuidv4(),
      username,
      passwordHash,
      address,
      role,
      name,
      isDisabled: false,
    });

    await user.save();

    // Invalidate cache
    await cacheService.del(CacheService.keys.userList());

    const response: UserResponse = {
      id: user._id,
      username: user.username,
      address: user.address,
      role: user.role,
      name: user.name,
      isDisabled: user.isDisabled,
      createdAt: user.createdAt,
    };

    res.status(201).json({ user: response });
  }

  /**
   * Disable user
   * PUT /admin/users/:id/disable
   */
  static async disable(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Cannot disable superadmin unless you're also superadmin
    if (user.role === 'superadmin' && !AuthService.isSuperAdmin(req.user!.role)) {
      throw new BadRequestError('Cannot disable superadmin');
    }

    // Cannot disable yourself
    if (user._id === req.user!.sub) {
      throw new BadRequestError('Cannot disable yourself');
    }

    user.isDisabled = true;
    await user.save();

    // Invalidate cache
    await cacheService.del(CacheService.keys.userList());
    await cacheService.del(CacheService.keys.user(id));

    res.json({ message: 'User disabled', userId: id });
  }

  /**
   * Enable user
   * PUT /admin/users/:id/enable
   */
  static async enable(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.isDisabled = false;
    await user.save();

    // Invalidate cache
    await cacheService.del(CacheService.keys.userList());
    await cacheService.del(CacheService.keys.user(id));

    res.json({ message: 'User enabled', userId: id });
  }

  /**
   * Delete user
   * DELETE /admin/users/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Cannot delete superadmin
    if (user.role === 'superadmin') {
      throw new BadRequestError('Cannot delete superadmin');
    }

    // Cannot delete yourself
    if (user._id === req.user!.sub) {
      throw new BadRequestError('Cannot delete yourself');
    }

    await User.deleteOne({ _id: id });

    // Invalidate cache
    await cacheService.del(CacheService.keys.userList());
    await cacheService.del(CacheService.keys.user(id));

    res.json({ message: 'User deleted', userId: id });
  }
}
