const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: String,

    category: String,

    quantity: Number,

    price: Number,
  },

  {
    _id: false,
  }
);

const orderSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Customer",

      required: true,
    },

    amount: {
      type: Number,

      required: true,
    },

    items: {
      type: [itemSchema],

      default: [],
    },

    channel: {
      type: String,

      enum: ["online", "in-store", "app"],

      required: true,
    },

    status: {
      type: String,

      enum: [
        "completed",
        "returned",
        "cancelled",
      ],

      default: "completed",
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
  "Order",
  orderSchema
);