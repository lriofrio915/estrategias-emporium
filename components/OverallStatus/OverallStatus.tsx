// /app/components/OverallStatus.tsx
import React from "react";

interface OverallStatusProps {
  status: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Expansión":
      return "bg-emerald-500";
    case "Pico / Desaceleración":
      return "bg-amber-500";
    case "Contracción":
      return "bg-red-500";
    case "Suelo / Recuperación":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusDescription = (status: string) => {
  switch (status) {
    case "Expansión":
      return "La economía está en una fase de crecimiento saludable. Los indicadores clave son fuertes.";
    case "Pico / Desaceleración":
      return "Atención: Los indicadores adelantados muestran debilidad, mientras que la economía real aún se mantiene. ¡Momento de máxima cautela!";
    case "Contracción":
      return "La economía se está contrayendo. La producción y las ganancias están en declive. Es una fase de recesión.";
    case "Suelo / Recuperación":
      return "La caída se ha detenido. El mercado y los indicadores adelantados apuntan a una recuperación, aunque la economía real aún se muestra débil.";
    default:
      return "No se puede determinar la fase del ciclo económico.";
  }
};

const OverallStatus: React.FC<OverallStatusProps> = ({ status }) => {
  const statusColor = getStatusColor(status);
  const statusDescription = getStatusDescription(status);

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-lg bg-gray-800 text-white">
      <h2 className="text-xl font-bold mb-2">Fase del Ciclo Económico</h2>
      <div className={`text-center p-4 rounded-full ${statusColor} mb-4`}>
        <span className="text-2xl font-semibold">{status}</span>
      </div>
      <p className="text-sm text-center text-gray-300">{statusDescription}</p>
    </div>
  );
};

export default OverallStatus;
