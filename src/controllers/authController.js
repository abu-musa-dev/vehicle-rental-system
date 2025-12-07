import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { sendResponse, sendError } from '../utils/response';
export const signup = async (req, res) => {
    const { name, email, password, phone, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS));
        const result = await pool.query('INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role', [name, email.toLowerCase(), hashedPassword, phone, role]);
        sendResponse(res, 201, 'User registered successfully', result.rows[0]);
    }
    catch (error) {
        sendError(res, 400, 'Registration failed', error.detail || error.message);
    }
};
export const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
        if (result.rows.length === 0)
            return sendError(res, 404, 'User not found');
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return sendError(res, 401, 'Invalid credentials');
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        // Remove password from response
        delete user.password;
        sendResponse(res, 200, 'Login successful', { token, user });
    }
    catch (error) {
        sendError(res, 500, 'Login failed', error.message);
    }
};
