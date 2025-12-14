import mongoose, { Schema, models } from "mongoose";

const BookingSchema = new Schema(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    studentName: { type: String, required: true },
    timeSlot: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default models.Booking || mongoose.model("Booking", BookingSchema);
