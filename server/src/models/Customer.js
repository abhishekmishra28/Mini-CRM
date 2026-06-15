const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    total_spent: {
      type: Number,
      default: 0,
    },

    order_count: {
      type: Number,
      default: 0,
    },

    first_order_date: {
      type: Date,
      default: null,
    },

    last_order_date: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  }
);

module.exports = mongoose.model(
  "Customer",
  customerSchema
);