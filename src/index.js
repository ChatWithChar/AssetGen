const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const assetRoutes = require('./routes/assetRoutes');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// No static file serving - assets are saved locally

// API routes
app.use('/api', assetRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'AssetGen API',
    description: 'API for generating visual assets from text descriptions',
    version: '1.0.0',
    endpoints: {
      generate: '/api/generate',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred',
  });
});

// Start the server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
  console.log(`Asset storage path: ${config.assetStorage.path}`);
});
