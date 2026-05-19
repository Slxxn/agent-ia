const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "/api";

// Les EventSource SSE se connectent directement au backend pour éviter le
// buffering du proxy Next.js. Le hostname est détecté dynamiquement pour
// fonctionner aussi bien en local que depuis un autre appareil sur le réseau.
const getSSEBase = (): string => {
  if (typeof window === "undefined") return "http://localhost:8000/api";
  const override = process.env.NEXT_PUBLIC_API_URL;
  if (override) return `${override}/api`;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return `http://${host}:8000/api`;
  }
  // Production: SSE goes to api subdomain over HTTPS
  return `https://api.${host}/api`;
};

export interface Project {
  id: number;
  name: string;
  description: string;
  objective: string;
  status: "idle" | "running" | "paused" | "error" | "done";
  progress: number;
  created_at: string;
  updated_at: string;
  workspace_path: string;
  deploy_url?: string;
  slug?: string;
  is_client?: number;
  client_name?: string;
  client_email?: string;
  notes?: string;
}

export interface Task {
  id: number;
  project_id: number;
  description: string;
  status: string;
  step_index: number;
  steps: string[];
  result: string;
  retries: number;
  created_at: string;
  updated_at: string;
}

export interface Log {
  id: number;
  project_id: number;
  timestamp: string;
  level: "info" | "error" | "debug" | "warning";
  message: string;
}

export interface FileEntry {
  name: string;
  type: "file" | "directory";
  size: number;
}

// ─── Projets ─────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error("Erreur lors de la récupération des projets");
  return res.json();
}

export async function getProject(id: number): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  if (!res.ok) throw new Error("Projet non trouvé");
  return res.json();
}

export async function createProject(
  name: string,
  description: string
): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error("Erreur lors de la création du projet");
  return res.json();
}

export async function deleteProject(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erreur lors de la suppression du projet");
}

export async function prepareWorkspace(id: number): Promise<{ success: boolean; slug: string; workspace: string }> {
  const res = await fetch(`${API_BASE}/projects/${id}/prepare-workspace`, { method: "POST" });
  if (!res.ok) throw new Error("Erreur lors de la préparation du workspace");
  return res.json();
}

// ─── Contrôle de projet ──────────────────────────────────────────────────

export async function startProject(id: number, objective: string): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${id}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ objective }),
  });
  if (!res.ok) throw new Error("Erreur lors du démarrage du projet");
}

export async function stopProject(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${id}/stop`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Erreur lors de l'arrêt du projet");
}

export async function pauseProject(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${id}/pause`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Erreur lors de la mise en pause du projet");
}

export async function resumeProject(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${id}/resume`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Erreur lors de la reprise du projet");
}

export async function validateVisual(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${id}/validate-visual`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Erreur lors du lancement de la validation visuelle");
}

export async function deployProject(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${id}/deploy`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Erreur lors du déploiement");
}

// ─── Tâches ──────────────────────────────────────────────────────────────

export async function getProjectTasks(projectId: number): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`);
  if (!res.ok) throw new Error("Erreur lors de la récupération des tâches");
  return res.json();
}

// ─── Logs ────────────────────────────────────────────────────────────────

