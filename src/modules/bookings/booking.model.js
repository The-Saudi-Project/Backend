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

    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String },
    customerAddress: { type: String, required: true },

    notes: { type: String },

    scheduledAt: {
      type: Date,
      required: true,
    },

    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING_PAY",
        "PAYMENT_UPLOADED",
        "CONFIRMED",
        "ASSIGNED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "EXPIRED",
      ],
      default: "PENDING_PAY",
    },

    paymentProof: {
      type: String, // filename
      default: null,
    },

    paymentConfirmedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// auto-expire unpaid bookings
bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Booking", bookingSchema);
