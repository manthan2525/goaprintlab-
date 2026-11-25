const mongoose = require('mongoose');

let memoryServer = null;

/**
 * Connects to MongoDB using MONGO_URI.
 * If a local MongoDB instance is unavailable, starts an embedded
 * MongoMemoryServer so the application runs cleanly without manual setup.
 */
async function connectDB() {
  const configuredUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/goaprintlab';
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd && !process.env.MONGO_URI) {
    throw new Error(
      'MONGO_URI environment variable is required in production. Set it to your MongoDB Atlas URI.'
    );
  }

  try {
    await mongoose.connect(configuredUri, {
      serverSelectionTimeoutMS: isProd ? 10000 : 3000,
    });
    console.log('MongoDB connected successfully.');
    return { mode: 'external', uri: configuredUri };
  } catch (err) {
    const isLocalUri =
      configuredUri.includes('127.0.0.1') || configuredUri.includes('localhost');

    if (isProd || !isLocalUri || process.env.DISABLE_MEMORY_DB === 'true') {
      console.error('Failed to connect to MongoDB:', err.message);
      throw err;
    }

    console.warn(
      `Local MongoDB not reachable (${err.message}). Starting embedded MongoMemoryServer...`
    );
    const fs = require('fs');
    const path = require('path');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const cachedBinary = path.resolve(
      __dirname,
      '../node_modules/.cache/mongodb-memory-server/mongod-x64-win32-6.0.14.exe'
    );
    const memoryOptions = { instance: { dbName: 'goaprintlab' } };
    if (fs.existsSync(cachedBinary)) {
      memoryOptions.binary = {
        version: '6.0.14',
        downloadDir: path.dirname(cachedBinary),
      };
    }
    memoryServer = await MongoMemoryServer.create(memoryOptions);
    const memoryUri = memoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`MongoMemoryServer connected: ${memoryUri}`);
    return { mode: 'memory', uri: memoryUri };
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

module.exports = { connectDB, disconnectDB };
