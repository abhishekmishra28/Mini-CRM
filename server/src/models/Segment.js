const mongoose = require("mongoose");

const conditionSchema = new mongoose.Schema(
  {
    field: String,

    op: String,

    value: mongoose.Schema.Types.Mixed,
  },

  {
    _id: false,
  }
);

const segmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,

      required: true,
    },

    description: {
      type: String,

      default: "",
    },

    conditions: {
      type: [conditionSchema],

      default: [],
    },

    operator: {
      type: String,

      enum: ["AND", "OR"],

      default: "AND",
    },

    customer_count: {
      type: Number,

      default: 0,
    },

    ai_generated: {
      type: Boolean,

      default: false,
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
  "Segment",
  segmentSchema
);