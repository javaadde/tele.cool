import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthWrapper } from "@/components/shared/AuthWrapper";
import { DownloadProgressHandler } from "@/components/shared/DownloadProgressHandler";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TeleCool | Advanced Web Telegram",
  description: "Advanced privacy and download control for Telegram Web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "bg-tg-chat-bg text-tg-text h-screen overflow-hidden")}>
        <AuthWrapper>
          <DownloadProgressHandler />
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
}
