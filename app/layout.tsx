import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QBR Tool — квартальный обзор команд",
  description:
    "Интерактивный прототип системы квартального ревью продуктовых команд.",
  icons: {
    icon: "https://s.rbk.ru/v1_companies_s3/media/trademarks/d9413144-9ec6-48aa-ab15-570e4cdbaa3f.jpg",
    shortcut:
      "https://s.rbk.ru/v1_companies_s3/media/trademarks/d9413144-9ec6-48aa-ab15-570e4cdbaa3f.jpg",
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
