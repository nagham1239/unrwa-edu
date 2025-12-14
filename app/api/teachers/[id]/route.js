import { NextResponse } from "next/server";
import Teacher from "../../../../models/Teacher.js";
import { connectMongo } from "../../../../lib/mongodb.js";

// GET one teacher by id
export async function GET(request, { params }) {
  try {
    await connectMongo();
    const teacher = await Teacher.findById(params.id);
    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }
    return NextResponse.json(teacher);
  } catch (error) {
    console.error("GET /api/teachers/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update teacher by id
export async function PUT(request, { params }) {
  try {
    await connectMongo();
    const body = await request.json();
    const updated = await Teacher.findByIdAndUpdate(params.id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/teachers/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE teacher by id
export async function DELETE(request, { params }) {
  try {
    await connectMongo();
    const deleted = await Teacher.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/teachers/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
