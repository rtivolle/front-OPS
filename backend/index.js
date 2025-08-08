require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

const app = express();

// Body parser middleware
app.use(express.json({ limit: '10mb' }));

// A simple test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Mount auth routes
app.use('/api/auth', require('./routes/auth'));

// Mount storage and files routes
app.use('/api/storage', require('./routes/storage'));
app.use('/api/files', require('./routes/files'));

// Mount pipeline callback route
app.use('/api/pipeline', require('./routes/pipeline'));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
