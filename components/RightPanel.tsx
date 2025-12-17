"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import Link from "next/link";

interface Booking {
  _id: string;
  teacherId: {
    name: string;
    subject: string;
  };
  timeSlot: string;
  status: string;
}

interface Student {
  _id: string;
  name: string;
  profileImage?: string;
  grade?: string;
}

export default function RightPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  /* ================= FETCH STUDENT ================= */
  const fetchStudent = async () => {
    try {
      const res = await fetch("/api/students", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const s = Array.isArray(data) ? data[0] : data;
      if (!s) return;

      setStudent({
        _id: s._id,
        name: s.name,
        grade: s.grade,
        profileImage: s.profileImage,
      });
    } catch (err) {
      console.error("Failed to fetch student:", err);
    }
  };

  /* ================= FETCH BOOKINGS ================= */
  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data: Booking[] = await res.json();
      setBookings(data.filter((b) => b.status === "confirmed"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudent();
    fetchBookings();

    const handleBookingUpdate = () => fetchBookings();
    window.addEventListener("booking-updated", handleBookingUpdate);
    return () =>
      window.removeEventListener("booking-updated", handleBookingUpdate);
  }, []);

  /* ================= DELETE BOOKING ================= */
  const deleteBooking = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete booking");
      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CALENDAR LOGIC (UPDATED FOR NEXT OCCURRENCES) ================= */

  const year = 2025;
  const month = 11; // December
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  // Map of day to list of bookings for that day (next occurrence)
  const dayBookings: Record<number, Booking[]> = {};

  bookings.forEach((b) => {
    const weekday = b.timeSlot.split(" ")[0];
    const targetDayOfWeek = weekdayMap[weekday];
    if (targetDayOfWeek === undefined) return;

    // Find the next occurrence in December 2025
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      if (date.getDay() === targetDayOfWeek) {
        if (!dayBookings[d]) dayBookings[d] = [];
        dayBookings[d].push(b);
        break; // Only the first (next) occurrence
      }
    }
  });

  const lessonDays = new Set(Object.keys(dayBookings).map(Number));

  // Get lessons for selected day
  const selectedDayBookings = selectedDay !== null ? dayBookings[selectedDay] || [] : [];

  /* ================= UI ================= */

  return (
    <div className="w-full max-w-sm lg:max-w-md xl:max-w-lg space-y-6 px-4 lg:px-0 overflow-y-auto max-h-screen sticky top-0">

      {/* ===== PROFILE CARD ===== */}
      {student && (
        <div className="bg-white rounded-2xl p-6 shadow-md text-center animate-fadeIn transform transition duration-500 hover:scale-[1.02] hover:shadow-lg">
          <div className="w-28 h-28 rounded-full mx-auto bg-[#B3DDF2] mb-3 flex items-center justify-center overflow-hidden">
            {student.profileImage ? (
              <img
                src={student.profileImage}
                alt={student.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[#0072BC] font-bold text-2xl">
                {student.name.charAt(0)}
              </span>
            )}
          </div>

          <h4 className="font-semibold text-lg text-[#0072BC]">
            {student.name}
          </h4>
          <p className="text-xs text-gray-500">
            Grade-{student.grade || "Grade not specified"}
          </p>

          <Link
            href="/profile"
            className="inline-block mt-3 px-5 py-2 rounded-full bg-[#B3DDF2] text-[#0072BC] text-sm font-medium hover:bg-[#99CCE6] transition-transform duration-300 hover:scale-105"
          >
            View Profile
          </Link>
        </div>
      )}

      {/* ===== CALENDAR ===== */}
      <div className="bg-white rounded-2xl p-6 shadow-md animate-fadeIn transform transition duration-500 hover:scale-[1.01] overflow-hidden">
        <div className="text-sm text-[#0072BC] font-semibold mb-3">
          December 2025
        </div>

        <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-600">
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const hasLesson = lessonDays.has(day);
            const isSelected = selectedDay === day;

            return (
              <div
                key={day}
                onClick={() => hasLesson && setSelectedDay(day)}
                className={`py-2 rounded cursor-pointer transition-colors duration-300 ${
                  hasLesson
                    ? isSelected
                      ? "bg-[#0072BC] text-white font-semibold shadow"
                      : "bg-[#B3DDF2] text-white font-semibold shadow"
                    : "hover:bg-[#E6F4FB] hover:text-[#0072BC]"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* SELECTED DAY DETAILS */}
{selectedDayBookings.length > 0 && (
  <div className="mt-4 border-t pt-3">
    <h4 className="text-sm font-semibold text-[#0072BC] mb-2">
      Lessons on day {selectedDay}
    </h4>

    <ul className="text-xs text-gray-600 space-y-1">
      {selectedDayBookings.map((b) => (
        <li key={b._id} className="flex justify-between">
          <span>
            {b.teacherId ? `${b.teacherId.subject} with ${b.teacherId.name}` : "Teacher not assigned"}
          </span>
          <span className="text-gray-400">{b.timeSlot}</span>
        </li>
      ))}
    </ul>
  </div>
)}

{/* UPCOMING LESSONS */}
{bookings.length === 0 ? (
  <p className="text-gray-500 text-sm">No upcoming sessions</p>
) : (
  <ul className="text-sm text-gray-600 space-y-3">
    {bookings.map((b) => (
      <li key={b._id} className="flex items-center justify-between hover:text-[#0072BC] transition">
        <div>
          {b.teacherId ? `${b.teacherId.subject} with ${b.teacherId.name}` : "Teacher not assigned"}
          <div className="text-xs text-gray-400">{b.timeSlot}</div>
        </div>
        <button
          disabled={loading}
          onClick={() => deleteBooking(b._id)}
          className="p-1 text-red-500 hover:text-red-700 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </li>
    ))}
  </ul>
)}

      </div>
    </div>
  );
}