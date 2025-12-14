import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import Course from "@/models/Course";
import Resource from "@/models/Resource";

// GET all courses
export async function GET() {
  try {
    await connectMongo();
    const courses = await Course.find();
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new course
export async function POST(req) {
  try {
    await connectMongo();
    const body = await req.json();

    if (!body.title || !body.subject || !body.instructor) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const course = await Course.create(body);
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE a resource by ID
export async function DELETE(req, { params }) {
  try {
    await connectMongo();
    const { id } = params;

    const deleted = await Resource.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Resource deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
