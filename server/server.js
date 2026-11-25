const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const { connectDB } = require('./config/db');
const { getUploadBaseDir, ensureDir } = require('./middleware/uploadMiddleware');
const { seedIfEmpty } = require('./seed/seedData');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const customRequestRoutes = require('./routes/customRequestRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = getUploadBaseDir();
ensureDir(path.join(uploadDir, 'products'));
ensureDir(path.join(uploadDir, 'models'));
app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'GoaPrintLab API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/custom-requests', customRequestRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/*', (_req, res) => {
  res.status(404).json({ message: 'API endpoint not found.' });
});

const clientDistPath = path.resolve(__dirname, '../client/dist');
const clientIndexPath = path.join(clientDistPath, 'index.html');
if (fs.existsSync(clientIndexPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(clientIndexPath);
  });
}

app.use((err, _req, res, _next) => {
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ message: `File upload error: ${err.message}` });
  }
  if (err) {
    return res.status(err.status || 400).json({ message: err.message || 'Request failed.' });
  }
  return res.status(500).json({ message: 'Internal server error.' });
});

async function startServer() {
  await connectDB();
  await seedIfEmpty();

  const port = Number(process.env.PORT) || 5000;
  const server = app.listen(port, () => {
    console.log(`GoaPrintLab backend running on http://localhost:${port}`);
  });
  return server;
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Failed to start GoaPrintLab server:', err);
    process.exit(1);
  });
}

module.exports = { app, startServer };
