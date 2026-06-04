"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { useOffline } from "@/components/offline-provider";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useOffline();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return <AuthForm initialTab="login" />;
}
