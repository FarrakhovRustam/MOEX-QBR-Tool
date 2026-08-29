import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QBR Tool — квартальный обзор команд",
  description:
    "Интерактивный прототип системы квартального ревью продуктовых команд.",
  icons: {
    icon: "/moex-logo.jpg",
    shortcut: "/moex-logo.jpg",
    apple: "/moex-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
