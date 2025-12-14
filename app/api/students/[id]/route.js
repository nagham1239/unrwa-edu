import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Student from "@/models/Student";

// GET single student by ID
export async function GET(req, { params }) {
  try {
    await connectMongo();
    const student = await Student.findById(params.id);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    return NextResponse.json(student);
  } catch (err) {
    console.error("GET student error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT update student by ID (only editable fields)
export async function PUT(req, { params }) {
  try {
    await connectMongo();

    const existing = await Student.findById(params.id);
    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const body = await req.json();

    // Only allow editable fields
    const updates = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.profileImage !== undefined) updates.profileImage = body.profileImage || "/placeholder.png";
    if (body.bio !== undefined) updates.bio = body.bio;

    // Prevent empty update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updatedStudent = await Student.findByIdAndUpdate(params.id, updates, { new: true });

    return NextResponse.json(updatedStudent);
  } catch (err) {
    console.error("PUT student error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE student by ID
export async function DELETE(req, { params }) {
  try {
    await connectMongo();
    const deleted = await Student.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("DELETE student error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
