import { NextResponse } from "next/server";
import Teacher from "../../../models/Teacher.js";
import { connectMongo } from "../../../lib/mongodb.js";

// GET all teachers
export async function GET() {
  try {
    await connectMongo();
    const teachers = await Teacher.find({});
    return NextResponse.json(teachers);
  } catch (error) {
    console.error("GET /api/teachers error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create a new teacher
export async function POST(request) {
  try {
    await connectMongo();
    const body = await request.json();
    const teacher = await Teacher.create(body);
    return NextResponse.json(teacher);
  } catch (error) {
    console.error("POST /api/teachers error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
