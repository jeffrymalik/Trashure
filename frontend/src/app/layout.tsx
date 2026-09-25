import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "TRASHURE - Kelola Sampah, Raih Manfaat | Masuk",
  description: "Platform digital pengelolaan bank sampah dan penjemputan sampah terpadu.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${jakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-[#ebf3ed] text-gray-900 selection:bg-[#167e41]/20 selection:text-[#167e41]">
        {children}
      </body>
    </html>
  );
}

