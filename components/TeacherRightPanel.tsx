"use client";

import React, { useEffect, useState } from "react";

interface AvailabilityItem {
  day: string;
  time: string;
}

interface TeacherRightPanelProps {
  teacherId: string;
}

export default function TeacherRightPanel({ teacherId }: TeacherRightPanelProps) {
  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  const [meetingLink, setMeetingLink] = useState<string>("https://zoom.us/...");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newDay, setNewDay] = useState<string>("");
  const [newTime, setNewTime] = useState<string>("");

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/teachers/${teacherId}/settings`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Failed to load settings: ${res.status}`);
        const data = await res.json();
        setAvailability(data.availability || []);
        setMeetingLink(data.meetingLink || "https://zoom.us/...");
      } catch (err) {
        console.error(err);
        setError("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) fetchSettings();
  }, [teacherId]);

  const saveSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teachers/${teacherId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability, meetingLink }),
      });
      if (!res.ok) throw new Error(`Failed to save settings: ${res.status}`);
      alert("Settings saved successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  const addAvailability = () => {
    if (!newDay || !newTime) return;
    setAvailability([...availability, { day: newDay, time: newTime }]);
    setNewDay("");
    setNewTime("");
  };

  const removeAvailability = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-10 w-10 rounded-full border-b-4 border-[#0072BC]" />
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="w-full max-w-sm lg:max-w-md xl:max-w-lg space-y-6 px-4 lg:px-0 overflow-y-auto max-h-screen sticky top-0"
    >
      <div className="bg-white rounded-2xl p-6 shadow-md animate-fadeIn transform transition duration-500 hover:scale-[1.02] hover:shadow-lg flex flex-col">
        <h3 className="text-lg font-semibold text-[#0072BC] mb-4">
          Quick Actions
        </h3>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Availability */}
        <div className="flex flex-col flex-1">
          <h4 className="font-medium text-gray-700 mb-2">Availability</h4>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
            {availability.length === 0 && (
              <p className="text-gray-400 text-sm italic">
                No availability set.
              </p>
            )}

            {availability.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-[#F5FAFE] border border-[#B3DDF2] px-3 py-2 rounded-lg transition hover:shadow-sm"
              >
                <span className="text-gray-700 text-sm">
                  {item.day}{" "}
                  <span className="text-gray-500">{item.time}</span>
                </span>
                <button
                  onClick={() => removeAvailability(index)}
                  className="text-red-500 text-lg font-bold hover:text-red-700 transition"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Inputs */}
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Day (Mon / 17 Dec)"
              className="border border-gray-300 rounded-full px-4 py-2 w-full focus:ring-2 focus:ring-[#0072BC] outline-none text-sm"
              value={newDay}
              onChange={(e) => setNewDay(e.target.value)}
            />
            <input
              type="text"
              placeholder="Time (10 AM / 17:30)"
              className="border border-gray-300 rounded-full px-4 py-2 w-full focus:ring-2 focus:ring-[#0072BC] outline-none text-sm"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />
            <button
              onClick={addAvailability}
              className="w-full bg-[#0072BC] text-white py-2 rounded-full font-medium hover:bg-[#005A99] transition-transform duration-300 hover:scale-105"
            >
              Add Availability
            </button>
          </div>
        </div>

        {/* Meeting Link */}
        <div className="mt-6 space-y-2">
          <h4 className="font-medium text-gray-700">Meeting Link</h4>
          <input
            type="text"
            className="border border-gray-300 rounded-full px-4 py-2 w-full focus:ring-2 focus:ring-[#0072BC] outline-none text-sm"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
          />
        </div>

        {/* Save */}
        <button
          onClick={saveSettings}
          className="mt-6 w-full bg-[#0072BC] text-white py-2 rounded-full font-medium hover:bg-[#005A99] transition-transform duration-300 hover:scale-105"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
