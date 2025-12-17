import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Teacher from "@/models/Teacher";

export async function POST(req) {
  try {
    await connectMongo();

    const body = await req.json();
    const { teacherId, studentId, studentName, timeSlot } = body;

    // ✅ Basic validation
    if (!teacherId || !studentId || !studentName || !timeSlot) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Get teacher
    const teacher = await Teacher.findById(teacherId).lean();

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    // ✅ Safe availability check
    const isAvailable =
      Array.isArray(teacher.availability) &&
      teacher.availability.includes(timeSlot);

    if (!isAvailable) {
      return NextResponse.json(
        { error: "Slot not available" },
        { status: 400 }
      );
    }

    // ✅ Prevent ANY double booking
    const existingBooking = await Booking.findOne({
      teacherId,
      timeSlot,
      status: { $ne: "cancelled" },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "Slot already booked" },
        { status: 400 }
      );
    }

    // ✅ Create booking
    const booking = await Booking.create({
      teacherId,
      studentId,
      studentName,
      timeSlot,
      status: "pending",
    });

    return NextResponse.json(
      { success: true, booking },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/book error:", err);
    return NextResponse.json(
      { error: "Failed to book session" },
      { status: 500 }
    );
  }
}
