# Rental Management System - Setup Guide

This guide will help you set up the Rental Management System on your local development environment.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)
- **npm** or **yarn** package manager

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rental-management-final
```

### 2. Environment Setup

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rental_management
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Stripe Configuration (get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
```

### 3. Database Setup

Create a PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE rental_management;

# Exit PostgreSQL
\q
```

### 4. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run database migrations to create tables
npm run migrate

# Seed initial data (optional - creates demo users and products)
npm run seed

# Start the backend development server
npm run dev
```

The backend server will start on `http://localhost:5000`

**Note**: The backend uses nodemon for development, so it will automatically restart when you make changes to the code.

### 5. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm start
```

The frontend application will start on `http://localhost:3000`

**Note**: The React development server includes hot reloading, so changes will be reflected immediately in the browser.

### 6. Verify Installation

Once both servers are running, verify the installation:

1. **Frontend**: Visit `http://localhost:3000` - you should see the RentEasy homepage
2. **Backend**: Visit `http://localhost:5000/health` - you should see a health check response
3. **Database**: The migration should have created all necessary tables
4. **Test Login**: Use the default admin account (admin@rental.com / admin123) to test authentication

If everything is working correctly, you should be able to:
- Navigate the homepage
- Register a new account
- Login with existing accounts
- Access the dashboard (customer) or admin panel (admin/staff)



## Default Accounts

After seeding the database, you can use these default accounts:

### Admin Account
- **Email**: admin@rental.com
- **Password**: admin123
- **Role**: Admin

### Staff Account
- **Email**: staff@rental.com
- **Password**: staff123
- **Role**: Staff

### Customer Account
- **Email**: customer@rental.com
- **Password**: customer123
- **Role**: Customer

## Configuration Details

### Database Configuration

The application uses PostgreSQL with the following key features:
- UUID primary keys for all tables
- Audit logging for important operations
- Proper foreign key relationships
- Indexes for performance optimization

### Email Configuration

For development, you can use:
1. **Gmail SMTP** (recommended for testing)
2. **Ethereal Email** (fake SMTP service for testing)
3. **Local SMTP server** (like MailHog)

#### Gmail Setup:
1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in EMAIL_PASSWORD

### Stripe Configuration

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your test API keys from the Stripe Dashboard
3. Add them to your `.env` file
4. For production, use live API keys

### File Upload Configuration

By default, files are stored locally in the `uploads` directory. For production, consider using cloud storage like AWS S3.

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL service is running: `sudo service postgresql start` (Linux) or check Services (Windows)
   - Verify database credentials in `.env` file
   - Confirm database exists: `psql -U postgres -l`
   - Check if PostgreSQL is listening on the correct port (default 5432)

2. **Port Already in Use**
   - Backend port 5000 conflict: Change PORT in `.env` file or kill process: `lsof -ti:5000 | xargs kill -9` (Mac/Linux)
   - Frontend port 3000 conflict: React will automatically suggest an alternative port
   - Check what's using the port: `netstat -tulpn | grep :5000` (Linux) or `netstat -ano | findstr :5000` (Windows)

3. **Module Not Found Errors**
   - Delete `node_modules` and `package-lock.json` in both backend and frontend directories
   - Run `npm install` again in each directory
   - Ensure you're using Node.js v16 or higher: `node --version`

4. **Email Not Sending**
   - Check email configuration in `.env` file
   - Verify SMTP credentials and server settings
   - For Gmail: Enable 2FA and use App Password instead of regular password
   - Check firewall settings and ensure SMTP ports (587/465) are not blocked

5. **Database Migration Errors**
   - Ensure PostgreSQL user has proper permissions
   - Check if database schema already exists
   - Try dropping and recreating the database if needed
   - Verify PostgreSQL version compatibility (v12 or higher recommended)

### Logs

Backend logs are stored in:
- `backend/logs/combined-YYYY-MM-DD.log` - All logs
- `backend/logs/error-YYYY-MM-DD.log` - Error logs only

## Development Workflow

1. **Start Backend Development Server**
   ```bash
   cd backend
   npm run dev  # Starts with nodemon for auto-restart on port 5000
   ```

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm start    # Starts with hot reload on port 3000
   ```

3. **Database Operations**
   ```bash
   cd backend
   npm run migrate  # Run database migrations
   npm run seed     # Seed test data
   ```

4. **Running Tests**
   ```bash
   # Backend tests
   cd backend
   npm test

   # Frontend tests
   cd frontend
   npm test
   ```

## Next Steps

After successful setup:

1. **Explore the Application**
   - Visit `http://localhost:3000` to access the frontend
   - Login with default accounts (see Default Accounts section)
   - Test core functionality

2. **API Documentation**
   - Visit `http://localhost:5000/api/docs` for Swagger documentation (when implemented)
   - Test API endpoints using the provided examples

3. **Customize Configuration**
   - Update branding and styling in the frontend
   - Configure payment methods (Stripe integration)
   - Set up email templates and SMTP settings

4. **Production Deployment**
   - Configure production environment variables
   - Set up SSL certificates
   - Use a process manager like PM2 for the backend
   - Serve the frontend through a web server like Nginx

## Support

If you encounter any issues during setup:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all prerequisites are properly installed
4. Verify environment variables are correctly set

For additional help, please refer to the project documentation or create an issue in the repository.
