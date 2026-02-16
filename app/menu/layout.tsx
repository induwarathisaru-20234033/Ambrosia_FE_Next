import MenuLayoutClient from "./menu-layout";

export default async function MenuLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <MenuLayoutClient>{children}</MenuLayoutClient>;
}
