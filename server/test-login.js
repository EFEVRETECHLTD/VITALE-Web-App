const axios = require('axios');

const API_URL = 'http://localhost:3001';

// Test user credentials
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  jobPosition: 'Lab Technician'
};

// Function to register a new user
async function registerUser() {
  try {
    console.log('Registering new user...');
    const response = await axios.post(`${API_URL}/api/users/register`, testUser);
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Function to login
async function loginUser() {
  try {
    console.log('Logging in...');
    const response = await axios.post(`${API_URL}/api/users/login`, {
      username: testUser.username,
      password: testUser.password
    });
    console.log('Login successful!');
    console.log('User data:', response.data.user);
    console.log('Token:', response.data.token);
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Function to test admin login
async function loginAdmin() {
  try {
    console.log('Logging in as admin...');
    const response = await axios.post(`${API_URL}/api/users/login`, {
      username: 'admin',
      password: 'admin123'
    });
    console.log('Admin login successful!');
    console.log('User data:', response.data.user);
    console.log('Token:', response.data.token);
    return response.data;
  } catch (error) {
    console.error('Admin login error:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Run tests
async function runTests() {
  console.log('Starting tests...');
  
  // Try admin login first
  await loginAdmin();
  
  // Register a new user
  await registerUser();
  
  // Login with the new user
  await loginUser();
  
  console.log('Tests completed.');
}

// Run the tests
runTests();
