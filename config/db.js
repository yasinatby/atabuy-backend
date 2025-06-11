// config/db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
  try {
    // process.env.MONGO_URI kommt aus der .env-Datei
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // je nach Mongoose-Version können hier noch weitere Optionen nötig sein
    });
    console.log('✅ MongoDB verbunden');
  } catch (err) {
    console.error('❌ MongoDB-Verbindungsfehler:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
