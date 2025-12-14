import { NextResponse } from "next/server";
import MyTeacher from "../../../models/MyTeacher.js";
import { connectMongo } from "../../../lib/mongodb.js";

// GET all my teachers
export async function GET() {
  try {
    await connectMongo();
    const myTeachers = await MyTeacher.find({}).populate("teacherId");
    return NextResponse.json(myTeachers);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST add a teacher to my teachers
export async function POST(request) {
  try {
    await connectMongo();
    const { teacherId } = await request.json();
    const exists = await MyTeacher.findOne({ teacherId });
    if (exists) {
      return NextResponse.json({ error: "Already in My Teachers" }, { status: 400 });
    }
    const myTeacher = await MyTeacher.create({ teacherId });
    return NextResponse.json(myTeacher);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
