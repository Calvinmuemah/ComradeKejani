require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');

const connectDB = require('./config/db');
connectDB();

const { errorHandler } = require('./middlewares/error');
const app = express();
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
  res.send('Welcome to Code Clash API');
});
// Routes
app.use('/api', require('./routes/users'));
app.use('/api/landlords', require('./routes/landLord'));
app.use('/api/houses', require('./routes/houseRoutes'));
app.use('/api/reviews', require('./routes/reviewsRoutes'));
app.use('/api/notifications', require('./routes/notificationsRoutes'));

app.use(errorHandler);

// Attach HTTP
const server = http.createServer(app);

// Run Server
const PORT = process.env.PORT;
server.listen(PORT, () =>
  console.log(`server running on port ${PORT}`)
);
