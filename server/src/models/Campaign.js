const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,

      required: true,
    },

    segment_id: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Segment",

      required: true,
    },

    channel: {
      type: String,

      enum: [
        "whatsapp",
        "sms",
        "email",
        "rcs",
      ],

      required: true,
    },

    message: {
      type: String,

      required: true,
    },

    status: {
      type: String,

      enum: [
        "draft",
        "sending",
        "sent",
        "completed",
      ],

      default: "draft",
    },

    total_sent: {
      type: Number,

      default: 0,
    },

    delivered: {
      type: Number,

      default: 0,
    },

    failed: {
      type: Number,

      default: 0,
    },

    opened: {
      type: Number,

      default: 0,
    },

    clicked: {
      type: Number,

      default: 0,
    },

    sent_at: Date,

    ai_generated_message: {
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
  "Campaign",
  campaignSchema
);