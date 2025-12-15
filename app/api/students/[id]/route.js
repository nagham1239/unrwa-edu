import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import Student from "@/models/Student";
import path from "path";
import fs from "fs";

// Helper to save uploaded file
async function saveFile(file, filename) {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filePath = path.join(uploadDir, filename);
  const buffer = await file.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(buffer));
  return `/uploads/${filename}`;
}

// GET single student
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectMongo();
    const student = await Student.findById(id);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (err) {
    console.error("GET student error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT update student (name, bio, and/or profile image)
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    await connectMongo();

    console.log("PUT request for ID:", id);

    const updates = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData (file upload + text fields)
      const formData = await req.formData();
      const name = formData.get("name")?.toString().trim();
      const bio = formData.get("bio")?.toString().trim();
      const profileImageEntry = formData.get("profileImage");

      console.log("FormData parsed - name:", name, "bio:", bio, "file:", !!profileImageEntry);

      if (name) updates.name = name;
      if (bio !== undefined) updates.bio = bio;  // Allow empty bio

      if (profileImageEntry && profileImageEntry instanceof File) {
        const filename = `${Date.now()}-${profileImageEntry.name}`;
        const imagePath = await saveFile(profileImageEntry, filename);
        updates.profileImage = imagePath;
      }
    } else {
      // Handle JSON payload (text-only updates)
      const body = await req.json();
      console.log("JSON body:", body);
      if (body.name) updates.name = body.name;
      if (body.bio !== undefined) updates.bio = body.bio;
    }

    console.log("Updates object:", updates);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updatedStudent = await Student.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(updatedStudent);
  } catch (err) {
    console.error("PUT student error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE student
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectMongo();
    const deleted = await Student.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("DELETE student error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
