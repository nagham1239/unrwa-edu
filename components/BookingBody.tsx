"use client";

import { Heart, Calendar, Filter } from "lucide-react";
import { useEffect, useState } from "react";

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

interface TeacherWithMeta extends Teacher {
  myTeacherId?: string;
}

interface Booking {
  _id: string;
  teacherId: Teacher | string;
  teacherName?: string;
  studentName: string;
  timeSlot: string;
  status: string;
}

export default function BookingBody() {
  const [allTeachers, setAllTeachers] = useState<TeacherWithMeta[]>([]);
  const [myTeachers, setMyTeachers] = useState<TeacherWithMeta[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});

  const fetchAllTeachers = async () => {
    try {
      const res = await fetch("/api/teachers");
      if (!res.ok) throw new Error("Failed to fetch teachers");
      const data: Teacher[] = await res.json();
      setAllTeachers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyTeachers = async () => {
    try {
      const res = await fetch("/api/myteachers");
      if (!res.ok) throw new Error("Failed to fetch my teachers");
      const data: MyTeacherResponse[] = await res.json();
      setMyTeachers(
        data.map((entry) => ({
          ...entry.teacherId,
          myTeacherId: entry._id,
        }))
      );
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

  useEffect(() => {
    fetchAllTeachers();
    fetchMyTeachers();
    fetchMyBookings();
    const handleBookingUpdate = () => fetchMyBookings();
    window.addEventListener("booking-updated", handleBookingUpdate);
    return () => window.removeEventListener("booking-updated", handleBookingUpdate);
  }, []);

  const addToMyTeachers = async (teacherId: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/myteachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId }),
      });
      if (!res.ok) throw new Error("Failed to add teacher");
      await fetchMyTeachers();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromMyTeachers = async (teacherId: string) => {
    const entry = myTeachers.find((t) => t._id === teacherId);
    if (!entry?.myTeacherId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/myteachers/${entry.myTeacherId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove teacher");
      await fetchMyTeachers();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const bookSession = async (teacher: TeacherWithMeta) => {
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
      window.dispatchEvent(new Event("booking-updated"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete booking");
      window.dispatchEvent(new Event("booking-updated"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSearch = (list: TeacherWithMeta[]) =>
    list.filter(
      (t) =>
        (selectedSubject ? t.subject === selectedSubject : true) &&
        (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.subject.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const filteredMyTeachers = filterAndSearch(myTeachers);
  const filteredAllTeachers = filterAndSearch(allTeachers.filter((t) => !myTeachers.some((mt) => mt._id === t._id)));

  const TeacherCard = ({ teacher, isMyTeacher, showRemoveHint }: { teacher: TeacherWithMeta; isMyTeacher: boolean; showRemoveHint?: boolean }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col">
      <div className="relative">
        <img src={teacher.thumbnail || "/placeholder.png"} alt={teacher.name} className="w-full h-48 object-cover rounded-t-xl" />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            isMyTeacher ? removeFromMyTeachers(teacher._id) : addToMyTeachers(teacher._id);
          }}
          disabled={loading}
          className={`absolute top-2 right-2 p-2 rounded-full shadow ${
            isMyTeacher ? "bg-[#0072BC] text-white" : "bg-white text-[#0072BC]"
          }`}
        >
          <Heart className={`w-5 h-5 ${isMyTeacher ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <h4 className="text-lg font-semibold text-gray-800">{teacher.name}</h4>
        <p className="text-sm text-gray-600 mb-2">Subject: {teacher.subject}</p>

        {/* Fixed select */}
        <div className="relative overflow-auto max-h-48">
          <select
            className="border rounded-md px-3 py-2 text-sm w-full mb-2"
            value={selectedSlots[teacher._id] || ""}
            onChange={(e) => setSelectedSlots((prev) => ({ ...prev, [teacher._id]: e.target.value }))}
          >
            <option value="">Select a time slot</option>
            {(teacher.availability || []).filter((slot) => !myBookings.some((b) => b.timeSlot === slot)).map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            bookSession(teacher);
          }}
          disabled={!selectedSlots[teacher._id] || loading}
          className={`w-full py-2 rounded-md text-white text-sm ${
            selectedSlots[teacher._id] ? "bg-[#0072BC] hover:bg-[#005a96]" : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Book
        </button>

        {showRemoveHint && isMyTeacher && <p className="mt-1 text-xs text-gray-500 text-center">Click the heart to remove from My Teachers.</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 overflow-auto h-[calc(100vh-4rem)] p-4">
      {/* Filters */}
      <div className="mt-16 lg:mt-0 flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-4 rounded-xl shadow-md animate-fade-in">
        <Filter className="w-5 h-5 text-[#0072BC] flex-shrink-0" />
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0072BC] w-full sm:w-auto transition-colors"
        >
          <option value="">All Subjects</option>
          {[...new Set(allTeachers.map((t) => t.subject))].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="relative w-full sm:w-auto flex-1">
          <input
            type="text"
            placeholder="Search by name or subject"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0072BC] transition-shadow"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
        </div>
      </div>

      {/* My Teachers */}
      <section>
        <h3 className="text-xl font-bold text-[#0072BC] flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5" /> My Teachers
        </h3>
        {filteredMyTeachers.length === 0 ? (
          <p className="text-gray-600">No teachers added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMyTeachers.map((t) => <TeacherCard key={t._id} teacher={t} isMyTeacher showRemoveHint />)}
          </div>
        )}
      </section>

      {/* All Teachers */}
      <section>
        <h3 className="text-xl font-bold text-[#0072BC] flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5" /> All Teachers
        </h3>
        {filteredAllTeachers.length === 0 ? (
          <p className="text-gray-600">No available teachers.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAllTeachers.map((t) => <TeacherCard key={t._id} teacher={t} isMyTeacher={false} />)}
          </div>
        )}
      </section>

      {/* Upcoming Sessions */}
      <section>
        <h3 className="text-xl font-bold text-[#0072BC] flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5" /> Upcoming Sessions
        </h3>
        {myBookings.length === 0 ? (
          <p className="text-gray-600">No upcoming sessions.</p>
        ) : (
          <ul className="space-y-2">
            {myBookings.map((b) => (
              <li key={b._id} className="p-3 bg-white rounded-md shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{typeof b.teacherId === "object" ? b.teacherId.name : b.teacherName}</p>
                  <p className="text-sm text-gray-600">{typeof b.teacherId === "object" ? b.teacherId.subject : ""}</p>
                  <p className="text-xs text-gray-500">{b.timeSlot} — {b.status}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); deleteBooking(b._id); }}
                  className="text-red-600 hover:text-red-800 text-sm px-2 py-1 border border-red-600 rounded"
                  disabled={loading}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
