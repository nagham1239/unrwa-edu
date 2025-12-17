// /app/api/teacherstudents/route.js
import { NextResponse } from "next/server";
import TeacherStudent from "@/models/TeacherStudent"; // your Mongoose model
import { connectMongo } from "@/lib/mongodb";

export async function GET(req) {
  try {
    // Connect to MongoDB
    await connectMongo();

    // Extract teacherId from query params
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      // If no teacherId is provided, return empty array
      return NextResponse.json([], { status: 200 });
    }

    // Find all student links for this teacher
    const links = await TeacherStudent.find({ teacherId });

    return NextResponse.json(links, { status: 200 });
  } catch (err) {
    console.error("Error fetching teacher-student links:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
