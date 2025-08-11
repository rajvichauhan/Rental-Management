const http = require('http');

const testLogin = (email, password, userType) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: email,
      password: password
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`\n=== ${userType.toUpperCase()} LOGIN TEST ===`);
          
          if (response.success && response.data.user) {
            console.log('✅ LOGIN SUCCESSFUL!');
            console.log('Email:', response.data.user.email);
            console.log('Name:', response.data.user.firstName, response.data.user.lastName);
            console.log('Role:', response.data.user.role);
            console.log('Active:', response.data.user.isActive);
            console.log('Token:', response.data.token ? 'Generated' : 'Not generated');
            resolve({ success: true, user: response.data.user, token: response.data.token });
          } else {
            console.log('❌ LOGIN FAILED!');
            console.log('Status:', res.statusCode);
            console.log('Error:', response.message || 'Unknown error');
            resolve({ success: false, error: response.message });
          }
        } catch (error) {
          console.log('❌ RESPONSE PARSING ERROR:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ REQUEST ERROR for ${userType}:`, error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

const runFinalTests = async () => {
  console.log('🎯 FINAL LOGIN FUNCTIONALITY TEST');
  console.log('==================================');

  try {
    // Test vendor login
    const vendorResult = await testLogin('vendor@renteasy.com', 'vendor123', 'vendor');
    
    // Test customer login  
    const customerResult = await testLogin('customer@renteasy.com', 'customer123', 'customer');
    
    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log('Vendor Login:', vendorResult.success ? '✅ WORKING' : '❌ FAILED');
    console.log('Customer Login:', customerResult.success ? '✅ WORKING' : '❌ FAILED');
    
    if (vendorResult.success && vendorResult.user.role === 'vendor') {
      console.log('\n🎉 VENDOR ACCOUNT READY FOR USE!');
      console.log('   - Email: vendor@renteasy.com');
      console.log('   - Password: vendor123');
      console.log('   - Role: vendor ✅');
      console.log('   - Dashboard: /vendor-dashboard');
    }
    
    if (customerResult.success && customerResult.user.role === 'customer') {
      console.log('\n🎉 CUSTOMER ACCOUNT READY FOR USE!');
      console.log('   - Email: customer@renteasy.com');
      console.log('   - Password: customer123');
      console.log('   - Role: customer ✅');
      console.log('   - Dashboard: /dashboard');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
};

runFinalTests();
