import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import Teacher from "@/models/Teacher";

export async function GET(req) {
  await connectMongo();
  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get("teacherId");
  if (!teacherId) return NextResponse.json({ error: "Teacher ID required" }, { status: 400 });

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

  return NextResponse.json(teacher);
}