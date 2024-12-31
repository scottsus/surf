import "./globals.css";

import { Toaster } from "@repo/ui/components/ui/toaster";
import { Footer } from "~/src/components/footer";
import { Navbar } from "~/src/components/navbar";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Surf",
  description: "Equip your browser with AI superpowers",
  icons: [{ rel: "icon", url: "/github.svg" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex h-screen w-full flex-col items-center">
        <Toaster />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
