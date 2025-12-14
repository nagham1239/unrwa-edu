"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

// Booking interface
interface Booking {
  _id: string;
  teacherId: {
    name: string;
    subject: string;
  };
  timeSlot: string;
  status: string;
}

// Student interface
interface Student {
  name: string;
  profileImage?: string;
  grade: string;
}

// Dummy function to get the logged-in student
// Replace this with your actual student fetching logic
const getLoggedInStudent = (): Student => {
  return {
    name: "Maram",
    profileImage: "/maram-profile.jpg", // replace with actual path
    grade: "Grade 9",
  };
};

export default function RightPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  // Automatically get student info
  const student = getLoggedInStudent();

  // Fetch bookings
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
    fetchBookings();
    const handleBookingUpdate = () => fetchBookings();
    window.addEventListener("booking-updated", handleBookingUpdate);
    return () => window.removeEventListener("booking-updated", handleBookingUpdate);
  }, []);

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

  // Highlight lesson days in calendar
  const lessonDays = bookings
    .map((b) => {
      const date = new Date(b.timeSlot);
      return isNaN(date.getTime()) ? null : date.getDate();
    })
    .filter(Boolean) as number[];

  return (
    <div className="w-full max-w-sm lg:max-w-md xl:max-w-lg space-y-6 px-4 lg:px-0 overflow-y-auto max-h-screen">
      {/* Profile Pic + Name + Grade */}
      <div className="bg-white rounded-2xl p-6 shadow-md text-center animate-fadeIn transform transition duration-500 hover:scale-[1.02] hover:shadow-lg">
        <div className="w-28 h-28 rounded-full mx-auto bg-[#B3DDF2] mb-3 flex items-center justify-center overflow-hidden">
          {student.profileImage ? (
            <img
              src={student.profileImage}
              alt={student.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[#0072BC] font-bold text-2xl">{student.name.charAt(0)}</span>
          )}
        </div>
        <h4 className="font-semibold text-lg text-[#0072BC]">{student.name}</h4>
        <p className="text-xs text-gray-500">{student.grade}</p>
        <button className="mt-3 px-5 py-2 rounded-full bg-[#B3DDF2] text-[#0072BC] text-sm font-medium hover:bg-[#99CCE6] transition-transform duration-300 hover:scale-105">
          View Profile
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl p-6 shadow-md animate-fadeIn transform transition duration-500 hover:scale-[1.01] overflow-hidden">
        <div className="text-sm text-[#0072BC] font-semibold mb-3">December 2025</div>
        <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-600">
          {Array.from({ length: 35 }).map((_, i) => {
            const day = i + 1;
            const hasLesson = lessonDays.includes(day);
            return (
              <div
                key={i}
                className={`py-2 rounded cursor-pointer transition-colors duration-300 ${
                  hasLesson
                    ? "bg-[#B3DDF2] text-white font-semibold shadow"
                    : "hover:bg-[#E6F4FB] hover:text-[#0072BC]"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Online Lessons */}
      <div className="bg-white rounded-2xl p-6 shadow-md animate-fadeIn transform transition duration-500 hover:scale-[1.01]">
        <h5 className="font-semibold mb-3 text-[#0072BC]">Upcoming Online Lessons</h5>
        {bookings.length === 0 ? (
          <p className="text-gray-500 text-sm">No upcoming sessions</p>
        ) : (
          <ul className="text-sm text-gray-600 space-y-3">
            {bookings.map((b) => {
              const date = new Date(b.timeSlot);
              const dateStr = isNaN(date.getTime()) ? b.timeSlot : date.toLocaleString();
              return (
                <li
                  key={b._id}
                  className="flex items-center justify-between hover:text-[#0072BC] transition"
                >
                  <div>
                    {b.teacherId.subject} with {b.teacherId.name}
                    <div className="text-xs text-gray-400">{dateStr}</div>
                  </div>
                  <button
                    disabled={loading}
                    onClick={() => deleteBooking(b._id)}
                    className="p-1 text-red-500 hover:text-red-700 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
