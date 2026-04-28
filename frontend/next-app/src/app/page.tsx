"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import {
  Project,
  getProjects,
  createProject,
  deleteProject,
  streamProjects,
} from "@/lib/api";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  // Charger les projets une fois + s'abonner au stream
  useEffect(() => {
    let cancelled = false;

    getProjects()
      .then((data) => {
        if (!cancelled) {
          setProjects(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erreur inconnue");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const unsubscribe = streamProjects((data) => {
      setProjects(data);
      setError(null);
    });

    return () => {
      cancelled = true;
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  // Créer un projet
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Le nom du projet est requis");
      return;
    }

    try {
      setCreating(true);
      const newProject = await createProject(formData.name, formData.description);
      setProjects([newProject, ...projects]);
      setFormData({ name: "", description: "" });
      setShowForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  };

  // Supprimer un projet
  const handleDeleteProject = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) return;

    try {
      await deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-700/50 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-white mb-2">Bienvenue</h2>
        <p className="text-gray-300 mb-6">
          Créez et gérez vos projets logiciels avec des agents IA autonomes.
          Définissez un objectif et laissez l'agent générer le code, la structure
          et la documentation automatiquement.
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          {showForm ? "Annuler" : "+ Nouveau projet"}
        </button>
      </div>

      {/* Create project form */}
      {showForm && (
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6 animate-slide-in">
          <h3 className="text-lg font-semibold text-white mb-4">Créer un nouveau projet</h3>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom du projet
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Mon API REST"
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ex: Une API REST pour gérer les utilisateurs..."
                rows={3}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {creating ? "Création..." : "Créer le projet"}
            </button>
          </form>
        </div>
      )}

      {/* Projects grid */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">
          Mes projets ({projects.length})
        </h3>

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <p>Chargement des projets...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-300">
            <p>Erreur : {error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">Aucun projet pour le moment</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Créer le premier projet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
