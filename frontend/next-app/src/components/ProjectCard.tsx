"use client";

import Link from "next/link";
import { Project } from "@/lib/api";

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: number) => void;
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const statusColors: Record<string, string> = {
    idle: "status-idle",
    running: "status-running",
    paused: "status-paused",
    done: "status-done",
    error: "status-error",
  };

  const statusLabels: Record<string, string> = {
    idle: "Inactif",
    running: "En cours",
    paused: "En pause",
    done: "Terminé",
    error: "Erreur",
  };

  const progressColor =
    project.status === "error"
      ? "from-red-500 to-red-600"
      : project.status === "done"
      ? "from-green-500 to-green-600"
      : "from-blue-500 to-blue-600";

  const handleDelete = () => {
    if (
      onDelete &&
      confirm(`Supprimer le projet "${project.name}" ? Cette action est irréversible.`)
    ) {
      onDelete(project.id);
    }
  };

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg p-5 hover:border-blue-500 transition-colors flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <Link href={`/projects/${project.id}`}>
          <h3 className="text-base font-semibold text-white hover:text-blue-400 cursor-pointer leading-tight">
            {project.name}
          </h3>
        </Link>
        <span className={`status-badge ${statusColors[project.status]} ml-2 shrink-0`}>
          {statusLabels[project.status]}
        </span>
      </div>

      {project.description && (
        <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
      )}

      {/* Barre de progression */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-gray-500">Progression</span>
          <span className="text-xs font-semibold text-blue-400">
            {Math.round(project.progress)}%
          </span>
        </div>
        <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
          <div
            className={`bg-gradient-to-r ${progressColor} h-full transition-all duration-500`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
        <span>Créé le {new Date(project.created_at).toLocaleDateString("fr-FR")}</span>
        <Link
          href={`/projects/${project.id}`}
          className="text-blue-400 hover:text-blue-300 font-medium"
        >
          Voir →
        </Link>
      </div>

      {/* Bouton Supprimer — visible sur tous les statuts SAUF "running" */}
      {onDelete && project.status !== "running" && (
        <button
          onClick={handleDelete}
          className="w-full px-3 py-1.5 text-xs font-medium text-red-400 border border-red-900/40 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          🗑 Supprimer
        </button>
      )}
    </div>
  );
}
