import { NextResponse } from "next/server";
import MyTeacher from "../../../../models/MyTeacher";
import { connectMongo } from "../../../../lib/mongodb";

export async function DELETE(request, context) {
  try {
    await connectMongo();

    // ✅ FIX: params is async in Next.js 16
    const { id } = await context.params;

    const deleted = await MyTeacher.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "MyTeacher not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Removed successfully" });
  } catch (error) {
    console.error("DELETE /api/myteachers/[id] error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
