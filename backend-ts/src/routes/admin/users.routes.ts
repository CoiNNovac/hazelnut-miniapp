import { Router } from 'express';
import { UserController } from '../../controllers/UserController';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin, requireSuperAdmin } from '../../middleware/admin.middleware';
import { asyncHandler } from '../../middleware/error.middleware';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// GET /admin/users - List all users
router.get('/', asyncHandler(UserController.list));

// GET /admin/users/:id - Get user by ID
router.get('/:id', asyncHandler(UserController.getById));

// POST /admin/users - Create new user (superadmin only for admin roles)
router.post('/', asyncHandler(UserController.create));

// PUT /admin/users/:id/disable - Disable user
router.put('/:id/disable', asyncHandler(UserController.disable));

// PUT /admin/users/:id/enable - Enable user
router.put('/:id/enable', asyncHandler(UserController.enable));

// DELETE /admin/users/:id - Delete user
router.delete('/:id', requireSuperAdmin, asyncHandler(UserController.delete));

export default router;
