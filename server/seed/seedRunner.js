require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const { seedIfEmpty } = require('./seedData');

async function run() {
  try {
    await connectDB();
    const summary = await seedIfEmpty();
    console.log(
      `Seed complete. Products in database: ${summary.productCount}. Admin: ${summary.admin.email}`
    );
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

run();
