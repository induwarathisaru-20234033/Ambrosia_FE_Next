import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import MenuLayoutClient from "./menu-layout";
import { authOptions } from "@/lib/auth";

export default async function MenuLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <MenuLayoutClient session={session}>{children}</MenuLayoutClient>;
}
