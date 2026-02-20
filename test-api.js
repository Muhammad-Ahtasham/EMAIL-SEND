const axios = require('axios');

// Test the email API
async function testEmailAPI() {
  try {
    console.log('Testing Portfolio Email API...\n');

    // Test health check
    console.log('1. Testing health check endpoint...');
    const healthResponse = await axios.get('http://localhost:3000/api/health');
    console.log('Health check result:', healthResponse.data);

    // Test email sending (this will actually send an email)
    console.log('\n2. Testing email sending...');
    const emailData = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Email from API',
      message: 'This is a test message to verify the email functionality is working correctly.'
    };

    const emailResponse = await axios.post('http://localhost:3000/api/send-email', emailData);
    console.log('Email response:', emailResponse.data);

    console.log('\n✅ API test completed successfully!');
    console.log('Check your email (ahtashamahsan988@gmail.com) for the test message.');

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.data);
      console.error('Status code:', error.response.status);
    } else if (error.request) {
      console.error('❌ Network Error: Make sure the server is running on http://localhost:3000');
    } else {
      console.error('❌ Unexpected Error:', error.message);
    }
  }
}

// Run the test
testEmailAPI();