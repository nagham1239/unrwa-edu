import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import Student from "@/models/Student";

// GET all students
export async function GET() {
  try {
    await connectMongo();
    const students = await Student.find({});
    return NextResponse.json(students);
  } catch (error) {
    console.error("GET all students error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new student
export async function POST(req) {
  try {
    await connectMongo();
    const body = await req.json();

    if (!body.name || !body.registrationNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const student = await Student.create({
      name: body.name,
      registrationNumber: body.registrationNumber,
      profileImage: body.profileImage || "/placeholder.png",
      grade: body.grade || "Not specified", // set at creation, not editable later
      bio: body.bio || "",
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("POST student error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
