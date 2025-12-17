"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  User,
  Phone,
} from "lucide-react";

export default function TeacherSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname(); // always returns a string

  const linkClass = (path) =>
    pathname === path
      ? "flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-[#0072BC] border-l-4 border-[#0072BC] transition-all duration-300 ease-in-out"
      : "flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:text-[#66B2E6] transition-all duration-300 ease-in-out";

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white shadow-md fixed top-0 left-0 w-full z-40">
        <button
          onClick={() => setOpen(true)}
          className="transition-transform duration-300 hover:scale-110"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <img src="/logo.png" alt="UNRWA EDU Logo" className="h-10 w-auto" />
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden animate-fadeIn"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-white shadow-lg p-6 flex flex-col justify-between z-50 transform transition-transform duration-500 ease-in-out rounded-r-3xl ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Close Button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setOpen(false)}
              className="transition-transform duration-300 hover:rotate-90"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-10">
            <img src="/logo.png" alt="UNRWA EDU Logo" className="h-32 w-auto" />
          </div>

          {/* Navigation */}
          <nav className="space-y-6">
            <Link href="/teacher/dashboard" className={linkClass("/teacher/dashboard")}>
              <LayoutDashboard className="w-6 h-6 text-[#0072BC]" />
              Dashboard
            </Link>
            <Link href="/teacher/students" className={linkClass("/teacher/students")}>
              <BookOpen className="w-6 h-6 text-[#0072BC]" />
              Students
            </Link>
            <Link href="/teacher/profile" className={linkClass("/teacher/profile")}>
              <User className="w-6 h-6 text-[#0072BC]" />
              Profile
            </Link>
          </nav>
        </div>

        {/* Contact */}
        <div className="text-center mt-8">
          <a
            href="tel:+96171234567"
            className="flex items-center justify-center gap-2 text-[#0072BC] font-semibold text-lg hover:text-[#005A99] transition-transform duration-300 hover:scale-105"
          >
            <Phone className="w-5 h-5 text-[#0072BC]" />
            +961 71 234 567
          </a>
        </div>
      </aside>
    </>
  );
}