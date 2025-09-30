import React, { useState } from "react";
import { SearchIcon } from "./Icons";

interface SearchBarProps {
  onSearch: (ticker: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [ticker, setTicker] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(ticker.toUpperCase());
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <SearchIcon className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type="text"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        placeholder="Introduzca el ticker (ej: AAPL, TSLA)"
        disabled={isLoading}
        className="block w-full rounded-lg border border-slate-600 bg-slate-700 py-3 pl-11 pr-32 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
      />
      <button
        type="submit"
        disabled={isLoading || !ticker}
        className="absolute inset-y-0 right-0 flex items-center rounded-r-lg bg-cyan-600 px-6 text-sm font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-500"
      >
        {isLoading ? "Analizando..." : "Analizar"}
      </button>
    </form>
  );
};

export default SearchBar;