export async function getLogs(projectId: number): Promise<Log[]> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/logs`);
  if (!res.ok) throw new Error("Erreur lors de la récupération des logs");
  const data = await res.json();
  return data.logs || [];
}

export function streamLogs(
  projectId: number,
  onLog: (log: Log) => void,
  onEnd: (status: string) => void,
  sinceId: number = 0
): () => void {
  let stopped = false;
  let lastId = sinceId;
  let eventSource: EventSource | null = null;

  const connect = () => {
    if (stopped) return;
    eventSource = new EventSource(
      `${getSSEBase()}/projects/${projectId}/logs/stream?since_id=${lastId}`
    );

    eventSource.onmessage = (event) => {
      try {
        const log = JSON.parse(event.data) as Log;
        onLog(log);
        if (log.id && log.id > lastId) lastId = log.id;
      } catch {}
    };

    // Gardé pour compatibilité si le backend envoie un jour "end"
    eventSource.addEventListener("end", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        onEnd(data.status || "done");
      } catch {
        onEnd("done");
      }
      stopped = true;
      eventSource?.close();
    });

    // Reconnexion automatique avec le dernier ID connu pour éviter les doublons
    eventSource.onerror = () => {
      eventSource?.close();
      if (!stopped) setTimeout(connect, 2000);
    };
  };

  connect();
  return () => { stopped = true; eventSource?.close(); };
}

// ─── SSE pour la liste des projets ───────────────────────────────────────

export function streamProjects(
  onUpdate: (projects: Project[]) => void
): () => void {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout>;

  const poll = () => {
    if (stopped) return;
    getProjects()
      .then(projects => { if (!stopped) onUpdate(projects); })
      .catch(() => {})
      .finally(() => { if (!stopped) timer = setTimeout(poll, 3000); });
  };

  poll();
  return () => { stopped = true; clearTimeout(timer); };
}

// ─── SSE pour un projet précis ───────────────────────────────────────────

export function streamProject(
  projectId: number,
  onUpdate: (project: Project) => void
): () => void {
  let eventSource: EventSource | null = null;
  let stopped = false;

  const connect = () => {
    if (stopped) return;
    eventSource = new EventSource(`${getSSEBase()}/projects/${projectId}/stream`);
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as Project;
        onUpdate(data);
      } catch (e) {
        console.error("Erreur parsing project:", e);
      }
    };
    eventSource.onerror = () => {
      eventSource?.close();
      if (!stopped) setTimeout(connect, 2000);
    };
  };

  connect();
  return () => { stopped = true; eventSource?.close(); };
}

// ─── Fichiers ────────────────────────────────────────────────────────────

export async function getProjectFiles(projectId: number): Promise<{
  files: FileEntry[];
  tree: string;
}> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/files`);
  if (!res.ok) throw new Error("Erreur lors de la récupération des fichiers");
  return res.json();
}

export async function readProjectFile(
  projectId: number,
  filePath: string
): Promise<string> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/files/${filePath}`);
  if (!res.ok) throw new Error("Fichier non trouvé");
  const data = await res.json();
  return data.content || "";
}

// ─── Chatbot Copilot ──────────────────────────────────────────────────────────

export async function sendChatMessage(
  projectId: number,
  message: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("Erreur lors de l'envoi du message au chatbot");
  return res.json();
}

// ─── Variables d'environnement ────────────────────────────────────────────────

export async function getProjectEnv(
  projectId: number
): Promise<Record<string, string>> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/env`);
  if (!res.ok) throw new Error("Erreur lors de la récupération des variables");
  return res.json();
}

export async function updateProjectEnv(
  projectId: number,
  env: Record<string, string>
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/env`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(env),
  });
  if (!res.ok) throw new Error("Erreur lors de la mise à jour des variables");
  return res.json();
}
export async function deleteEnvVar(
  projectId: number,
  key: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/env/${encodeURIComponent(key)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Erreur lors de la suppression de la variable '${key}'`);
  return res.json();
}

// ─── Réglages globaux ─────────────────────────────────────────────────────────

export interface Setting {
  key: string;
  label: string;
  value: string;
  encrypted: boolean;
  placeholder: string;
  set: boolean;
}

export async function getSettings(): Promise<Setting[]> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error("Erreur lors de la récupération des réglages");
  return res.json();
}

export async function saveSetting(key: string, value: string): Promise<void> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) throw new Error(`Erreur lors de la sauvegarde de '${key}'`);
}

export async function deleteSetting(key: string): Promise<void> {
  const res = await fetch(`${API_BASE}/settings/${encodeURIComponent(key)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Erreur lors de la suppression de '${key}'`);
}

