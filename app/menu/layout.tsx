import { getServerSession } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { redirect } from "next/navigation";
import MenuLayoutClient from "./menu-layout";
import axiosAuth from "@/utils/AxiosInstance";

export default async function MenuLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return <MenuLayoutClient session={session}>{children}</MenuLayoutClient>;
}
