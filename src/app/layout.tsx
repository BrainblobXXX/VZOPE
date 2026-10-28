import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "В ЖОПЕ — прототип",
  description:
    "Прототип MVP «В ЖОПЕ»: ламповый ЭЛТ-телевизор, флудилка, кассеты, телемагазин за мем-коины. Пиксель-арт, сканлайны, снег.",
  keywords: ["В ЖОПЕ", "прототип", "ЭЛТ", "пиксель-арт", "ретро"],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><rect width='16' height='16' fill='%23331A00'/><rect x='2' y='3' width='12' height='8' fill='%23FFB000'/><rect x='4' y='5' width='3' height='4' fill='%23331A00'/><rect x='9' y='5' width='3' height='4' fill='%23331A00'/></svg>",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2B2622",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* пиксельный моноширинный шрифт с кириллицей */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ background: "#0a0806" }}>
        {children}
      </body>
    </html>
  );
}
