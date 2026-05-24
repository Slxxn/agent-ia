"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./authContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (!isAdmin) { router.replace("/mon-espace"); return; }
  }, [user, loading, isAdmin, router]);

  if (loading || !user || !isAdmin) return null;
  return <>{children}</>;
}
