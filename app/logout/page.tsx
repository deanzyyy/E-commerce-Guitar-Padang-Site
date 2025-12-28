"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
        });
        router.push("/login");
      } catch (error) {
        console.error("Logout error:", error);
        router.push("/login");
      }
    }

    logout();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <p>Logging out...</p>
    </div>
  );
}

