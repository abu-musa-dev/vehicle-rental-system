import { Request, Response } from 'express';
import pool from '../config/db';
import { sendResponse, sendError } from '../utils/response';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, name, email, phone, role FROM users');
    sendResponse(res, 200, 'Users retrieved successfully', result.rows);
  } catch (error: any) {
    sendError(res, 500, 'Error fetching users', error.message);
  }
};

export const updateUser = async (req: any, res: Response) => {
  const { userId } = req.params;
  const updates = req.body;
  const requestingUser = req.user;

  // Authorization Check
  if (requestingUser.role !== 'admin' && requestingUser.id != userId) {
    return sendError(res, 403, 'You can only update your own profile');
  }

  const fields = Object.keys(updates).map((key, idx) => `${key} = $${idx + 2}`).join(', ');
  const values = Object.values(updates);

  try {
    const result = await pool.query(
      `UPDATE users SET ${fields} WHERE id = $1 RETURNING id, name, email, phone, role`,
      [userId, ...values]
    );
    sendResponse(res, 200, 'User updated successfully', result.rows[0]);
  } catch (error: any) {
    sendError(res, 400, 'Update failed', error.message);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    // Check for active bookings
    const activeBookings = await pool.query(
      "SELECT * FROM bookings WHERE customer_id = $1 AND status = 'active'",
      [userId]
    );
    if (activeBookings.rows.length > 0) {
      return sendError(res, 400, 'Cannot delete user with active bookings');
    }

    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    sendResponse(res, 200, 'User deleted successfully');
  } catch (error: any) {
    sendError(res, 500, 'Delete failed', error.message);
  }
};