import { NextResponse } from "next/server";
import Booking from "../../../../models/Booking.js";
import { connectMongo } from "../../../../lib/mongodb.js";

export async function DELETE(req, context) {
  try {
    await connectMongo();

    const { id } = await context.params;

    await Booking.deleteOne({ _id: id });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/bookings/[id] error:", err);
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
