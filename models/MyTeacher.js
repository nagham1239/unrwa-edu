import mongoose, { Schema, models } from "mongoose";

const MyTeacherSchema = new Schema({
  teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
}, { timestamps: true });

export default models.MyTeacher || mongoose.model("MyTeacher", MyTeacherSchema);
