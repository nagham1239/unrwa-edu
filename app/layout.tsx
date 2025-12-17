"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TeacherSidebar from "@/components/TeacherSidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Detect teacher routes
  const isTeacherPage = pathname.startsWith("/teacher") || pathname.startsWith("/teachers");

  return (
    <html lang="en">
      <body className="bg-[#E6F4FB]">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          {isTeacherPage ? <TeacherSidebar /> : <Sidebar />}

          {/* Main content area */}
          <main className="flex-1 lg:ml-72">{children}</main>
        </div>
      </body>
    </html>
  );
}
