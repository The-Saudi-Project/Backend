import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
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

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["CREATED", "ASSIGNED", "IN_PROGRESS", "COMPLETED"],
      default: "CREATED",
    },
  },
  { timestamps: true },
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
