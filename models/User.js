import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "teacher", "student"], default: "student" }
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
