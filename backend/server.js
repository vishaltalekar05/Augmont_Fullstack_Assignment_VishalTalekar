const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const sequelize = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded product images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Increase server timeout so large bulk-upload/report requests don't hit
// a premature socket timeout on slower connections (defense in depth -
// the real fix is the async job + streaming design in bulkController.js)
app.use((req, res, next) => {
  res.setTimeout(120000); // 2 minutes
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'Augmont Fullstack Assignment API is running' });
});

app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Central error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: true }) // creates/updates tables automatically for this assignment
  .then(() => {
    console.log('Database connected & synced');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err.message);
  });
