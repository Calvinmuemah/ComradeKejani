require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
connectDB();

const { errorHandler } = require('./middlewares/error');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const app = express();
app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (req, res) => {
  res.send('Welcome to ComradeKejani API');
});

// Routes
app.use('/api/v1/admin', require('./routes/users'));
app.use('/api/v1/landlords', require('./routes/landLord'));
app.use('/api/v1/houses', require('./routes/houseRoutes'));
app.use('/api/v1/upload', require('./routes/apload'));
app.use('/api/v1/reviews', require('./routes/reviewsRoutes'));
app.use('/api/v1/notifications', require('./routes/notificationsRoutes'));

app.use(errorHandler);

// Attach HTTP
const server = http.createServer(app);

// Run Server
const PORT = process.env.PORT;
server.listen(PORT, () =>
  console.log(`server running on port ${PORT}`)
);