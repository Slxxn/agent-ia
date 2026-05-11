"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Save, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2,
  Settings, Cpu, Zap, CreditCard, Flame, X, Bot,
} from "lucide-react";
import { Setting, getSettings, saveSetting } from "@/lib/api";

// ─── Setting row ─────────────────────────────────────────────────────────────

function SettingRow({ setting, onSaved }: { setting: Setting; onSaved: (key: string) => void }) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const isSecret = setting.encrypted;

  const handleSave = async () => {
    if (!value.trim()) return;
    setSaving(true); setErr(""); setSaved(false);
    try {
      await saveSetting(setting.key, value.trim());
      setSaved(true);
      onSaved(setting.key);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "contents" }}>
      {/* Label col */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
            {setting.label}
          </span>
          {isSecret && (
            <span style={{
              fontSize: 9, fontWeight: 600, color: "var(--muted)",
              background: "var(--surface3)", border: "1px solid var(--bd-bright)",
              borderRadius: 4, padding: "1px 5px", letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}>
              chiffré
            </span>
          )}
        </div>
        <span style={{ fontSize: 11, color: "var(--muted2)", fontFamily: "monospace" }}>
          {setting.key}
        </span>
      </div>

      {/* Status col */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {setting.set ? (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--success)", fontWeight: 500 }}>
            <CheckCircle2 size={12} /> OK
          </span>
        ) : (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>
            <AlertCircle size={12} /> —
          </span>
        )}
      </div>

      {/* Input col */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type={isSecret && !show ? "password" : "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            placeholder={setting.set ? "••••••" : setting.placeholder}
            style={{
              width: "100%", height: 34, padding: isSecret ? "0 34px 0 10px" : "0 10px",
              borderRadius: 7, border: "1px solid var(--bd-bright)",
              background: "var(--surface2)", color: "var(--text)",
              fontSize: 12, outline: "none", fontFamily: "inherit",
              transition: "border-color 0.15s", boxSizing: "border-box",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--bd-bright)"; }}
          />
          {isSecret && (
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: "var(--muted)", cursor: "pointer",
                display: "flex", alignItems: "center", padding: 0,
              }}
            >
              {show ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          )}
        </div>

        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            style={{
              width: 34, height: 34, borderRadius: 7, border: "1px solid var(--bd-bright)",
              background: "var(--surface3)", color: "var(--muted)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <X size={12} />
          </button>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !value.trim()}
          style={{
            height: 34, padding: "0 12px", borderRadius: 7, border: "none",
            background: saved ? "var(--success)" : (!value.trim() ? "var(--surface3)" : "var(--primary)"),
            color: !value.trim() ? "var(--muted)" : "white",
            fontSize: 12, fontWeight: 500, cursor: saving || !value.trim() ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 5, transition: "background 0.2s",
            fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
          }}
        >
          {saving ? (
            <Loader2 size={11} className="animate-spin" />
          ) : saved ? (
            <><CheckCircle2 size={11} /> Enregistré</>
          ) : (
            <><Save size={11} /> Sauvegarder</>
          )}
        </button>
      </div>

      {/* Error — spans full width */}
      {err && (
        <div style={{ gridColumn: "1 / -1", fontSize: 11, color: "var(--error)", marginTop: -4 }}>
          {err}
        </div>
      )}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  icon, title, description, color, keys, settings, onSaved,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  color: string;
  keys: string[];
  settings: Setting[];
  onSaved: (key: string) => void;
}) {
  const rows = settings.filter((s) => keys.includes(s.key));
  if (!rows.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "var(--surface)", border: "1px solid var(--bd)",
        borderRadius: 12, overflow: "hidden",
      }}
    >
      {/* Card header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "14px 18px", borderBottom: "1px solid var(--bd)",
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: `${color}15`, border: `1px solid ${color}30`,
          display: "flex", alignItems: "center", justifyContent: "center", color,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{title}</div>
          {description && (
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{description}</div>
          )}
        </div>
      </div>

      {/* Grid rows */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(160px, 220px) 56px 1fr",
        gap: "0 12px",
        padding: "4px 18px",
      }}>
        {rows.map((s, i) => (
          <div key={s.key} style={{
            display: "contents",
          }}>
            {/* Separator line before each row except first */}
            {i > 0 && (
              <div style={{
                gridColumn: "1 / -1",
                height: 1, background: "var(--bd)", margin: "2px 0",
              }} />
            )}
            <div style={{ display: "contents", padding: "10px 0" }}>
              <div style={{ padding: "10px 0", minWidth: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                      {s.label}
                    </span>
                    {s.encrypted && (
                      <span style={{
                        fontSize: 9, fontWeight: 600, color: "var(--muted)",
                        background: "var(--surface3)", border: "1px solid var(--bd-bright)",
                        borderRadius: 4, padding: "1px 5px", letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}>
                        chiffré
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: "var(--muted2)", fontFamily: "monospace" }}>
                    {s.key}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 0" }}>
                {s.set ? (
                  <CheckCircle2 size={13} style={{ color: "var(--success)" }} />
                ) : (
                  <AlertCircle size={13} style={{ color: "var(--muted)" }} />
                )}
              </div>
              <div style={{ padding: "8px 0" }}>
                <SettingInputRow setting={s} onSaved={onSaved} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SettingInputRow({ setting, onSaved }: { setting: Setting; onSaved: (key: string) => void }) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const isSecret = setting.encrypted;

  const handleSave = async () => {
    if (!value.trim()) return;
    setSaving(true); setErr(""); setSaved(false);
    try {
      await saveSetting(setting.key, value.trim());
      setSaved(true);
      onSaved(setting.key);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type={isSecret && !show ? "password" : "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            placeholder={setting.set ? "••••••" : setting.placeholder}
            style={{
              width: "100%", height: 34, padding: isSecret ? "0 34px 0 10px" : "0 10px",
              borderRadius: 7, border: "1px solid var(--bd-bright)",
              background: "var(--surface2)", color: "var(--text)",
              fontSize: 12, outline: "none", fontFamily: "inherit",
              transition: "border-color 0.15s", boxSizing: "border-box",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--bd-bright)"; }}
          />
          {isSecret && (
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: "var(--muted)", cursor: "pointer",
                display: "flex", alignItems: "center", padding: 0,
              }}
            >
              {show ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          )}
        </div>

        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            style={{
              width: 34, height: 34, borderRadius: 7, border: "1px solid var(--bd-bright)",
              background: "var(--surface3)", color: "var(--muted)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <X size={12} />
          </button>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !value.trim()}
          style={{
            height: 34, padding: "0 12px", borderRadius: 7, border: "none",
            background: saved ? "var(--success)" : (!value.trim() ? "var(--surface3)" : "var(--primary)"),
            color: !value.trim() ? "var(--muted)" : "white",
            fontSize: 12, fontWeight: 500, cursor: saving || !value.trim() ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 5, transition: "background 0.2s",
            fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
          }}
        >
          {saving ? (
            <Loader2 size={11} className="animate-spin" />
          ) : saved ? (
            <><CheckCircle2 size={11} /> Enregistré</>
          ) : (
            <><Save size={11} /> Sauvegarder</>
          )}
        </button>
      </div>
      {err && <span style={{ fontSize: 11, color: "var(--error)" }}>{err}</span>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    key: "llm",
    title: "LLM principal",
    description: "Génération de code (tâches longues)",
    icon: <Cpu size={14} />,
    color: "#7C3AED",
    keys: ["DEEPSEEK_API_KEY", "DEEPSEEK_BASE_URL"],
  },
  {
    key: "claude",
    title: "Claude (Anthropic)",
    description: "Génération qualité maximale (mode quality)",
    icon: <Bot size={14} />,
    color: "#D97706",
    keys: ["ANTHROPIC_API_KEY"],
  },
  {
    key: "gemini",
    title: "Gemini Flash",
    description: "Planification, correction, validation (gratuit)",
    icon: <Zap size={14} />,
    color: "#0EA5E9",
    keys: ["GEMINI_API_KEY", "LLM_BUDGET_MODE"],
  },
  {
    key: "ollama",
    title: "Ollama (local)",
    description: "Modèle local optionnel",
    icon: <Settings size={14} />,
    color: "#6B7280",
    keys: ["OLLAMA_BASE_URL", "OLLAMA_MODEL"],
  },
  {
    key: "integrations",
    title: "Intégrations",
    description: "Stripe paiements",
    icon: <CreditCard size={14} />,
    color: "#059669",
    keys: ["STRIPE_SECRET_KEY", "STRIPE_PUBLIC_KEY"],
  },
  {
    key: "deploy",
    title: "Déploiement Firebase",
    description: "Auto-deploy après génération",
    icon: <Flame size={14} />,
    color: "#F59E0B",
    keys: ["FIREBASE_TOKEN", "FIREBASE_PROJECT_ID"],
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (key: string) => {
    setSettings((prev) => prev.map((s) => s.key === key ? { ...s, set: true } : s));
  };

  const configured = settings.filter((s) => s.set).length;
  const total = settings.length;

  return (
    <div style={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "var(--primary-muted)", border: "1px solid var(--primary-border)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)",
          }}>
            <Settings size={16} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
              Réglages
            </h1>
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>
              Clés API et configuration globale
            </p>
          </div>
        </div>

        {!loading && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 8,
            background: configured === total ? "rgba(16,185,129,0.1)" : "var(--surface3)",
            border: `1px solid ${configured === total ? "rgba(16,185,129,0.25)" : "var(--bd-bright)"}`,
            fontSize: 12, fontWeight: 500,
            color: configured === total ? "var(--success)" : "var(--muted)",
          }}>
            {configured === total ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            {configured}/{total} configurés
          </div>
        )}
      </motion.div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", fontSize: 13, padding: "20px 0" }}>
          <Loader2 size={14} className="animate-spin" /> Chargement…
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Firebase token hint */}
          <div style={{
            padding: "10px 14px", borderRadius: 8,
            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
            fontSize: 11, color: "var(--muted)", lineHeight: 1.6,
          }}>
            <span style={{ color: "#F59E0B", fontWeight: 600 }}>Firebase token</span> — obtenez-le avec{" "}
            <code style={{ fontFamily: "monospace", background: "var(--surface3)", padding: "1px 5px", borderRadius: 4, fontSize: 10 }}>
              npx firebase-tools login:ci
            </code>
            {" "}·{" "}
            <span style={{ color: "#0EA5E9", fontWeight: 600 }}>Gemini</span> — clé gratuite sur{" "}
            <code style={{ fontFamily: "monospace", background: "var(--surface3)", padding: "1px 5px", borderRadius: 4, fontSize: 10 }}>
              aistudio.google.com
            </code>
          </div>

          {SECTIONS.map((sec) => (
            <SectionCard
              key={sec.key}
              icon={sec.icon}
              title={sec.title}
              description={sec.description}
              color={sec.color}
              keys={sec.keys}
              settings={settings}
              onSaved={handleSaved}
            />
          ))}
        </div>
      )}
    </div>
  );
}
