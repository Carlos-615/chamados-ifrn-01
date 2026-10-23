import React from "react";

export function PriorityBadge({ prioridade }) {
  const p = (prioridade || "").toLowerCase();

  let estilo = "bg-gray-100 text-gray-700 border-gray-300";
  if (p === "alta") {
    estilo = "bg-red-100 text-red-800 border-red-300";
  } else if (p === "média" || p === "media") {
    estilo = "bg-orange-100 text-orange-800 border-orange-300";
  } else if (p === "baixa") {
    estilo = "bg-teal-100 text-teal-800 border-teal-300";
  }

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${estilo}`}>
      Prioridade: {prioridade}
    </span>
  );
}
