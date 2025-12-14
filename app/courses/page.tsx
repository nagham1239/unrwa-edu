"use client";

import CoursesBody from "@/components/CoursesBody";
import RightPanel from "@/components/RightPanel";

export default function CoursesPage() {
  return (
    <div className="flex flex-1 min-h-screen bg-gray-50">
      {/* Courses Body */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <CoursesBody />
      </div>

      {/* Right Panel (desktop only) */}
      <div className="hidden lg:block w-72 xl:w-80 p-4">
        <RightPanel />
      </div>
    </div>
  );
}
