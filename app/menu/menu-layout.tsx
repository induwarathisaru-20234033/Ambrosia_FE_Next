"use client";

import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAccessToken } from "@/utils/auth/authTokens";
import "../globals.css";

export default function MenuLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    setIsReady(true);
  }, [router]);

  if (!isReady) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="ml-5">{children}</div>
    </>
  );
}
