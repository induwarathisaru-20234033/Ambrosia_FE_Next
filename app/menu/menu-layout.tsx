"use client";

import Navbar from "@/components/Navbar";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import "../globals.css";

export default function MenuLayoutClient({
  children,
  session,
}: Readonly<{
  children: React.ReactNode;
  session: Session;
}>) {
  return (
    <SessionProvider session={session}>
      <Navbar />
      <div className="ml-5">{children}</div>
    </SessionProvider>
  );
}
