import React from "react";

export function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();

  let estilo = "bg-gray-100 text-gray-800 border-gray-300";
  if (s === "aberto") {
    estilo = "bg-amber-100 text-amber-800 border-amber-300";
  } else if (s === "em andamento") {
    estilo = "bg-blue-100 text-blue-800 border-blue-300";
  } else if (s === "resolvido") {
    estilo = "bg-emerald-100 text-emerald-800 border-emerald-300";
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${estilo}`}>
      {status}
    </span>
  );
}
