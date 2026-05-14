"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/onboarding");
  }, [router]);

  return (
    <div className="opacity-0 pointer-events-none">
      <AuthForm initialTab="register" />
    </div>
  );
}
