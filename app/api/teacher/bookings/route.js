import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET(req) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json({ error: "Teacher ID required" }, { status: 400 });
    }

    // Populate studentId, but handle if it's null or missing
    const bookings = await Booking.find({ teacherId })
      .populate({
        path: "studentId",
        select: "name email thumbnail", // Only fetch needed fields
        model: "Student" // Ensure this matches your collection name ("students")
      })
      .sort({ createdAt: -1 });

    // Post-process: If studentId is null, use studentName as fallback
    const processedBookings = bookings.map(b => ({
      ...b.toObject(),
      studentId: b.studentId || { name: b.studentName || "Unknown Student", email: "", thumbnail: "" }
    }));

    return NextResponse.json(processedBookings);
  } catch (err) {
    console.error("GET /api/bookings error:", err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}