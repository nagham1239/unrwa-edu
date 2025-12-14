import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    // Basic info
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    // Teacher relation
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },

    // Course resources
    filesCount: { type: Number, default: 0 },
    membersCount: { type: Number, default: 0 },

    // Progress tracking
    progress: { type: Number, min: 0, max: 100, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    nextLesson: { type: Date },

    // Relations
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],

    // Image/banner
    thumbnail: { type: String, default: "" },

    // Tags + UI color
    tags: [{ type: String }],
    color: { type: String, default: "#0072BC" },
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);
