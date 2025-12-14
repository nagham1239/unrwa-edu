"use client";

import { useState, useEffect } from "react";
import { Edit, Save, X, LogOut, Trash2, Award, BookOpen, Calendar } from "lucide-react";
import Link from "next/link";

interface Student {
  _id: string;
  name: string;
  registrationNumber: string;
  profileImage?: string;
  grade?: string;
  bio?: string;
}

interface Course {
  _id: string;
  subject: string;
  title: string;
  thumbnail?: string;
  color?: string;
}

interface Booking {
  _id: string;
  teacherId: { name: string; subject: string };
  timeSlot: string;
  status: string;
}

export default function ProfileBody() {
  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedGrade, setEditedGrade] = useState("Not specified");
  const [editedBio, setEditedBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const defaultProfileImage =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/..."; // your placeholder

  // Fetch student
  const fetchStudent = async () => {
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const s = data[0];
        setStudent({
          ...s,
          profileImage: s.profileImage || defaultProfileImage,
        });
        setEditedName(s.name);
        setEditedGrade(s.grade || "Not specified");
        setEditedBio(s.bio || "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      if (Array.isArray(data)) setCourses(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data: Booking[] = await res.json();
      setBookings(data.filter((b) => b.status === "confirmed"));
    } catch (err) {
      console.error(err);
      setBookings([]);
    }
  };

  useEffect(() => {
    fetchStudent();
    fetchCourses();
    fetchBookings();
  }, []);

  const saveProfile = async () => {
    if (!student) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/students/${student._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editedName,
          grade: editedGrade,
          bio: editedBio,
          profileImage: student.profileImage || defaultProfileImage,
        }),
      });
      const updated = await res.json();
      setStudent(updated);
      setIsEditing(false);
      alert("Profile saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete booking");
      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete booking.");
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    alert("Logged out!");
  };

  if (!student) {
    return (
      <div className="text-center text-gray-600">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header line */}
      <div className="w-full h-1 bg-gradient-to-r from-[#B3DDF2] via-[#66B2E6] to-[#0072BC] rounded-full animate-pulse" />

      {/* Profile Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#0072BC]">My Profile</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white shadow-md rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
        <img
          src={student.profileImage || defaultProfileImage}
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover border-4 border-[#B3DDF2]"
        />
        <div className="flex-1 text-center sm:text-left">
          {isEditing ? (
            <>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-2xl font-bold text-[#0072BC] mb-2 border rounded px-2 py-1 w-full"
              />
              <input
                type="text"
                value={editedGrade}
                onChange={(e) => setEditedGrade(e.target.value)}
                placeholder="Grade"
                className="text-gray-600 mb-2 border rounded px-2 py-1 w-full"
              />
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                placeholder="Bio"
                className="text-gray-600 mb-4 border rounded px-2 py-1 w-full"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={saveProfile}
                  disabled={loading}
                  className="px-4 py-2 bg-[#0072BC] text-white rounded-full hover:bg-[#005a96] transition"
                >
                  <Save className="w-4 h-4 inline mr-1" /> {loading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition"
                >
                  <X className="w-4 h-4 inline mr-1" /> Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-[#0072BC] mb-2">{student.name}</h3>
              <p className="text-gray-600 mb-2">Registration: {student.registrationNumber}</p>
              <p className="text-gray-600 mb-2">Grade: {student.grade || "Not specified"}</p>
              <p className="text-gray-600 mb-4">Bio: {student.bio || "Not available"}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-[#0072BC] text-white rounded-full hover:bg-[#005a96] transition"
              >
                <Edit className="w-4 h-4 inline mr-1" /> Edit Profile
              </button>
            </>
          )}
        </div>
      </div>


      {/* Enrolled Courses */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h3 className="text-xl font-bold text-[#0072BC] mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Enrolled Courses
        </h3>
        {courses.length === 0 ? (
          <p className="text-gray-600">No courses available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Link
                key={course._id}
                href={`/courses/${course._id}`}
                className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition"
              >
                <img
                  src={course.thumbnail || "/placeholder.png"}
                  alt={course.subject}
                  className="w-full h-24 object-cover rounded mb-2"
                />
                <h4 className="font-semibold text-[#0072BC]">{course.subject}</h4>
                <p className="text-sm text-gray-600">{course.title}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Lessons */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h3 className="text-xl font-bold text-[#0072BC] mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" /> Upcoming Sessions
        </h3>
        {bookings.length === 0 ? (
          <p className="text-gray-600">No upcoming sessions.</p>
        ) : (
          <ul className="space-y-2">
            {bookings.map((b) => (
              <li key={b._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{b.teacherId.subject} with {b.teacherId.name}</p>
                  <p className="text-xs text-gray-500">{b.timeSlot}</p>
                </div>
                <button
                  onClick={() => deleteBooking(b._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Settings */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h3 className="text-xl font-bold text-[#0072BC] mb-4">Settings</h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Enable Notifications</span>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="w-5 h-5 text-[#0072BC] focus:ring-[#0072BC]"
          />
        </div>
      </div>

      <div className="w-full h-1 bg-gradient-to-r from-[#0072BC] via-[#66B2E6] to-[#B3DDF2] rounded-full animate-pulse" />
    </div>
  );
}
