import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]-\d{8}$/, // digit-dash-8 digits
    },
    profileImage: { type: String, default: "/placeholder.png" }, // optional avatar URL
    grade: { type: String, default: "Not specified" }, // immutable from DB
    bio: { type: String, default: "" }, // editable
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);
