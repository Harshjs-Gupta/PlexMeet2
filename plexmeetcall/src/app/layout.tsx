import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Notification from "@/components/toastifyNotification/notification";
import { SocketProvider } from "./context/socketProvider";

const alefSans = localFont({
  src: "./fonts/Alef-Regular.ttf",
  variable: "--font-alef-sans",
  weight: "100 900",
});
const alefMono = localFont({
  src: "./fonts/Alef-Regular.ttf",
  variable: "--font-alef-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Plex Meet",
  description: "Created by Harsh Gupta",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${alefSans.variable} ${alefMono.variable} antialiased`}>
        <SocketProvider>
          <Notification />
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
