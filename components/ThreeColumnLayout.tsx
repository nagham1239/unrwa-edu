"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TeacherSidebar from "@/components/TeacherSidebar";
import RightPanel from "@/components/RightPanel";
import TeacherRightPanel from "@/components/TeacherRightPanel";

export default function ThreeColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isTeacherPage = pathname.startsWith("/teacher");

  return (
    <div className="flex min-h-screen bg-[#E6F4FB]">
      {/* LEFT SIDEBAR */}
      <aside className="w-72 shrink-0">
        {isTeacherPage ? <TeacherSidebar /> : <Sidebar />}
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-6 py-6 overflow-y-auto">
        {children}
      </main>

      {/* RIGHT PANEL */}
      <aside className="w-80 shrink-0 hidden lg:block">
        {isTeacherPage ? (
          <TeacherRightPanel teacherId="693cdbee5e3e16b36bb1074f" />
        ) : (
          <RightPanel />
        )}
      </aside>
    </div>
  );
}
