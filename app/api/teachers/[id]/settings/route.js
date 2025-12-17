import { NextResponse } from "next/server";

// Temporary in-memory store (replace with DB later)
let teacherSettings = {};

export async function GET(req, context) {
  const { id } = await context.params; // unwrap params
  const settings = teacherSettings[id] || {
    availability: [],
    meetingLink: "https://zoom.us/...",
  };
  return NextResponse.json(settings);
}

export async function PATCH(req, context) {
  const { id } = await context.params; // unwrap params
  const body = await req.json();

  teacherSettings[id] = {
    availability: body.availability || [],
    meetingLink: body.meetingLink || "https://zoom.us/...",
  };

  return NextResponse.json({ success: true, settings: teacherSettings[id] });
}
