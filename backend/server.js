const http = require('http');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const app = require('./app');

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
