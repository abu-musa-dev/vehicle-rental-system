import { Router } from 'express';
import { createBooking, getAllBookings, updateBookingStatus } from '../controllers/bookingController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticate, createBooking);
router.get('/', authenticate, getAllBookings);
router.put('/:bookingId', authenticate, updateBookingStatus);

export default router;