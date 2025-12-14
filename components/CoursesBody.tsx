"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";

interface Course {
  _id: string;
  subject: string;
  title: string;
  description?: string;
  thumbnail?: string;
  tags?: string[];
  color?: string;
}

const LS_FAV_KEY = "favorites_course_ids";

export default function CoursesBody() {
  // ✅ Lazy initializer: read favorites safely from localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LS_FAV_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [courses, setCourses] = useState<Course[]>([]);

  // Fetch courses only
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses", { cache: "no-store" });
        const data: Course[] = await res.json();
        setCourses(data);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };
    fetchCourses();
  }, []);

  // Toggle and persist favorites
  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(LS_FAV_KEY, JSON.stringify(updated));
        }
      } catch (err) {
        console.error("Error saving favorites:", err);
      }
      return updated;
    });
  };

  return (
    <div className="space-y-1">
      {/* Decorative top line */}
      <div className="w-full h-1 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600 rounded-full animate-pulse" />

      {/* Banner */}
      <div className="mt-[48px] sm:mt-2 md:mt-[48px] lg:mt-2 text-center">
        <img
          src="https://i.pinimg.com/1200x/8e/0a/bf/8e0abfcdb580ab0e77fa83da534a815c.jpg"
          alt="Courses Banner"
          className="w-full h-40 sm:h-48 object-cover rounded-xl mb-3 shadow-sm"
        />
        <h3 className="text-lg sm:text-2xl lg:text-3xl font-semibold text-[#0072BC] tracking-wide mb-8">
          Grade 9 Courses
        </h3>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-5">
        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-white rounded-xl shadow-sm flex flex-col overflow-hidden 
                       transition duration-300 hover:shadow-lg hover:scale-[1.02]"
          >
            {/* Image with floating favorite */}
            <div className="relative aspect-square w-full">
              <img
                src={
                  course.thumbnail ||
                  (course.subject?.toLowerCase() === "civic"
                    ? "/civic-default.png"
                    : "/placeholder.png")
                }
                alt={course.subject}
                className="w-full h-full object-cover rounded-t-xl"
              />
              <button
                aria-label="Toggle favorite"
                onClick={() => toggleFavorite(course._id)}
                className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition ${
                  favorites.includes(course._id)
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500 hover:bg-blue-100"
                }`}
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Card content */}
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex flex-col flex-1 justify-between">
              <h4 className="text-base sm:text-lg font-medium text-gray-800 mb-2">
                {course.subject}
              </h4>

              <div className="flex flex-wrap gap-2 mb-4">
                {course.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs rounded-full font-medium"
                    style={{
                      backgroundColor: `${course.color || "#3B82F6"}20`,
                      color: course.color || "#3B82F6",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Main Resources button */}
<Link
  href={`/resources/${course._id}`}
  className="w-full px-4 py-2 rounded-full 
             bg-blue-200 text-gray-800 text-sm font-medium text-center 
             border border-blue-300 shadow-sm
             hover:bg-blue-300 hover:shadow-md transition-colors duration-200"
>
  Resources
</Link>

{/* Support button */}
<Link
  href="/bookings"
  className="w-full mt-2 px-4 py-2 rounded-full 
             bg-blue-400 text-white text-sm font-medium text-center 
             border border-blue-500 shadow-sm
             hover:bg-blue-500 hover:shadow-md transition-colors duration-200"
>
  Get Support
</Link>

            </div>
          </div>
        ))}
      </div>

      {/* Decorative bottom line */}
      <div className="w-full h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-200 rounded-full animate-pulse mt-6" />
    </div>
  );
}
