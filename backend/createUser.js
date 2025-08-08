const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createUser = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    // Créer l'utilisateur
    const userData = {
      firstName: 'Romain',
      lastName: 'Tivolle',
      email: 'rtivolle@example.com',
      password: 'Santos24!!'
    };

    const user = await User.create(userData);
    console.log('User created successfully:', {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt
    });

  } catch (error) {
    console.error('Error creating user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

createUser();
