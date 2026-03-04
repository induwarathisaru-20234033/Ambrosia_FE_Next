import MenuLayoutClient from "./menu-layout";

export default async function MenuLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
<<<<<<< HEAD
  const session = await getServerSession(authOptions);

  // if (!session) {
  //   redirect("/login");
  // }

  return <MenuLayoutClient session={session}>{children}</MenuLayoutClient>;
=======
  return <MenuLayoutClient>{children}</MenuLayoutClient>;
>>>>>>> a56d41653ccc291b1a931bb5608974a8ab0529b2
}
