import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CompararTVs — Compare e encontre a melhor TV",
  description: "Compare TVs por especificações, preço, tecnologia de tela, reviews e avaliações. Adicione por link, modelo ou foto da caixa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
