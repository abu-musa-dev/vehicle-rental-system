import { Request, Response } from 'express';
import pool from '../config/db';
import { sendResponse, sendError } from '../utils/response';

export const createBooking = async (req: Request, res: Response) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Check Vehicle Availability
    const vehicleCheck = await client.query('SELECT * FROM vehicles WHERE id = $1', [vehicle_id]);
    const vehicle = vehicleCheck.rows[0];

    if (!vehicle || vehicle.availability_status !== 'available') {
      throw new Error('Vehicle is not available');
    }

    // 2. Calculate Price
    const start = new Date(rent_start_date);
    const end = new Date(rent_end_date);
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (days <= 0) throw new Error('End date must be after start date');

    const total_price = days * vehicle.daily_rent_price;

    // 3. Create Booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) 
       VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
      [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
    );

    // 4. Update Vehicle Status
    await client.query("UPDATE vehicles SET availability_status = 'booked' WHERE id = $1", [vehicle_id]);

    await client.query('COMMIT');

    // Fetch formatted data for response
    const data = {
      ...bookingResult.rows[0],
      vehicle: {
        vehicle_name: vehicle.vehicle_name,
        daily_rent_price: vehicle.daily_rent_price
      }
    };

    sendResponse(res, 201, 'Booking created successfully', data);
  } catch (error: any) {
    await client.query('ROLLBACK');
    sendError(res, 400, 'Booking failed', error.message);
  } finally {
    client.release();
  }
};

export const getAllBookings = async (req: any, res: Response) => {
  const userId = req.user.id;
  const role = req.user.role;

  try {
    let query = `
      SELECT b.*, 
             json_build_object('name', u.name, 'email', u.email) as customer,
             json_build_object('vehicle_name', v.vehicle_name, 'registration_number', v.registration_number, 'type', v.type) as vehicle
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
    `;
    
    const params: any[] = [];

    if (role === 'customer') {
      query += ` WHERE b.customer_id = $1`;
      params.push(userId);
    }

    const result = await pool.query(query, params);
    
    // Custom message based on role
    const message = role === 'admin' ? 'Bookings retrieved successfully' : 'Your bookings retrieved successfully';
    sendResponse(res, 200, message, result.rows);
  } catch (error: any) {
    sendError(res, 500, 'Error retrieving bookings', error.message);
  }
};

export const updateBookingStatus = async (req: any, res: Response) => {
  const { bookingId } = req.params;
  const { status } = req.body;
  const { role } = req.user;

  // Validation
  if (role === 'customer' && status !== 'cancelled') {
    return sendError(res, 403, 'Customers can only cancel bookings');
  }
  if (role === 'admin' && status !== 'returned') {
    return sendError(res, 403, 'Admins usually mark bookings as returned');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update Booking
    const bookingRes = await client.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, bookingId]
    );

    if (bookingRes.rows.length === 0) throw new Error('Booking not found');
    const booking = bookingRes.rows[0];

    // If returned or cancelled, make vehicle available
    if (status === 'returned' || status === 'cancelled') {
      await client.query(
        "UPDATE vehicles SET availability_status = 'available' WHERE id = $1",
        [booking.vehicle_id]
      );
    }

    await client.query('COMMIT');

    const responseData = {
      ...booking,
      vehicle: { availability_status: 'available' }
    };
    
    const message = status === 'returned' 
      ? 'Booking marked as returned. Vehicle is now available' 
      : 'Booking cancelled successfully';

    sendResponse(res, 200, message, responseData);

  } catch (error: any) {
    await client.query('ROLLBACK');
    sendError(res, 400, 'Update failed', error.message);
  } finally {
    client.release();
  }
};