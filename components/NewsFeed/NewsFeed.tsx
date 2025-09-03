"use client";

import React from "react";
import Image from "next/image"; // Importamos el componente Image de Next.js

// Datos de ejemplo para las noticias
const newsItems = [
  {
    title:
      "La Reserva Federal podría subir las tasas de interés antes de lo esperado.",
    date: "28 de octubre de 2023",
    source: "Bloomberg Línea",
    image: "https://placehold.co/400x200/525252/FFF?text=Análisis+del+mercado",
    url: "#",
  },
  {
    title:
      "El precio del petróleo WTI sube a medida que la tensión geopolítica aumenta.",
    date: "28 de octubre de 2023",
    source: "Financial Times",
    image: "https://placehold.co/400x200/525252/FFF?text=Petróleo+WTI",
    url: "#",
  },
  {
    title:
      "Bitcoin se recupera y supera los $35,000 en medio del optimismo regulatorio.",
    date: "28 de octubre de 2023",
    source: "CoinDesk",
    image: "https://placehold.co/400x200/525252/FFF?text=Criptomonedas",
    url: "#",
  },
  {
    title:
      'Los datos de empleo superan las expectativas, reforzando la narrativa de un "aterrizaje suave".',
    date: "28 de octubre de 2023",
    source: "Reuters",
    image: "https://placehold.co/400x200/525252/FFF?text=Empleo+en+EE.UU.",
    url: "#",
  },
];

export default function NewsFeed() {
  return (
    <div className="rounded-2xl shadow-lg bg-gray-800 text-white p-4 sm:p-6 lg:p-8 mt-8">
      <h3 className="text-xl sm:text-2xl font-bold mb-4">
        Las noticias del día
      </h3>
      <p className="text-sm text-gray-400 mb-6">
        Las últimas noticias de economía. Todo sobre las noticias de última hora
        en el mundo y Latinoamérica.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsItems.map((news, index) => (
          <div
            key={index}
            className="bg-gray-700 rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105"
          >
            <a href={news.url} target="_blank" rel="noopener noreferrer">
              {/* Se reemplazó la etiqueta <img> con el componente Image de Next.js */}
              <Image
                src={news.image}
                alt={news.title}
                width={400} // Se especifican el ancho y alto para la optimización
                height={200}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <p className="text-xs text-gray-400 mb-1">
                  {news.source} • {news.date}
                </p>
                <h4 className="text-md font-semibold text-white mb-2">
                  {news.title}
                </h4>
                <p className="text-sm text-blue-400 hover:text-blue-300">
                  Leer más
                </p>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
