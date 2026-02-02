"use client";

import { useEffect, useState } from "react";
import { useChatStore } from "@/store/useChatStore";
import { useRouter, usePathname } from "next/navigation";

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useChatStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for hydration to finish to avoid redirecting based on initial state
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady && !isAuthenticated && pathname !== "/login") {
      router.push("/login");
    }
  }, [isAuthenticated, pathname, router, isReady]);

  if (!isReady) return null; // Or a loading spinner

  return <>{children}</>;
};
