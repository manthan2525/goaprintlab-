const mongoose = require('mongoose');

const customRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    modelFileName: {
      type: String,
      required: [true, 'Model file name is required'],
      trim: true,
    },
    modelFileUrl: {
      type: String,
      required: [true, 'Model file URL is required'],
      trim: true,
    },
    material: {
      type: String,
      required: [true, 'Filament material is required'],
      trim: true,
    },
    color: {
      type: String,
      required: [true, 'Filament colour is required'],
      trim: true,
    },
    size: {
      type: String,
      required: [true, 'Target size or scale is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending Review', 'Approved', 'Printing', 'Completed', 'Rejected'],
      default: 'Pending Review',
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

module.exports = mongoose.model('CustomRequest', customRequestSchema);
