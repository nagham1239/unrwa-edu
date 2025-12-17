import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";

import TeacherStudent from "@/models/TeacherStudent";

export async function POST(req) {
  await connectMongo();
  const { teacherStudentId, content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Empty note" }, { status: 400 });

  const ts = await TeacherStudent.findById(teacherStudentId);
  if (!ts) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  ts.notes.push({ content });
  await ts.save();

  return NextResponse.json({ success: true });
}