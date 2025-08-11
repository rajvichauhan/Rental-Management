const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

const createSampleUsers = async () => {
  try {
    console.log('Creating sample users via API...');

    // Create sample vendor
    try {
      const vendorResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: 'vendor@renteasy.com',
        password: 'vendor123',
        firstName: 'John',
        lastName: 'Vendor',
        phone: '+1234567890',
        role: 'vendor'
      });
      
      console.log('✅ Sample vendor created successfully!');
      console.log('Email: vendor@renteasy.com');
      console.log('Password: vendor123');
      console.log('Role: vendor');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('✅ Sample vendor already exists!');
        console.log('Email: vendor@renteasy.com');
        console.log('Password: vendor123');
        console.log('Role: vendor');
      } else {
        console.error('Error creating vendor:', error.response?.data || error.message);
      }
    }

    console.log('');

    // Create sample customer
    try {
      const customerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: 'customer@renteasy.com',
        password: 'customer123',
        firstName: 'Jane',
        lastName: 'Customer',
        phone: '+1234567891',
        role: 'customer'
      });
      
      console.log('✅ Sample customer created successfully!');
      console.log('Email: customer@renteasy.com');
      console.log('Password: customer123');
      console.log('Role: customer');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('✅ Sample customer already exists!');
        console.log('Email: customer@renteasy.com');
        console.log('Password: customer123');
        console.log('Role: customer');
      } else {
        console.error('Error creating customer:', error.response?.data || error.message);
      }
    }

    console.log('');
    console.log('=== SAMPLE LOGIN CREDENTIALS ===');
    console.log('');
    console.log('VENDOR LOGIN:');
    console.log('Email: vendor@renteasy.com');
    console.log('Password: vendor123');
    console.log('→ Will redirect to /vendor-dashboard');
    console.log('');
    console.log('CUSTOMER LOGIN:');
    console.log('Email: customer@renteasy.com');
    console.log('Password: customer123');
    console.log('→ Will redirect to /dashboard');

  } catch (error) {
    console.error('Error:', error.message);
    console.log('');
    console.log('Make sure the backend server is running on http://localhost:5000');
    console.log('You can start it with: npm run dev');
  }
};

createSampleUsers();
