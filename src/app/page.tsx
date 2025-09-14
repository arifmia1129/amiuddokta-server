"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin dashboard since this is an admin-only BDRIS system
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="h-12 w-12 mx-auto mb-4 rounded bg-blue-600"></div>
        <h1 className="text-xl font-semibold text-gray-900">Quick Apply</h1>
        <p className="text-gray-600 mt-2">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

export default HomePage;
