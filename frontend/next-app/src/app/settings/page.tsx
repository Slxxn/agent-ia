"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Save, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2,
  Settings, Cpu, Zap, CreditCard, Flame, X, Bot, Mail, Search, ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Setting, getSettings, saveSetting } from "@/lib/api";

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
    } finally { setSaving(false); }
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
              width: "100%", height: 32, padding: isSecret ? "0 32px 0 10px" : "0 10px",
              borderRadius: 7, border: "1px solid var(--bd-bright)",
              background: "var(--surface2)", color: "var(--text)",
              fontSize: 12, outline: "none", fontFamily: "inherit",
              transition: "border-color 0.15s", boxSizing: "border-box",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--bd-bright)"; }}
          />
          {isSecret && (
            <button type="button" onClick={() => setShow((v) => !v)}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
              {show ? <EyeOff size={11} /> : <Eye size={11} />}
            </button>
          )}
        </div>
        {value && (
          <button type="button" onClick={() => setValue("")}
            style={{ width: 32, height: 32, borderRadius: 7, border: "1px solid var(--bd-bright)", background: "var(--surface3)", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <X size={11} />
          </button>
        )}
        <button type="button" onClick={handleSave} disabled={saving || !value.trim()}
          style={{
            height: 32, padding: "0 11px", borderRadius: 7, border: "none",
            background: saved ? "var(--success)" : (!value.trim() ? "var(--surface3)" : "var(--primary)"),
            color: !value.trim() ? "var(--muted)" : "white",
            fontSize: 12, fontWeight: 500, cursor: saving || !value.trim() ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 5, transition: "background 0.2s",
            fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
          }}>
          {saving ? <Loader2 size={11} className="animate-spin" />
            : saved ? <><CheckCircle2 size={11} /> Enregistré</>
            : <><Save size={11} /> Sauvegarder</>}
        </button>
      </div>
      {err && <span style={{ fontSize: 11, color: "var(--error)" }}>{err}</span>}
    </div>
  );
}

