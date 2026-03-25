const axios = require('axios');

const baseURL = 'http://localhost:8081/api';

async function test() {
    console.log('--- Testing Registration ---');
    try {
        const regRes = await axios.post(`${baseURL}/auth/register`, {
            name: 'Test User 2',
            email: `test${Date.now()}@example.com`,
            password: 'password123',
            phone: '1234567890'
        });
        console.log('Registration Success:', regRes.data);
    } catch (e) {
        console.log('Registration Error:', e.response?.data || e.message);
    }

    console.log('\n--- Testing Login ---');
    try {
        const loginRes = await axios.post(`${baseURL}/auth/login`, {
            email: 'admin@bookverse.com',
            password: 'admin123'
        });
        console.log('Login Success (Admin):', loginRes.data.user.role);
    } catch (e) {
        console.log('Login Error:', e.response?.data || e.message);
    }
}

test();
