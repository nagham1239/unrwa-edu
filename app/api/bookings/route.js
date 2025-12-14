import { NextResponse } from "next/server";
import Booking from "@/models/Booking";
import { connectMongo } from "@/lib/mongodb";
import "@/models/Teacher";
// GET all bookings (optionally filter by studentName)
export async function GET(req) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const studentName = searchParams.get("studentName");

    const query = studentName ? { studentName } : {};
    const bookings = await Booking.find(query).populate("teacherId");

    // Return array directly so frontend can filter
    return NextResponse.json(bookings);
  } catch (err) {
    console.error("GET /api/bookings error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}



// POST new booking
export async function POST(req) {
  try {
    await connectMongo();
    const body = await req.json();
    const booking = await Booking.create(body);
    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
