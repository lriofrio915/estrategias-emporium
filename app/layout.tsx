// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '../components/Shared/Navbar'; // Asegúrate de que esta importación sea correcta

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "Estrategia de Trading Intradía",
  description: "Un Enfoque Integrado Macro-Técnico",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Navbar /> 
        <div className="pt-16 sm:pt-20"> 
          {children} 
        </div>
      </body>
    </html>
  );
}