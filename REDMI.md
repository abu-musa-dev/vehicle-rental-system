 🚗 Vehicle Rental System Backend

A comprehensive backend API for a vehicle rental management system. This system handles vehicle inventory, customer management, bookings, and role-based authentication (Admin & Customer).

## 🚀 Live Demo
**Base URL:** `https://your-project-url.vercel.app`  
*(Replace with your actual Vercel deployment link)*

## 🛠️ Technology Stack
- **Language:** TypeScript
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (Supabase/Neon/Local)
- **Authentication:** JWT & Bcrypt
- **Deployment:** Vercel

## ✨ Features
- **User Authentication:** Sign up, Sign in, JWT-based protection.
- **Role-Based Access Control (RBAC):** 
  - **Admin:** Manage vehicles, users, and all bookings.
  - **Customer:** Browse vehicles, book vehicles, manage own bookings.
- **Vehicle Management:** CRUD operations for vehicle inventory.
- **Booking System:**
  - Automatic price calculation based on duration.
  - Vehicle availability status updates (Available ↔ Booked).
  - Handle overlapping bookings.
- **Database:** Relational schema with Foreign Keys and Constraints.

## 📂 Project Structure
```bash
src/
├── config/         # Database connection
├── controllers/    # Business logic
├── middleware/     # Auth & Error handling
├── routes/         # API Routes
├── utils/          # Helper functions
├── app.ts          # App configuration
└── server.ts       # Entry point
⚙️ Installation & Setup
1. Clone the repository
code
Bash
git clone <your-repo-link>
cd vehicle-rental-system
2. Install Dependencies
code
Bash
npm install
3. Environment Variables
Create a .env file in the root directory and add the following:
code
Env
PORT=5000
NODE_ENV=development

# Database Configuration (For Local or Cloud)
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name
DB_SSL=true  # Set 'true' for Cloud DB (Supabase/Neon), 'false' for Local

# Security
JWT_SECRET=your_super_secret_key
BCRYPT_SALT_ROUNDS=10
4. Run the Project
Development Mode:
code
Bash
npm run dev
Production Build:
code
Bash
npm run build
npm start
🗄️ Database Schema
The system creates tables automatically upon connection. The schema includes:
Users: Stores customer and admin info.
Vehicles: Stores car/bike details and availability.
Bookings: Relates Users and Vehicles with rental dates and cost.
🔗 API Endpoints
🔐 Authentication
POST /api/v1/auth/signup - Register a new user
POST /api/v1/auth/signin - Login & get Token
🚗 Vehicles
POST /api/v1/vehicles - Create Vehicle (Admin)
GET /api/v1/vehicles - Get All Vehicles (Public)
GET /api/v1/vehicles/:id - Get Single Vehicle (Public)
PUT /api/v1/vehicles/:id - Update Vehicle (Admin)
DELETE /api/v1/vehicles/:id - Delete Vehicle (Admin)
📅 Bookings
POST /api/v1/bookings - Create a Booking (Customer)
GET /api/v1/bookings - Get Bookings (Admin: All, Customer: Own)
PUT /api/v1/bookings/:id - Return Vehicle (Admin) / Cancel Booking (Customer)
👥 Users
GET /api/v1/users - Get All Users (Admin)
PUT /api/v1/users/:id - Update Profile
DELETE /api/v1/users/:id - Delete User (Admin)
🧪 Testing
You can test the API using Postman.
Import the collection or hit the endpoints manually.
For protected routes, add the header: Authorization: Bearer <your_token>