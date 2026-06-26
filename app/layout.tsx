import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Theme Site",
  description: "Generated theme site",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
