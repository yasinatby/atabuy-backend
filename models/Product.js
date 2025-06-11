// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
    image: {
      type: String,
      default: '', // URL oder Base64-String
    },
  },
  { timestamps: true } // createdAt, updatedAt
);

module.exports = mongoose.model('Product', productSchema);
