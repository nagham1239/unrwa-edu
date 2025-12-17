import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function PATCH(req, { params }) {
  await connectMongo();
  const bookingId = params.id;
  const { meetingLink } = await req.json();

  if (!meetingLink) return NextResponse.json({ error: "Link required" }, { status: 400 });

  try {
    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      { meetingLink },
      { new: true }
    );
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
