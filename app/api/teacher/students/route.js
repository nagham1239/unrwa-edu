import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import "@/models/Student";

import TeacherStudent from "@/models/TeacherStudent";
import Booking from "@/models/Booking";

export async function GET(req) {
  await connectMongo();
  const teacherId = req.headers.get("teacher-id");
  if (!teacherId) return NextResponse.json({ error: "Teacher ID required" }, { status: 400 });

  const activeStudents = await TeacherStudent.find({ teacherId }).populate("studentId");

  const withHistory = await Promise.all(
    activeStudents.map(async (ts) => {
      const history = await Booking.find({ teacherId, studentName: ts.studentId.name }).sort({ createdAt: -1 });
      return { ...ts.toObject(), history };
    })
  );

  return NextResponse.json(withHistory);
}