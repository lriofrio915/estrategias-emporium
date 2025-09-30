import React from "react";

interface AiAnalysisProps {
  analysis: string;
}

const AiAnalysis: React.FC<AiAnalysisProps> = ({ analysis }) => {
  // Simple markdown to HTML conversion
  const formatText = (text: string) => {
    return text.split("\n").map((line, index) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <h4
            key={index}
            className="font-bold text-slate-100 text-md mt-4 mb-2"
          >
            {line.replace(/\*\*/g, "")}
          </h4>
        );
      }
      if (line.startsWith("* ")) {
        return (
          <li key={index} className="ml-5 list-disc text-slate-300">
            {line.substring(2)}
          </li>
        );
      }
      return (
        <p key={index} className="mb-2 text-slate-300">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
      <h3 className="text-xl font-bold text-slate-100 mb-4">
        Análisis Financiero por IA
      </h3>
      <div>
        {analysis ? (
          formatText(analysis)
        ) : (
          <p className="text-slate-400">Generando análisis...</p>
        )}
      </div>
    </div>
  );
};

export default AiAnalysis;
