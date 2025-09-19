import type { Metadata } from "next";
import localFont from 'next/font/local';
import { UserProvider } from '@/context/UserContext';
import { AchievementProvider } from '@/context/AchievementContext';
import { CompletionProvider } from '@/context/CompletionContext';
import { AdminProvider } from '@/context/AdminContext';
import AchievementManager from '@/components/AchievementManager';
import XpBar from '@/components/XpBar';
import CompletionChecker from '@/components/CompletionChecker';
import "./globals.css";

// This path must be correct and relative to the 'app' directory
const minecraftFont = localFont({
  src: './fonts/Minecraft.ttf', 
  display: 'swap',
  variable: '--font-minecraft',
});

export const metadata: Metadata = {
  title: "Product Feedback",
  description: "A simplified feedback platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${minecraftFont.variable} font-minecraft`}>
      <body>
        <AdminProvider>
          <AchievementProvider>
            <UserProvider>
            <CompletionProvider>
              {children}
              <XpBar />
              <CompletionChecker />
            </CompletionProvider>
            </UserProvider>
            <AchievementManager />
          </AchievementProvider>
        </AdminProvider>
      </body>
    </html>
  );
}