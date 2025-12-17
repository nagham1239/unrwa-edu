"use client";

import { useEffect, useState } from "react";
import { LogOut, Save, X, Edit, Plus } from "lucide-react";

const defaultProfileImage = "/profilepic.jpg";

interface AvailabilitySlot {
  day: string;
  time: string;
}

interface Teacher {
  _id: string;
  name: string;
  bio?: string;
  profileImage?: string;
  meetingLink?: string;
  availability: AvailabilitySlot[];
}

export default function TeacherProfile() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [newDay, setNewDay] = useState("");
  const [newTime, setNewTime] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ----------------------------------
     Load teacher after mount (SAFE)
  ---------------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function loadTeacher() {
      try {
        const teacherId = localStorage.getItem("teacherId");
        if (!teacherId) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/teachers/${teacherId}/settings`);
        if (!res.ok) throw new Error("Failed to load");

        const data = await res.json();

        if (!cancelled) {
          setTeacher({
            _id: teacherId,
            name: data.name || "Teacher",
            bio: data.bio || "",
            profileImage: data.profileImage || defaultProfileImage,
            meetingLink: data.meetingLink || "",
            availability: data.availability || [],
          });

          setEditedName(data.name || "");
          setEditedBio(data.bio || "");
          setMeetingLink(data.meetingLink || "");
          setAvailability(data.availability || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTeacher();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ----------------------------------
     Image preview
  ---------------------------------- */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  /* ----------------------------------
     Save profile
  ---------------------------------- */
  const saveProfile = async () => {
    if (!teacher) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/teachers/${teacher._id}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editedName,
          bio: editedBio,
          meetingLink,
          availability,
          profileImage: previewUrl || teacher.profileImage,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      setTeacher({
        ...teacher,
        name: editedName,
        bio: editedBio,
        meetingLink,
        availability,
        profileImage: previewUrl || teacher.profileImage,
      });

      setIsEditing(false);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------
     Availability
  ---------------------------------- */
  const addAvailability = () => {
    if (!newDay || !newTime) return;
    setAvailability([...availability, { day: newDay, time: newTime }]);
    setNewDay("");
    setNewTime("");
  };

  const removeAvailability = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  /* ----------------------------------
     Logout
  ---------------------------------- */
  const handleLogout = () => {
    localStorage.removeItem("teacherId");
    setTeacher(null);
  };

  /* ----------------------------------
     UI STATES
  ---------------------------------- */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600">
        Loading…
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600">
        No teacher logged in.
      </div>
    );
  }

  /* ----------------------------------
     UI
  ---------------------------------- */
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#0072BC]">My Profile</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white shadow rounded-xl p-6 flex flex-col sm:flex-row gap-6">
        <img
          src={previewUrl || teacher.profileImage || defaultProfileImage}
          className="w-28 h-28 rounded-full object-cover border"
          alt="Profile"
        />

        <div className="flex-1">
          {isEditing ? (
            <>
              <input
                className="w-full border rounded px-3 py-2 mb-2"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />

              <textarea
                className="w-full border rounded px-3 py-2 mb-2"
                rows={3}
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
              />

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mb-2"
              />

              <input
                className="w-full border rounded px-3 py-2 mb-2"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="Meeting link"
              />

              <h4 className="font-semibold mt-4">Availability</h4>
              {availability.map((slot, i) => (
                <div key={i} className="flex justify-between bg-gray-100 p-2 rounded mt-1">
                  <span>{slot.day} – {slot.time}</span>
                  <button onClick={() => removeAvailability(i)} className="text-red-500">×</button>
                </div>
              ))}

              <div className="flex gap-2 mt-2">
                <input
                  className="border px-2 py-1 rounded flex-1"
                  placeholder="Day"
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                />
                <input
                  className="border px-2 py-1 rounded flex-1"
                  placeholder="Time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
                <button
                  onClick={addAvailability}
                  className="bg-[#0072BC] text-white px-3 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={saveProfile}
                  className="bg-[#0072BC] text-white px-4 py-2 rounded"
                >
                  <Save className="inline w-4 h-4 mr-1" /> Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  <X className="inline w-4 h-4 mr-1" /> Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold">{teacher.name}</h3>
              <p className="text-gray-600">{teacher.bio || "No bio"}</p>

              <h4 className="mt-3 font-semibold">Availability</h4>
              {availability.length === 0 ? (
                <p className="text-gray-500">None set</p>
              ) : (
                availability.map((slot, i) => (
                  <p key={i}>{slot.day} – {slot.time}</p>
                ))
              )}

              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 bg-[#0072BC] text-white px-4 py-2 rounded"
              >
                <Edit className="inline w-4 h-4 mr-1" /> Edit Profile
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
