import mongoose from "mongoose";

const StudentRequestSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    status: { type: String, enum: ["pending", "accepted", "ignored"], default: "pending" },
    requestMessage: String,
  },
  { timestamps: true }
);

export default mongoose.models.StudentRequest || mongoose.model("StudentRequest", StudentRequestSchema);