"use client";

import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { MoverQuote } from "@/types/api";

// Interfaz para las props del componente
interface Props {
  title: string;
  type: "gainers" | "losers";
  movers: MoverQuote[];
}

export default function TopMovers({ title, type, movers }: Props) {
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
      </div>
      <ul className="divide-y divide-gray-200">
        {movers.slice(0, 10).map((mover) => (
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
              <p className="text-sm text-gray-500 truncate max-w-[150px] sm:max-w-xs">
                {mover.longName || mover.symbol}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                ${(mover.regularMarketPrice ?? 0).toFixed(2)}
              </p>
              <p className={`text-sm font-semibold ${textColor}`}>
                {isGainer ? "+" : ""}
                {(mover.regularMarketChangePercent ?? 0).toFixed(2)}%
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
