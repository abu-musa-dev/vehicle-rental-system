import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db'; //  connection
// Import Routes
import authRoutes from './routes/authRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import bookingRoutes from './routes/bookingRoutes';
import userRoutes from './routes/userRoutes';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🚗 Vehicle Rental System API is Running Successfully!',
        timestamp: new Date().toISOString(),
    });
});
// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/users', userRoutes);
// Function to create tables if not exists
async function createTables() {
    try {
        await pool.query(`
      -- Users Table
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          role VARCHAR(10) CHECK (role IN ('admin', 'customer')) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Vehicles Table
      CREATE TABLE IF NOT EXISTS vehicles (
          id SERIAL PRIMARY KEY,
          vehicle_name VARCHAR(100) NOT NULL,
          type VARCHAR(20) CHECK (type IN ('car', 'bike', 'van', 'SUV')) NOT NULL,
          registration_number VARCHAR(50) UNIQUE NOT NULL,
          daily_rent_price DECIMAL(10, 2) NOT NULL,
          availability_status VARCHAR(20) CHECK (availability_status IN ('available', 'booked')) DEFAULT 'available',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Bookings Table
      CREATE TABLE IF NOT EXISTS bookings (
          id SERIAL PRIMARY KEY,
          customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
          rent_start_date TIMESTAMP NOT NULL,
          rent_end_date TIMESTAMP NOT NULL,
          total_price DECIMAL(10, 2) NOT NULL,
          status VARCHAR(20) CHECK (status IN ('active', 'cancelled', 'returned')) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Tables created or already exist');
    }
    catch (err) {
        console.error('❌ Error creating tables:', err);
    }
}
// Test DB connection + create tables
pool.connect()
    .then(async (client) => {
    console.log('✅ Connected to PostgreSQL ');
    client.release();
    await createTables();
})
    .catch(err => console.error('❌ DB Connection Error:', err.stack));
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        errors: err.message,
    });
});
// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API Endpoint Not Found',
    });
});
// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
