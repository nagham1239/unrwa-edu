import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";

// Connect to database
connectDB();

export async function POST(req) {
  try {
    const { registrationNumber, password } = await req.json();

    if (!registrationNumber || !password) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }

    // Find the user in the database
    const user = await User.findOne({ registrationNumber });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return role or any other info
    return NextResponse.json(
      { role: user.role, message: "Login successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
