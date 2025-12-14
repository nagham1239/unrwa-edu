"use client";

import { useEffect, useState } from "react";

interface File {
  _id: string;
  type: string;
  title: string;
  url: string;
}

interface Lesson {
  _id: string;
  title: string;
  files: File[];
}

interface Course {
  _id: string;
  title: string;
  color?: string;
}

const courseIcons: Record<string, string> = {
  Math: "🧮",
  Arabic: "📝",
  English: "📘",
  Physics: "🔬",
  Chemistry: "⚗️",
  Biology: "🧬",
  Geography: "🌍",
  History: "📜",
  "Civic Education": "🏛️",
};

const fileIcons: Record<string, string> = {
  pdf: "📄",
  video: "🎥",
  exercise: "✏️",
  exam: "📝",
};

const LS_PROGRESS_KEY = "course_progress";

export default function ResourcesBody() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [isReady, setIsReady] = useState(false);

  /* ---------- HELPERS ---------- */
  const getFileKey = (courseId: string, file: File) =>
    `${courseId}::${file.url}`;

  /* ---------- LOAD SAVED PROGRESS ---------- */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_PROGRESS_KEY);
      if (stored) {
        setProgress(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load progress", err);
    } finally {
      setIsReady(true);
    }
  }, []);

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesRes = await fetch("/api/courses", { cache: "no-store" });
        const coursesData: Course[] = await coursesRes.json();
        setCourses(coursesData);

        const lessonsData: Record<string, Lesson[]> = {};
        for (const course of coursesData) {
          const res = await fetch(
            `/api/resources?courseId=${course._id}`,
            { cache: "no-store" }
          );
          lessonsData[course._id] = await res.json();
        }
        setLessons(lessonsData);
      } catch (err) {
        console.error("Failed to fetch resources:", err);
      }
    };

    fetchData();
  }, []);

  /* ---------- TOGGLE CHECK ---------- */
  const toggleFile = (courseId: string, file: File) => {
    const key = getFileKey(courseId, file);

    setProgress((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(LS_PROGRESS_KEY, JSON.stringify(next));
      return next;
    });
  };

  /* ---------- LOADING STATES ---------- */
  if (!isReady) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading your progress…
      </div>
    );
  }

  if (courses.length === 0 || Object.keys(lessons).length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading resources…
      </div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <div className="p-6 space-y-10 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <h1 className="text-3xl font-medium text-[#0072BC] text-center">
        📚 Grade 9 Resources
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {courses.map((course) => {
          const courseLessons = lessons[course._id] || [];
          const allFiles = courseLessons.flatMap((l) => l.files);

          const finishedFiles = allFiles.filter((file) =>
            progress[getFileKey(course._id, file)]
          ).length;

          return (
            <div
              key={course._id}
              className="bg-white rounded-2xl shadow-md border hover:shadow-lg"
            >
              {/* HEADER */}
              <div
                className="px-6 py-4 rounded-t-2xl flex items-center gap-2"
                style={{
                  backgroundColor: (course.color || "#0072BC") + "15",
                }}
              >
                <span>{courseIcons[course.title] || "📘"}</span>
                <h2
                  className="text-xl font-medium"
                  style={{ color: course.color || "#0072BC" }}
                >
                  {course.title}
                </h2>
                <span className="ml-auto text-sm text-gray-600">
                  {finishedFiles}/{allFiles.length} finished
                </span>
              </div>

              {/* LESSONS */}
              <div className="p-6 space-y-5">
                {courseLessons.map((lesson) => (
                  <div
                    key={lesson._id}
                    className="bg-gray-50 p-5 rounded-xl border"
                  >
                    <p className="font-medium mb-3">
                      📘 {lesson.title}
                    </p>

                    <ul className="space-y-2">
                      {lesson.files.map((file) => {
                        const key = getFileKey(course._id, file);
                        return (
                          <li
                            key={file._id}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              checked={!!progress[key]}
                              onChange={() =>
                                toggleFile(course._id, file)
                              }
                              className="w-4 h-4 accent-blue-500"
                            />
                            <span>{fileIcons[file.type] || "📄"}</span>
                            <a
                              href={file.url}
                              target="_blank"
                              className="text-blue-600 hover:underline"
                            >
                              {file.title}
                            </a>
                            <span className="text-xs bg-gray-200 px-2 rounded">
                              {file.type}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