function SectionCard({ icon, title, description, color, keys, settings, onSaved }: {
  icon: React.ReactNode; title: string; description?: string;
  color: string; keys: string[]; settings: Setting[]; onSaved: (key: string) => void;
}) {
  const rows = settings.filter((s) => keys.includes(s.key));
  if (!rows.length) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: "var(--surface)", border: "1px solid var(--bd)", borderRadius: 12, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 16px", borderBottom: "1px solid var(--bd)" }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: `${color}15`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{title}</div>
          {description && <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>{description}</div>}
        </div>
        {/* Config count badge */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
          {rows.map((s) => (
            <span key={s.key} title={s.key}
              style={{ width: 7, height: 7, borderRadius: "50%", background: s.set ? "var(--success)" : "var(--bd-bright)", display: "inline-block" }} />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div style={{ padding: "4px 16px" }}>
        {rows.map((s, i) => (
          <div key={s.key}>
            {i > 0 && <div style={{ height: 1, background: "var(--bd)", margin: "2px 0" }} />}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "6px 10px", alignItems: "center", padding: "8px 0" }}>
              {/* Label + key */}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {s.label}
                  </span>
                  {s.encrypted && (
                    <span style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", background: "var(--surface3)", border: "1px solid var(--bd-bright)", borderRadius: 3, padding: "1px 4px", letterSpacing: "0.04em", textTransform: "uppercase", flexShrink: 0 }}>
                      chiffré
                    </span>
                  )}
                  {s.set ? (
                    <CheckCircle2 size={11} style={{ color: "var(--success)", flexShrink: 0 }} />
                  ) : (
                    <AlertCircle size={11} style={{ color: "var(--muted)", flexShrink: 0 }} />
                  )}
                </div>
                <span style={{ fontSize: 10, color: "var(--muted2)", fontFamily: "monospace" }}>{s.key}</span>
              </div>
              {/* Input */}
              <div style={{ minWidth: 260 }}>
                <SettingInputRow setting={s} onSaved={onSaved} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

const SECTIONS = [
  {
    key: "llm",      title: "LLM principal",       description: "Génération de code (tâches longues)",
    icon: <Cpu size={13} />,         color: "#7C3AED",
    keys: ["DEEPSEEK_API_KEY", "DEEPSEEK_BASE_URL"],
  },
  {
    key: "claude",   title: "Claude (Anthropic)",   description: "Mode quality — génération maximale",
    icon: <Bot size={13} />,         color: "#D97706",
    keys: ["ANTHROPIC_API_KEY"],
  },
  {
    key: "gemini",   title: "Gemini Flash",         description: "Planification, correction, validation (gratuit)",
    icon: <Zap size={13} />,         color: "#0EA5E9",
    keys: ["GEMINI_API_KEY", "LLM_BUDGET_MODE"],
  },
  {
    key: "stripe",   title: "Stripe",               description: "Paiements clients",
    icon: <CreditCard size={13} />,  color: "#059669",
    keys: ["STRIPE_SECRET_KEY", "STRIPE_PUBLIC_KEY"],
  },
  {
    key: "firebase", title: "Firebase",             description: "Auto-deploy après génération",
    icon: <Flame size={13} />,       color: "#F59E0B",
    keys: ["FIREBASE_API_KEY", "FIREBASE_TOKEN", "FIREBASE_PROJECT_ID"],
  },
  {
    key: "notifs",   title: "Emails & Notifications", description: "Confirmations client, alertes Guardian",
    icon: <Mail size={13} />,        color: "#10B981",
    keys: ["RESEND_API_KEY", "ADMIN_EMAIL"],
  },
  {
    key: "prospect", title: "Prospect Hunter",         description: "Google Custom Search — enrichissement sites web",
    icon: <Search size={13} />,      color: "#EF4444",
    keys: ["GOOGLE_SEARCH_API_KEY", "GOOGLE_SEARCH_CX", "PROSPECT_AUTO_CITY"],
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then(setSettings).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSaved = (key: string) => {
    setSettings((prev) => prev.map((s) => s.key === key ? { ...s, set: true } : s));
  };

  const configured = settings.filter((s) => s.set).length;
  const total      = settings.length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

      {/* ── Topbar ── */}
      <div style={{ height: 52, borderBottom: "1px solid var(--bd)", display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0, background: "var(--surface)" }}>
        <button
          onClick={() => router.back()}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 13, padding: "5px 8px", borderRadius: 7, transition: "all 0.15s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface2)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}
        >
          <ArrowLeft size={14} /> Retour
        </button>
      </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 1380, margin: "0 auto", width: "100%", padding: "24px 24px 48px" }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary-muted)", border: "1px solid var(--primary-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
            <Settings size={14} />
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>Réglages</h1>
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>Clés API et configuration globale</p>
          </div>
        </div>
        {!loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 11px", borderRadius: 8, background: configured === total ? "rgba(16,185,129,0.1)" : "var(--surface3)", border: `1px solid ${configured === total ? "rgba(16,185,129,0.25)" : "var(--bd-bright)"}`, fontSize: 12, fontWeight: 500, color: configured === total ? "var(--success)" : "var(--muted)" }}>
            {configured === total ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
            {configured}/{total} configurés
          </div>
        )}
      </motion.div>

      {/* ── Hint bar ── */}
      <div style={{ padding: "8px 13px", borderRadius: 8, background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)", fontSize: 11, color: "var(--muted)", lineHeight: 1.6, flexShrink: 0 }}>
        <span style={{ color: "#F59E0B", fontWeight: 600 }}>Firebase token</span>{" — "}
        <code style={{ fontFamily: "monospace", background: "var(--surface3)", padding: "1px 5px", borderRadius: 4, fontSize: 10 }}>npx firebase-tools login:ci</code>
        {"  ·  "}
        <span style={{ color: "#0EA5E9", fontWeight: 600 }}>Gemini</span>{" — clé gratuite sur "}
        <code style={{ fontFamily: "monospace", background: "var(--surface3)", padding: "1px 5px", borderRadius: 4, fontSize: 10 }}>aistudio.google.com</code>
        {"  ·  "}
        <span style={{ color: "#10B981", fontWeight: 600 }}>Resend</span>{" — clé gratuite sur "}
        <code style={{ fontFamily: "monospace", background: "var(--surface3)", padding: "1px 5px", borderRadius: 4, fontSize: 10 }}>resend.com</code>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", fontSize: 13 }}>
          <Loader2 size={14} className="animate-spin" /> Chargement…
        </div>
      ) : (
        /* ── 2-column grid ── */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {SECTIONS.map((sec) => (
            <SectionCard key={sec.key} icon={sec.icon} title={sec.title} description={sec.description}
              color={sec.color} keys={sec.keys} settings={settings} onSaved={handleSaved} />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
