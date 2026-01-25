import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* CUSTOMER DETAILS (SNAPSHOT) */
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
    },
    customerAddress: {
      type: String,
      required: true,
    },

    notes: {
      type: String,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["CREATED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "CREATED",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Booking", bookingSchema);
