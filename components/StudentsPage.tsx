"use client";

import React, { useEffect, useState } from "react";
import TeacherSidebar from "@/components/TeacherSidebar";

interface Student {
  _id: string;
  name: string;
  registrationNumber: string;
  profileImage: string;
  grade: string;
  bio: string;
  teacherId?: { _id: string; name: string; subject: string }; // Populated teacher info
}

interface TeacherStudentLink {
  _id: string;
  teacherId: string;
  studentId: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const teacherId = "693cdbee5e3e16b36bb1074f"; // Hardcoded; replace with dynamic value

  const fetchLinkedStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: Fetch links from teacherstudents for this teacher
      const linksRes = await fetch(`/api/teacherstudents?teacherId=${teacherId}`);
      if (!linksRes.ok) throw new Error(`Failed to fetch links: ${linksRes.status}`);
      const links: TeacherStudentLink[] = await linksRes.json();

      // Step 2: Extract unique student IDs
      const studentIds = Array.from(new Set(links.map((l) => l.studentId).filter(Boolean)));
      if (studentIds.length === 0) {
        setStudents([]);
        return;
      }

      // Step 3: Fetch students by IDs with populated teacher info
      const idsQuery = studentIds.join(",");
      const studentsRes = await fetch(`/api/students?ids=${idsQuery}&populate=teacherId`);
      if (!studentsRes.ok) throw new Error(`Failed to fetch students: ${studentsRes.status}`);
      const data: Student[] = await studentsRes.json();
      setStudents(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error("Fetch error:", message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinkedStudents();
  }, [teacherId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed to delete student: ${res.status}`);
      setStudents(students.filter((s) => s._id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(message);
    }
  };

  const editStudent = async (student: Student) => {
    const name = prompt("Student Name:", student.name);
    const bio = prompt("Student Bio:", student.bio || "");
    if (name === null) return;

    try {
      const res = await fetch(`/api/students/${student._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio }),
      });
      if (!res.ok) throw new Error(`Failed to update student: ${res.status}`);
      const updatedStudent: Student = await res.json();
      setStudents((prev) =>
        prev.map((s) => (s._id === updatedStudent._id ? updatedStudent : s))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0072BC]"></div>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning={true} className="flex min-h-screen bg-[#E6F4FB]">
      {/* Teacher Sidebar */}
      <TeacherSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8">
        <h1 className="text-3xl font-bold text-[#0072BC] mb-6">My Linked Students</h1>

        {error && (
          <p className="text-red-500 mb-4 text-center font-medium">{error}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div
              key={student._id}
              className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <img
                  src={student.profileImage}
                  alt={student.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#B3DDF2]"
                />
                <div>
                  <h2 className="font-semibold text-lg text-gray-800">
                    {student.name}
                  </h2>
                  <p className="text-sm text-gray-500">{student.grade}</p>
                  {student.teacherId && (
                    <p className="text-sm text-[#0072BC]">
                      Teacher: {student.teacherId.name} ({student.teacherId.subject})
                    </p>
                  )}
                </div>
              </div>

              <p className="mt-3 text-gray-600 text-sm line-clamp-3">
                {student.bio || "No bio available."}
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  className="flex-1 bg-[#0072BC] text-white px-3 py-2 rounded-full hover:bg-[#005A99] transition"
                  onClick={() => editStudent(student)}
                >
                  Edit
                </button>
                <button
                  className="flex-1 bg-red-500 text-white px-3 py-2 rounded-full hover:bg-red-600 transition"
                  onClick={() => handleDelete(student._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {students.length === 0 && !loading && !error && (
          <p className="text-gray-500 text-center mt-10">
            No students are linked to you yet.
          </p>
        )}
      </div>
    </div>
  );
}
