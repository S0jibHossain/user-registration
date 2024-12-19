const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());


connectDB();


app.use('/api', authRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
