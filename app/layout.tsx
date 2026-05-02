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
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t);})()`
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
