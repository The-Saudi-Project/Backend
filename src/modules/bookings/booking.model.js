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

    /* ---------- SNAPSHOT DATA ---------- */
    serviceName: { type: String, required: true },
    servicePrice: { type: Number, required: true }, // 🔑 PRICE AT BOOK TIME

    /* ---------- CUSTOMER ---------- */
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

    /* ---------- PAYMENT ---------- */
    amountPaid: {
      type: Number,
      default: 0,
    },

    paymentProof: {
      type: String,
      default: null,
    },

    paymentConfirmedAt: {
      type: Date,
      default: null,
    },

    /* ---------- PROVIDER ---------- */
    providerEarning: {
      type: Number,
      default: 0,
    },

    /* ---------- STATUS ---------- */
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
  },
  { timestamps: true },
);

// Auto-expire unpaid bookings
bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Booking", bookingSchema);
