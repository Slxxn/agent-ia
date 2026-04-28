"use client";

import { useEffect, useRef, useState } from "react";
import { getProjectFiles, FileEntry } from "@/lib/api";

interface FileExplorerProps {
  projectId: number;
}

export default function FileExplorer({ projectId }: FileExplorerProps) {
  const [tree, setTree] = useState<string>("");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pour ne déclencher un re-render QUE si le contenu a vraiment changé
  const lastTreeRef = useRef<string>("");

  useEffect(() => {
    let cancelled = false;

    const fetchFiles = async () => {
      try {
        const data = await getProjectFiles(projectId);
        if (cancelled) return;
        // Update silencieux : on ne touche au state que si quelque chose a changé
        if (data.tree !== lastTreeRef.current) {
          lastTreeRef.current = data.tree;
          setFiles(data.files);
          setTree(data.tree);
        }
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };

    fetchFiles();
    // Refresh discret toutes les 5s, sans état "loading" qui clignote
    const interval = setInterval(fetchFiles, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [projectId]);

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg overflow-hidden flex flex-col h-96">
      {/* Header */}
      <div className="bg-dark-700 px-4 py-3 border-b border-dark-600 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">📁 Fichiers du workspace</h3>
        <span className="text-xs text-gray-400">{files.length} entrée(s)</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {initialLoading ? (
          <div className="text-gray-500 text-center py-8">
            <p>Chargement...</p>
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">
            <p>Erreur : {error}</p>
          </div>
        ) : tree ? (
          <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-words">
            {tree}
          </pre>
        ) : (
          <div className="text-gray-500 text-center py-8">
            <p>Aucun fichier pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
}
