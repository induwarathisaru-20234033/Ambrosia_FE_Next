import "bootstrap/dist/css/bootstrap.min.css";
import { Metadata } from "next";
import localFont from "next/font/local";
import "primeicons/primeicons.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "./globals.css";
import LayoutClient from "./layout.client";

const inter = localFont({
  src: "../fonts/Inter/Inter-VariableFont_opsz,wght.ttf",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ambrosia",
  description: "Ambrosia FE Next.js Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={`${inter.variable}`}>
      <body className={inter.className}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
