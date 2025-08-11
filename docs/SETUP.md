# Rental Management System - Setup Guide

This guide will help you set up the Rental Management System on your local development environment.

> **Note**: This application has been migrated from PostgreSQL to MongoDB. All setup instructions reflect the current MongoDB implementation.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Download here](https://www.mongodb.com/try/download/community)
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
# Database Configuration (MongoDB)
MONGODB_URI=mongodb://localhost:27017/rental_management

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

Start MongoDB service:

```bash
# On Windows (if installed as service)
net start MongoDB

# On macOS (using Homebrew)
brew services start mongodb-community

# On Linux (using systemd)
sudo systemctl start mongod

# Or run MongoDB manually
mongod --dbpath /path/to/your/data/directory
```

MongoDB will automatically create the `rental_management` database when the application first connects.

### 4. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Seed initial data (creates demo users, categories, and products)
node seed-mongodb.js

# Start the backend development server
node mongodb-server.js
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
3. **Database**: MongoDB should be connected and collections created automatically
4. **Test Login**: Use the default admin account (admin@rental.com / admin123) to test authentication

If everything is working correctly, you should be able to:

- Navigate the homepage and products page
- View product categories and listings
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

The application uses MongoDB with the following key features:

- ObjectId primary keys for all documents
- Mongoose ODM for schema validation and relationships
- Proper document relationships using references
- Indexes for performance optimization (text search, unique constraints)
- Flexible schema design for product specifications and inventory

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

   - Ensure MongoDB service is running: `sudo systemctl start mongod` (Linux) or `net start MongoDB` (Windows)
   - Verify MongoDB URI in `.env` file (default: `mongodb://localhost:27017/rental_management`)
   - Check if MongoDB is listening on the correct port (default 27017)
   - Test connection: `mongo` or `mongosh` command line

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

5. **Database Seeding Errors**
   - Ensure MongoDB service is running before seeding
   - Check if collections already exist (MongoDB will create them automatically)
   - Try dropping the database if needed: `mongo rental_management --eval "db.dropDatabase()"`
   - Verify MongoDB version compatibility (v5.0 or higher recommended)

### Logs

Backend logs are stored in:

- `backend/logs/combined-YYYY-MM-DD.log` - All logs
- `backend/logs/error-YYYY-MM-DD.log` - Error logs only

## Development Workflow

1. **Start Backend Development Server**

   ```bash
   cd backend
   node mongodb-server.js  # Starts MongoDB server on port 5000
   ```

2. **Start Frontend Development Server**

   ```bash
   cd frontend
   npm start    # Starts with hot reload on port 3000
   ```

3. **Database Operations**

   ```bash
   cd backend
   node seed-mongodb.js     # Seed test data (users, categories, products)
   node check-db.js         # Check database contents
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
