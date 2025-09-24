"use client";

import { useState } from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

// Tipos para los datos de ejemplo
interface Mover {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

interface Props {
  title: string;
  type: "gainers" | "losers";
  dailyMovers: Mover[];
  ytdMovers: Mover[];
}

export default function TopMovers({
  title,
  type,
  dailyMovers,
  ytdMovers,
}: Props) {
  const [timeframe, setTimeframe] = useState<"daily" | "ytd">("daily");
  const movers = timeframe === "daily" ? dailyMovers : ytdMovers;

  const isGainer = type === "gainers";
  const textColor = isGainer ? "text-green-600" : "text-red-600";
  const icon = isGainer ? (
    <ArrowUpIcon className="h-6 w-6 text-green-500" />
  ) : (
    <ArrowDownIcon className="h-6 w-6 text-red-500" />
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeframe("daily")}
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === "daily"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Día
          </button>
          <button
            onClick={() => setTimeframe("ytd")}
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === "ytd"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Año
          </button>
        </div>
      </div>
      <ul className="divide-y divide-gray-200">
        {movers.map((mover) => (
          <li
            key={mover.symbol}
            className="py-3 flex justify-between items-center"
          >
            <div>
              <Link
                href={`/stock-screener/${mover.symbol.toLowerCase()}`}
                className="text-indigo-600 font-semibold hover:underline"
              >
                {mover.symbol}
              </Link>
              <p className="text-sm text-gray-500 truncate max-w-[150px]">
                {mover.name}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                ${mover.price.toFixed(2)}
              </p>
              <p className={`text-sm font-semibold ${textColor}`}>
                {isGainer ? "+" : ""}
                {mover.changePercent.toFixed(2)}%
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
