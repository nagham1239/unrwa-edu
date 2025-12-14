import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import Resource from "@/models/Resource";

// GET a single resource by ID
export async function GET(req, { params }) {
  try {
    await connectMongo();
    const { id } = await params; // Await params (Next.js 16 fix)
    const resource = await Resource.findById(id);
    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }
    return NextResponse.json(resource);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE (your existing code)
export async function DELETE(req, { params }) {
  try {
    await connectMongo();
    const { id } = await params; // Await params
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");
    const fileId = searchParams.get("fileId");

    if (lessonId) {
      // remove a lesson by ID
      const updated = await Resource.findByIdAndUpdate(
        id,
        { $pull: { lessons: { _id: lessonId } } },
        { new: true }
      );
      return NextResponse.json(updated);
    }

    if (fileId) {
      // remove a file by ID inside lessons
      const updated = await Resource.findByIdAndUpdate(
        id,
        { $pull: { "lessons.$[].files": { _id: fileId } } },
        { new: true }
      );
      return NextResponse.json(updated);
    }

    // default: delete whole resource
    const deleted = await Resource.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Resource deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}