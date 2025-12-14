import mongoose, { Schema, models } from "mongoose";

const fileSchema = new Schema({
  type: String,   // exercise | exam | pdf | video
  title: String,
  url: String,
});

const resourceSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    files: [fileSchema],
  },
  { timestamps: true }
);

const Resource = models.Resource || mongoose.model("Resource", resourceSchema);
export default Resource;
