-- Rental Management System Database Schema
-- PostgreSQL Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'staff');
CREATE TYPE order_status AS ENUM ('draft', 'confirmed', 'reserved', 'picked_up', 'returned', 'cancelled', 'overdue');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'partial');
CREATE TYPE payment_method AS ENUM ('stripe', 'paypal', 'cash', 'bank_transfer');
CREATE TYPE pricing_type AS ENUM ('hourly', 'daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE notification_type AS ENUM ('email', 'sms', 'push');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role user_role DEFAULT 'customer',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User addresses table
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'billing', -- billing, shipping
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    sku VARCHAR(100) UNIQUE NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    condition VARCHAR(50) DEFAULT 'excellent',
    purchase_price DECIMAL(10,2),
    replacement_value DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    requires_deposit BOOLEAN DEFAULT false,
    deposit_amount DECIMAL(10,2),
    min_rental_period INTEGER DEFAULT 1, -- in hours
    max_rental_period INTEGER, -- in hours
    advance_booking_days INTEGER DEFAULT 0,
    late_fee_per_day DECIMAL(10,2) DEFAULT 0,
    images JSONB, -- Array of image URLs
    specifications JSONB, -- Product specifications
    accessories JSONB, -- Included accessories
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product inventory table
CREATE TABLE product_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    serial_number VARCHAR(100),
    condition VARCHAR(50) DEFAULT 'excellent',
    is_available BOOLEAN DEFAULT true,
    location VARCHAR(100),
    notes TEXT,
    last_maintenance DATE,
    next_maintenance DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pricing rules table
CREATE TABLE pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    pricing_type pricing_type NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER,
    customer_type VARCHAR(50), -- regular, premium, corporate
    valid_from DATE,
    valid_to DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_product_or_category CHECK (
        (product_id IS NOT NULL AND category_id IS NULL) OR 
        (product_id IS NULL AND category_id IS NOT NULL)
    )
);

-- Quotations table
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES users(id),
    staff_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'draft',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    quotation_id UUID REFERENCES quotations(id),
    customer_id UUID NOT NULL REFERENCES users(id),
    staff_id UUID REFERENCES users(id),
    status order_status DEFAULT 'draft',
    rental_start TIMESTAMP NOT NULL,
    rental_end TIMESTAMP NOT NULL,
    actual_pickup TIMESTAMP,
    actual_return TIMESTAMP,
    pickup_address JSONB,
    return_address JSONB,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    late_fees DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table (for both quotations and orders)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    inventory_id UUID REFERENCES product_inventory(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    rental_start TIMESTAMP,
    rental_end TIMESTAMP,
    pricing_type pricing_type NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_order_or_quotation CHECK (
        (order_id IS NOT NULL AND quotation_id IS NULL) OR 
        (order_id IS NULL AND quotation_id IS NOT NULL)
    )
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    payment_intent_id VARCHAR(255), -- Stripe payment intent ID
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method payment_method NOT NULL,
    status payment_status DEFAULT 'pending',
    transaction_id VARCHAR(255),
    gateway_response JSONB,
    processed_at TIMESTAMP,
    refunded_amount DECIMAL(10,2) DEFAULT 0,
    refunded_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status notification_status DEFAULT 'pending',
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_inventory_product ON product_inventory(product_id);
CREATE INDEX idx_inventory_available ON product_inventory(is_available);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_dates ON orders(rental_start, rental_end);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON user_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_inventory_updated_at BEFORE UPDATE ON product_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON pricing_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
