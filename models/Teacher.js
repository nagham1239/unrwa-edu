import mongoose, { Schema, models } from "mongoose";

const TeacherSchema = new Schema(
  {
    name: { type: String, required: true },
    subject: { type: String, required: true },
    thumbnail: { type: String },
    tags: [{ type: String }],
    color: { type: String },
    availability: [{ type: String }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], // Reverse link: array of student IDs (optional)
  },
  { timestamps: true }
);

export default models.Teacher || mongoose.model("Teacher", TeacherSchema);