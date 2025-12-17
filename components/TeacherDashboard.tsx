"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Calendar, UserCheck, Clock, TrendingUp } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  email?: string;
  thumbnail?: string;
  progress?: number;
}

interface Booking {
  _id: string;
  studentId: Student | string;
  timeSlot: string;
  status: string;
  date: string;
}

interface TeacherDashboardProps {
  teacherId: string;
}

export default function TeacherDashboard({ teacherId }: TeacherDashboardProps) {
  const [mounted, setMounted] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [bookingsRes, studentsRes] = await Promise.all([
          fetch(`/api/bookings?teacherId=${teacherId}`, { cache: "no-store" }),
          fetch(`/api/students?teacherId=${teacherId}`, { cache: "no-store" }),
        ]);

        if (!bookingsRes.ok || !studentsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const bookingsData: Booking[] = await bookingsRes.json();
        const studentsData: Student[] = await studentsRes.json();

        setBookings(bookingsData);
        setStudents(studentsData);
      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherId]);

  const updateBookingStatus = async (bookingId: string, status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update booking");
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status } : b))
      );
      setSelectedStatus((prev) => ({ ...prev, [bookingId]: status }));
    } catch (err) {
      console.error(err);
      setError("Failed to update booking status.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-12 w-12 rounded-full border-b-4 border-[#0072BC]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-[#0072BC] text-white rounded-full hover:bg-[#005A99] transition"
          >
            Retry
          </button> z
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <main className="flex-1 overflow-y-auto space-y-12 pt-12 sm:pt-16 md:pt-0 p-6 md:p-8 bg-[#E6F4FB]">
        {/* Top gradient */}
        <div className="w-full h-1 bg-gradient-to-r from-[#B3DDF2] via-[#66B2E6] to-[#0072BC] rounded-full animate-pulse" />

        {/* HERO */}
        <div className="bg-[#E6F4FB] rounded-2xl p-6 md:p-8 shadow-md transform transition duration-500 hover:scale-[1.01]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-start animate-fadeIn">
              <h2 className="text-2xl md:text-3xl font-bold text-[#0072BC] mb-4">
                Welcome back, Teacher 🌟
              </h2>
              <p className="text-gray-600 italic mb-4">
                Manage your students, sessions, and progress with ease.
              </p>
              <Link
                href="/teacher/students"
                className="inline-block px-6 py-3 bg-[#0072BC] text-white rounded-full text-lg font-medium hover:bg-[#005A99] transition-transform duration-300 hover:scale-105"
              >
                View Students
              </Link>
            </div>
            <img
              src="https://i.pinimg.com/1200x/cf/66/33/cf66334166ddd4c120148dc07c492449.jpg"
              alt="Teacher illustration"
              className="w-80 h-auto object-contain mix-blend-multiply animate-fadeIn"
            />
          </div>
        </div>

        {/* STATS, STUDENTS, BOOKINGS */}
        {/* Keep the rest of your dashboard content as-is */}
      </main>
    </div>
  );
}
