import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Shared/Navbar";
import { getPortfolios } from "@/app/actions/portfolioActions"; // 1. Importa la Server Action

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "Estrategia de Trading Intradía",
  description: "Un Enfoque Integrado Macro-Técnico",
};

// 2. Convierte el layout en un componente asíncrono
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 3. Obtiene los portafolios en el servidor
  const portfolios = await getPortfolios();

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-white text-gray-900`}
        suppressHydrationWarning
      >
        {/* 4. Pasa los portafolios como prop al Navbar */}
        <Navbar portfolios={portfolios} />

        <main className="min-h-screen pt-16 sm:pt-20">{children}</main>
      </body>
    </html>
  );
}
