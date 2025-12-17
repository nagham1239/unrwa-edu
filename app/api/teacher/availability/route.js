import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";

import Teacher from "@/models/Teacher";

export async function POST(req) {
  await connectMongo();
  const { teacherId, availability } = await req.json();
  if (!teacherId || !Array.isArray(availability)) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  await Teacher.findByIdAndUpdate(teacherId, { availability });
  return NextResponse.json({ success: true });
}