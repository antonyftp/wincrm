import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WIN CRM",
  description: "CRM immobilier — gestion des leads et suivi commercial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
