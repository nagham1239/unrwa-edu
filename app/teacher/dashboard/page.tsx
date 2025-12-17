"use client";

import TeacherDashboard from "@/components/TeacherDashboard";

export default function Page() {
  const teacherId =
    typeof window !== "undefined" ? localStorage.getItem("teacherId") : null;

  if (!teacherId) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 ">
        Teacher not logged in
      </div>
    );
  }

  return <TeacherDashboard teacherId={teacherId} />;
}
