import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]-\d{8}$/, // e.g., 2-12345678
    },
    profileImage: { type: String, default: "/placeholder.png" },
    grade: { type: String, default: "Not specified" }, // immutable
    bio: { type: String, default: "" }, // editable
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: false }, // Link to teacher (optional for flexibility)
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);