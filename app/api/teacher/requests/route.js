import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";

import StudentRequest from "@/models/StudentRequest";
import TeacherStudent from "@/models/TeacherStudent";

export async function GET(req) {
  await connectMongo();
  const teacherId = req.headers.get("teacher-id");
  if (!teacherId) return NextResponse.json({ error: "Teacher ID required" }, { status: 400 });

  const requests = await StudentRequest.find({ teacherId, status: "pending" }).populate("studentId");
  return NextResponse.json(requests);
}

export async function POST(req) {
  await connectMongo();
  const { requestId, action } = await req.json();

  if (!["accept", "ignore"].includes(action)) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  const request = await StudentRequest.findById(requestId);
  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  if (action === "accept") {
    const count = await TeacherStudent.countDocuments({ teacherId: request.teacherId });
    if (count >= 5) return NextResponse.json({ error: "Maximum of 5 students reached" }, { status: 400 });

    const exists = await TeacherStudent.findOne({ teacherId: request.teacherId, studentId: request.studentId });
    if (!exists) {
      await TeacherStudent.create({ teacherId: request.teacherId, studentId: request.studentId });
    }
  }

  request.status = action === "accept" ? "accepted" : "ignored";
  await request.save();

  return NextResponse.json({ success: true });
}