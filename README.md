# Rental Management System

A comprehensive rental management application built with the MERN stack (MongoDB replaced with PostgreSQL) that streamlines the entire rental process through a unified platform.

## 🚀 Features

### Core Functionality
- **Product Management**: Comprehensive rental product catalog with availability tracking
- **Quotations & Orders**: Create quotations, convert to orders, and manage rental contracts
- **Payment Processing**: Secure payment gateway integration with Stripe
- **Delivery Workflow**: Complete reservation, pickup, and return management
- **Automated Notifications**: Email reminders and alerts for customers and staff
- **Dynamic Pricing**: Flexible pricing models with time-based rates and discounts
- **Reports & Analytics**: Comprehensive reporting dashboard with export capabilities

### User Roles
- **Customer**: Browse products, create bookings, make payments, track orders
- **Vendor**: Manage products, process orders, handle returns, view analytics, access vendor dashboard

## 🛠 Technology Stack

- **Frontend**: React.js with JavaScript, Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with UUID primary keys
- **Authentication**: JWT-based authentication with bcrypt
- **Payment**: Stripe integration (ready for implementation)
- **Email**: Nodemailer for automated notifications
- **File Storage**: Local storage with multer
- **Development**: Nodemon for backend, Create React App for frontend

## 📁 Project Structure

```
rental-management-final/
├── frontend/                 # React.js application
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── contexts/        # React contexts
│   │   └── styles/          # CSS and styling
│   ├── package.json
│   └── tailwind.config.js
├── backend/                  # Node.js/Express.js API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── services/        # Business logic services
│   │   ├── utils/           # Utility functions
│   │   ├── config/          # Configuration files
│   │   └── scripts/         # Migration and seed scripts
│   ├── logs/                # Application logs
│   ├── uploads/             # File uploads
│   └── package.json
├── database/                 # Database scripts and schema
│   └── schema.sql           # PostgreSQL schema
├── docs/                     # Documentation
│   ├── SETUP.md             # Setup instructions
│   └── API.md               # API documentation
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rental-management-final
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration:
   - Database credentials (PostgreSQL)
   - JWT secret key
   - Email SMTP settings
   - Stripe API keys (for payment processing)

3. **Set up the database**
   ```bash
   # Connect to PostgreSQL and create database
   psql -U postgres
   CREATE DATABASE rental_management;
   \q
   ```

4. **Install backend dependencies and setup**
   ```bash
   cd backend
   npm install

   # Run database migrations
   npm run migrate

   # Seed initial data (optional)
   npm run seed
   ```

5. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

6. **Start the application**
   ```bash
   # Start backend (from backend directory)
   cd backend
   npm run dev

   # In a new terminal, start frontend
   cd frontend
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:
- Users (customers and staff)
- Products (rental items)
- Categories
- Orders and Order Items
- Quotations
- Payments
- Inventory
- Pricing Rules
- Notifications

## 🔐 Authentication & Security

- JWT-based authentication
- Role-based access control (Customer, Admin, Staff)
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Rate limiting

## 💳 Payment Integration

- Stripe payment gateway integration
- Support for multiple payment methods
- Secure payment processing
- Automatic receipt generation
- Refund processing capabilities

## 📧 Email Notifications

- Automated rental reminders
- Order confirmations
- Payment receipts
- Return notifications
- Admin alerts

## 📈 Reports & Analytics

- Most rented products
- Revenue tracking
- Customer analytics
- Export capabilities (PDF, XLSX, CSV)
- Date range filtering

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 🔧 Troubleshooting

### Common Issues

- **Database Connection**: Ensure PostgreSQL is running and credentials in `.env` are correct
- **Port Conflicts**: Change ports in `.env` if 5000 or 3000 are already in use
- **Module Errors**: Delete `node_modules` and run `npm install` again
- **Email Issues**: Verify SMTP settings and use app passwords for Gmail

For detailed troubleshooting, see `docs/SETUP.md`.

## 🚀 Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2 for the backend
3. Build the frontend with `npm run build`
4. Serve the frontend through Nginx or Apache
5. Set up SSL certificates
6. Configure production database and email settings

## 📝 API Documentation

API documentation will be available at `/api/docs` when the Swagger documentation is implemented. See `docs/API.md` for current endpoint documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.
