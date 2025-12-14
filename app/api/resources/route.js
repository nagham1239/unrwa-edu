import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import Resource from "@/models/Resource";

export async function GET(req) {
  await connectMongo();

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  const query = courseId ? { courseId } : {};
  const resources = await Resource.find(query);

  return NextResponse.json(resources);
}
