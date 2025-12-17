import BookingBody from "@/components/BookingBody";
import RightPanel from "@/components/RightPanel";

export default async function BookingPage() {
  // ✅ Fetch from /api/teachers now
  const res = await fetch("http://localhost:3000/api/teachers", {
    cache: "no-store",
  });
  const teachers = res.ok ? await res.json() : [];

  return (
    <div className="flex flex-1 min-h-screen bg-gray-50">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <BookingBody />
      </div>
      <div className="hidden lg:block w-72 xl:w-80 p-4">
        <RightPanel />
      </div>
    </div>
  );
}