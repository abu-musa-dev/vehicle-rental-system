import { Router } from 'express';
import { getAllUsers, updateUser, deleteUser } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/authMiddleware';
const router = Router();
router.get('/', authenticate, authorize(['admin']), getAllUsers);
router.put('/:userId', authenticate, updateUser);
router.delete('/:userId', authenticate, authorize(['admin']), deleteUser);
export default router;
