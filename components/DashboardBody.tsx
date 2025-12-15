"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, FileText, Calendar, Heart } from "lucide-react";

interface Course {
  _id: string;
  subject: string;
  title: string;
  thumbnail?: string;
  files?: number;
  color?: string;
  finished?: number;
  total?: number;
}

interface Teacher {
  _id: string;
  name: string;
  subject: string;
  thumbnail?: string;
  availability?: string[];
}

interface MyTeacherResponse {
  _id: string;
  teacherId: Teacher;
}

interface Booking {
  _id: string;
  teacherId: Teacher | string;
  teacherName?: string;
  studentName: string;
  timeSlot: string;
  status: string;
}

const LS_FAV_KEY = "favorites_course_ids";
const LS_PROGRESS_KEY = "course_progress";

export default function DashboardBody() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [myTeachers, setMyTeachers] = useState<MyTeacherResponse[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Fetch courses
  useEffect(() => {
    const favStored = localStorage.getItem(LS_FAV_KEY);
    const favIds: string[] = favStored ? JSON.parse(favStored) : [];

    const progressStored = localStorage.getItem(LS_PROGRESS_KEY);
    const progress: Record<string, boolean> = progressStored
      ? JSON.parse(progressStored)
      : {};

    const getFileKey = (courseId: string, file: { url: string }) =>
      `${courseId}::${file.url}`;

    const fetchCourses = async () => {
      const res = await fetch("/api/courses", { cache: "no-store" });
      const allCourses: Course[] = await res.json();

      const favCourses = allCourses.filter((c) => favIds.includes(c._id));

      const enrichedCourses: Course[] = [];

      for (const course of favCourses) {
        const lessonsRes = await fetch(`/api/resources?courseId=${course._id}`, {
          cache: "no-store",
        });
        const lessons: { files?: { url: string }[] }[] = await lessonsRes.json();
        const allFiles = lessons.flatMap((l) => l.files ?? []);
        const total = allFiles.length;
        const finished = allFiles.filter((file) => progress[getFileKey(course._id, file)]).length;

        enrichedCourses.push({
          ...course,
          total,
          finished,
          files: total,
        });
      }

      setCourses(enrichedCourses);
    };

    fetchCourses();
  }, []);

  // Fetch favorite teachers
  useEffect(() => {
    const fetchMyTeachers = async () => {
      try {
        const res = await fetch("/api/myteachers");
        if (!res.ok) throw new Error("Failed to fetch favorite teachers");
        const data: MyTeacherResponse[] = await res.json();
        setMyTeachers(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchMyBookings = async () => {
      try {
        const res = await fetch("/api/bookings?studentName=Nagham");
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();
        setMyBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setMyBookings([]);
      }
    };

    fetchMyTeachers();
    fetchMyBookings();
  }, []);

  const removeFromMyTeachers = async (teacherId: string) => {
    const entry = myTeachers.find((t) => t.teacherId._id === teacherId);
    if (!entry?. _id) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/myteachers/${entry._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove teacher");
      setMyTeachers((prev) => prev.filter((t) => t.teacherId._id !== teacherId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const bookSession = async (teacher: Teacher) => {
    const slot = selectedSlots[teacher._id];
    if (!slot) return;
    try {
      setLoading(true);
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: teacher._id,
          studentName: "Nagham",
          timeSlot: slot,
          status: "confirmed",
        }),
      });
      if (!res.ok) throw new Error("Failed to book session");
      setSelectedSlots((prev) => ({ ...prev, [teacher._id]: "" }));
      // update bookings
      const bookingsRes = await fetch("/api/bookings?studentName=Nagham");
      const data = await bookingsRes.json();
      setMyBookings(data);
      window.dispatchEvent(new Event("booking-updated"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (teacher: string, subject: string) => {
    router.push(`/bookings?teacher=${encodeURIComponent(teacher)}&subject=${encodeURIComponent(subject)}`);
  };

  return (
    <div className="flex-1 space-y-12 relative pt-12 sm:pt-16 md:pt-0">
      <div className="w-full h-1 bg-gradient-to-r from-[#B3DDF2] via-[#66B2E6] to-[#0072BC] rounded-full animate-pulse mb-1" />

      {/* Hero Banner */}
      <div className="bg-[#E6F4FB] rounded-2xl p-4 sm:p-6 md:p-8 shadow-md transform transition duration-500 hover:scale-[1.01]">
        {/* Mobile */}
        <div className="flex flex-row items-center justify-between gap-4 md:hidden">
          <div className="flex flex-col items-start justify-center text-left animate-fadeIn">
            <h2 className="text-sm font-bold text-[#0072BC] mb-2">
              Sharpen Your Skills with Professional Online Courses
            </h2>
            <Link
              href="/courses"
              className="inline-block px-4 py-2 bg-[#0072BC] text-white rounded-full text-xs font-medium hover:bg-[#005A99] transition-transform duration-300 hover:scale-105"
            >
              Join Now
            </Link>
          </div>
          <img
            src="https://i.pinimg.com/1200x/cf/66/33/cf66334166ddd4c120148dc07c492449.jpg"
            alt="Learning Illustration"
            className="w-28 h-auto object-contain mix-blend-multiply animate-fadeIn"
          />
        </div>

        {/* Desktop + iPad */}
        <div className="hidden md:flex flex-row items-center justify-between">
          <div className="mb-4 md:mb-0 md:w-2/3 text-left flex flex-col items-start animate-fadeIn">
            <h2 className="text-xl md:text-2xl font-bold text-[#0072BC] mb-6">
              Sharpen Your Skills with Professional Online Courses
            </h2>
            <Link
              href="/courses"
              className="inline-block px-6 py-3 bg-[#0072BC] text-white rounded-full text-base md:text-lg font-medium hover:bg-[#005A99] transition-transform duration-300 hover:scale-105"
            >
              Join Now
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <img
              src="https://i.pinimg.com/1200x/cf/66/33/cf66334166ddd4c120148dc07c492449.jpg"
              alt="Learning Illustration"
              className="w-96 h-auto object-contain mix-blend-multiply animate-fadeIn"
            />
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-[#0072BC]">My Courses</h3>
          <Link
            href="/courses"
            className="text-sm text-[#0072BC] hover:underline flex items-center gap-1 transition-transform duration-300 hover:scale-105"
          >
            View All
          </Link>
        </div>

        {courses.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No courses added yet. Go to Courses and add favorites.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.slice(0, 3).map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-xl p-6 shadow-md flex flex-col justify-between transform transition duration-500 hover:scale-[1.02] hover:shadow-lg"
              >
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-[#0072BC]" />
                    {course.subject}
                  </h4>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: course.total ? `${(course.finished! / course.total) * 100}%` : "0%",
                        backgroundColor: course.color || "#0072BC",
                      }}
                    />
                  </div>

                  <p className="text-sm text-gray-500 mb-4">
                    {course.finished}/{course.total} finished
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    href={"/courses"}
                    className="px-4 py-1 bg-[#B3DDF2] text-[#0072BC] rounded-full text-sm font-medium hover:bg-[#99CCE6] transition-transform duration-300 hover:scale-105"
                  >
                    Go to Course
                  </Link>

                  <div className="flex items-center text-gray-500 text-sm gap-1">
                    <FileText className="w-5 h-5 text-[#0072BC]" />
                    {course.files} files
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Favorite Teachers */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-[#0072BC]">Your Teachers</h3>
          <Link
            href="/bookings"
            className="text-sm text-[#0072BC] hover:underline flex items-center gap-1 transition-transform duration-300 hover:scale-105"
          >
            View All Teachers
          </Link>
        </div>

        {myTeachers.length === 0 ? (
          <p className="text-gray-500">No favorite teachers yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTeachers.slice(0, 3).map((t) => {
              const teacher = t.teacherId;

              return (
                <div
                  key={teacher._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col"
                >
                  <div className="relative">
                    <img
                      src={teacher.thumbnail || "/placeholder.png"}
                      alt={teacher.name}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                    <button
                      type="button"
                      onClick={() => removeFromMyTeachers(teacher._id)}
                      className="absolute top-2 right-2 p-2 rounded-full shadow bg-[#0072BC] text-white"
                      disabled={loading}
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>

                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <h4 className="text-lg font-semibold text-gray-800">{teacher.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">Subject: {teacher.subject}</p>

                    {/* Time Slot Select */}
                    <div className="relative overflow-auto max-h-48">
                      <select
                        className="border rounded-md px-3 py-2 text-sm w-full mb-2"
                        value={selectedSlots[teacher._id] || ""}
                        onChange={(e) =>
                          setSelectedSlots((prev) => ({ ...prev, [teacher._id]: e.target.value }))
                        }
                      >
                        <option value="">Select a time slot</option>
                        {(teacher.availability || [])
                          .filter((slot) => !myBookings.some((b) => b.timeSlot === slot))
                          .map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => bookSession(teacher)}
                      disabled={!selectedSlots[teacher._id] || loading}
                      className={`w-full py-2 rounded-md text-white text-sm ${
                        selectedSlots[teacher._id] ? "bg-[#0072BC] hover:bg-[#005a96]" : "bg-gray-300 cursor-not-allowed"
                      }`}
                    >
                      Book
                    </button>

                    <p className="mt-1 text-xs text-gray-500 text-center">
                      Click the heart to remove from My Teachers.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="w-full h-1 bg-gradient-to-r from-[#0072BC] via-[#66B2E6] to-[#B3DDF2] rounded-full mt-12 animate-pulse z-50 pointer-events-none" />
    </div>
  );
}
