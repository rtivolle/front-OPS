const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('Testing login with credentials: rtivolle@example.com / Santos24!!');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'rtivolle@example.com',
      password: 'Santos24!!'
    });

    console.log('Login successful!');
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
  }
};


testLogin();
