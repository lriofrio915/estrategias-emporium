// /app/components/IndicatorCard.tsx
import React from "react";

// Definimos los tipos de bandera para asegurar la consistencia
type FlagColor = "green" | "yellow" | "red" | "orange";

interface IndicatorCardProps {
  name: string;
  value: string;
  type: "Adelantado" | "Coincidente" | "Mercado";
  flag: FlagColor;
}

const getFlagColorClass = (flag: FlagColor) => {
  switch (flag) {
    case "green":
      return "bg-emerald-500";
    case "yellow":
      return "bg-amber-500";
    case "red":
      return "bg-red-500";
    case "orange":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
};

const IndicatorCard: React.FC<IndicatorCardProps> = ({
  name,
  value,
  type,
  flag,
}) => {
  const flagColorClass = getFlagColorClass(flag);

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center text-center">
      <div className={`w-8 h-8 rounded-full ${flagColorClass} mb-4`} />
      <h3 className="text-lg font-semibold text-white">{name}</h3>
      <p className="text-sm text-gray-400 mb-2">{type}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
};

export default IndicatorCard;
