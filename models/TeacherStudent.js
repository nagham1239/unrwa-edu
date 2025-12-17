import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const TeacherStudentSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    notes: [NoteSchema],
  },
  { timestamps: true }
);

export default mongoose.models.TeacherStudent || mongoose.model("TeacherStudent", TeacherStudentSchema);