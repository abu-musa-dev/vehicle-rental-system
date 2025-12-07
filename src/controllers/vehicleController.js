import pool from '../config/db';
import { sendResponse, sendError } from '../utils/response';
export const createVehicle = async (req, res) => {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;
    try {
        const result = await pool.query('INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES ($1, $2, $3, $4, $5) RETURNING *', [vehicle_name, type, registration_number, daily_rent_price, availability_status]);
        sendResponse(res, 201, 'Vehicle created successfully', result.rows[0]);
    }
    catch (error) {
        sendError(res, 400, 'Failed to create vehicle', error.message);
    }
};
export const getAllVehicles = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vehicles');
        if (result.rows.length === 0)
            return sendResponse(res, 200, 'No vehicles found', []);
        sendResponse(res, 200, 'Vehicles retrieved successfully', result.rows);
    }
    catch (error) {
        sendError(res, 500, 'Error retrieving vehicles', error.message);
    }
};
export const getVehicleById = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);
        if (result.rows.length === 0)
            return sendError(res, 404, 'Vehicle not found');
        sendResponse(res, 200, 'Vehicle retrieved successfully', result.rows[0]);
    }
    catch (error) {
        sendError(res, 500, 'Error retrieving vehicle', error.message);
    }
};
export const updateVehicle = async (req, res) => {
    const { vehicleId } = req.params;
    const updates = req.body;
    // Build dynamic query
    const fields = Object.keys(updates).map((key, idx) => `${key} = $${idx + 2}`).join(', ');
    const values = Object.values(updates);
    try {
        const result = await pool.query(`UPDATE vehicles SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`, [vehicleId, ...values]);
        if (result.rows.length === 0)
            return sendError(res, 404, 'Vehicle not found');
        sendResponse(res, 200, 'Vehicle updated successfully', result.rows[0]);
    }
    catch (error) {
        sendError(res, 400, 'Update failed', error.message);
    }
};
export const deleteVehicle = async (req, res) => {
    const { vehicleId } = req.params;
    try {
        // Check for active bookings
        const activeBookings = await pool.query("SELECT * FROM bookings WHERE vehicle_id = $1 AND status = 'active'", [vehicleId]);
        if (activeBookings.rows.length > 0) {
            return sendError(res, 400, 'Cannot delete vehicle with active bookings');
        }
        const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [vehicleId]);
        if (result.rows.length === 0)
            return sendError(res, 404, 'Vehicle not found');
        sendResponse(res, 200, 'Vehicle deleted successfully');
    }
    catch (error) {
        sendError(res, 500, 'Delete failed', error.message);
    }
};
