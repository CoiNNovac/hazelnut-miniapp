import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../services/AuthService';
import { User } from '../db/models';
import { LoginRequest, WalletLoginRequest, AuthResponse, UserResponse } from '../types';
import { BadRequestError, UnauthorizedError } from '../middleware/error.middleware';

export class AuthController {
  /**
   * Login with username and password
   * POST /auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body as LoginRequest;

    if (!username || !password) {
      throw new BadRequestError('Username and password required');
    }

    const user = await User.findOne({ username });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const valid = await AuthService.verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.isDisabled) {
      throw new UnauthorizedError('Account is disabled');
    }

    const token = AuthService.createJwt(user._id, user.username || '', user.role);

    const userResponse: UserResponse = {
      id: user._id,
      username: user.username,
      address: user.address,
      role: user.role,
      name: user.name,
      isDisabled: user.isDisabled,
      createdAt: user.createdAt,
    };

    const response: AuthResponse = { token, user: userResponse };
    res.json(response);
  }

  /**
   * Login with wallet address (creates user if not exists)
   * POST /auth/wallet
   */
  static async walletLogin(req: Request, res: Response): Promise<void> {
    const { address, proof } = req.body as WalletLoginRequest;

    if (!address) {
      throw new BadRequestError('Wallet address required');
    }

    // TODO: Verify wallet proof signature if provided
    // For now, we just trust the address

    let user = await User.findOne({ address });

    if (!user) {
      // Create new farmer user
      user = new User({
        _id: uuidv4(),
        address,
        role: 'farmer',
        isDisabled: false,
      });
      await user.save();
    }

    if (user.isDisabled) {
      throw new UnauthorizedError('Account is disabled');
    }

    const token = AuthService.createJwt(user._id, user.username || '', user.role);

    const userResponse: UserResponse = {
      id: user._id,
      username: user.username,
      address: user.address,
      role: user.role,
      name: user.name,
      isDisabled: user.isDisabled,
      createdAt: user.createdAt,
    };

    const response: AuthResponse = { token, user: userResponse };
    res.json(response);
  }

  /**
   * Get current user info
   * GET /auth/me
   */
  static async me(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    const user = await User.findById(req.user.sub);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const userResponse: UserResponse = {
      id: user._id,
      username: user.username,
      address: user.address,
      role: user.role,
      name: user.name,
      isDisabled: user.isDisabled,
      createdAt: user.createdAt,
    };

    res.json({ user: userResponse });
  }
}
