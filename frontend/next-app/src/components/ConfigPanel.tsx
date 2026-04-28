"use client";

import { useState } from "react";

export default function ConfigPanel({ projectId }: { projectId: number }) {
  const [vars, setVars] = useState<{ key: string; value: string }[]>([
    { key: "VITE_SUPABASE_URL", value: "" },
    { key: "VITE_SUPABASE_ANON_KEY", value: "" },
    { key: "VITE_STRIPE_PUBLISHABLE_KEY", value: "" },
  ]);

  const handleAdd = () => setVars([...vars, { key: "", value: "" }]);
  const handleUpdate = (index: number, field: "key" | "value", val: string) => {
    const newVars = [...vars];
    newVars[index][field] = val;
    setVars(newVars);
  };

  const handleSave = () => {
    alert("Variables d'environnement enregistrées localement dans le projet.");
    // Ici on pourrait appeler une API pour écrire le .env
  };

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Variables d'environnement</h3>
        <button
          onClick={handleAdd}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          + Ajouter
        </button>
      </div>
      
      <div className="space-y-3">
        {vars.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={v.key}
              onChange={(e) => handleUpdate(i, "key", e.target.value)}
              placeholder="CLE"
              className="flex-1 px-3 py-1.5 bg-dark-700 border border-dark-600 rounded text-xs text-white"
            />
            <input
              type="password"
              value={v.value}
              onChange={(e) => handleUpdate(i, "value", e.target.value)}
              placeholder="Valeur"
              className="flex-1 px-3 py-1.5 bg-dark-700 border border-dark-600 rounded text-xs text-white"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="mt-4 w-full px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm font-semibold rounded transition-colors"
      >
        Enregistrer les variables
      </button>
    </div>
  );
}
