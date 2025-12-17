"use client";

import { usePathname } from "next/navigation";
import TeacherSidebar from "@/components/TeacherSidebar";
import TeacherRightPanel from "@/components/TeacherRightPanel";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const teacherId = "693cdbee5e3e16b36bb1074f"; // Replace with dynamic if needed

  return (
    <div className="flex min-h-screen bg-[#E6F4FB]">
      {/* LEFT SIDEBAR */}

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto min-h-screen px-6 py-6 ">
        {children}
      </main>

      {/* RIGHT PANEL */}
      <aside className="hidden xl:block w-80 shrink-0 border-l border-gray-200">
        <TeacherRightPanel teacherId={teacherId} />
      </aside>
    </div>
  );
}
