require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { errorHandler } = require('./middlewares/error');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const app = express();
app.use(express.json());

// Allow only two origins
const allowedOrigins = [
  'https://comradekejani.onrender.com',
  'https://comradekejaniadmin.onrender.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Test route
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
app.use('/api/v1/reports', require('./routes/reportIssueRoutes'));
app.use('/api/v1/forums', require('./routes/forumRoutes'));
app.use('/api/v1/house-views', require('./routes/HouseViewRoutes'));
app.use('/api/v1/landlord-views', require('./routes/LandlordViewRoutes'));
app.use('/api/v1/insights', require('./routes/insightsRoutes'));


app.use(errorHandler);

module.exports = app;
