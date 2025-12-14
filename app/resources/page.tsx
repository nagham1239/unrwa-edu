"use client";

import ResourcesBody from "@/components/ResourcesBody";
import RightPanel from "@/components/RightPanel";

export default function ResourcesPage() {
  return (
    <div className="flex flex-1 min-h-screen bg-gray-50">
      {/* Resources Body */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <ResourcesBody />
      </div>

      {/* Right Panel (desktop only) */}
      <div className="hidden lg:block w-72 xl:w-80 p-4">
        <RightPanel />
      </div>
    </div>
  );
}
