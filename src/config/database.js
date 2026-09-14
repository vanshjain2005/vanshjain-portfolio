const mongoose = require('mongoose');
const seedInitialData = require('./seed');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';

let isConnected = false;

async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    await mongoose.connect(MONGODB_URI, opts);
    isConnected = true;
    console.log(`[MONGODB] Connected successfully to: ${MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')}`);

    // Automatically seed initial data if empty
    await seedInitialData();

    return mongoose.connection;
  } catch (err) {
    console.error(`[MONGODB ERROR] Failed to connect to ${MONGODB_URI}:`, err.message);
    // Don't throw fatal in serverless without remote URI, allows graceful health check
    return null;
  }
}

module.exports = {
  connectDB,
  mongoose
};
