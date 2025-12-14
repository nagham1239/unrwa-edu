import "./globals.css";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Change bg-gray-50 → bg-[#E6F4FB] */}
      <body className="bg-[#E6F4FB]">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar />

          {/* Main content area */}
          <main className="flex-1 lg:ml-72">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
