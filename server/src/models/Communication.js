const mongoose = require("mongoose");

const communicationSchema =
  new mongoose.Schema(
    {
      campaign_id: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "Campaign",

        required: true,
      },

      customer_id: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "Customer",

        required: true,
      },

      channel: {
        type: String,

        required: true,
      },

      message: {
        type: String,

        required: true,
      },

      status: {
        type: String,

        enum: [
          "queued",
          "sent",
          "delivered",
          "failed",
          "opened",
          "clicked",
        ],

        default: "queued",
      },
    },

    {
      timestamps: {
        createdAt: "created_at",

        updatedAt: "updated_at",
      },
    }
  );

module.exports = mongoose.model(
  "Communication",
  communicationSchema
);