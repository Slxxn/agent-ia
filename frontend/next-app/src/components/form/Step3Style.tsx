'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { FormSubmitData } from '@/lib/form-submit';
import { NavButton, inputStyle } from './Step1Projet';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:8000/api';

const VISUAL_STYLES: Record<string, { id: string; label: string; desc: string }[]> = {
  standard: [
    { id: 'luxe_elegant',   label: 'Luxe & Élégant',      desc: 'Typographie raffinée, espace maîtrisé' },
    { id: 'minimal_clean',  label: 'Minimaliste',          desc: 'Épuré, focus sur le contenu' },
    { id: 'modern_bold',    label: 'Moderne & Audacieux',  desc: 'Contrastes forts, animations dynamiques' },
    { id: 'warm_natural',   label: 'Naturel & Chaleureux', desc: 'Tons terre, textures organiques' },
    { id: 'colorful_vivid', label: 'Coloré & Vibrant',     desc: 'Palette vive, énergique, pop' },
    { id: 'corporate_pro',  label: 'Professionnel',        desc: 'Sobre, structuré, inspire confiance' },
  ],
  '3d': [
    { id: 'immersive_dark',  label: 'Immersif & Sombre',  desc: 'Scènes 3D, volumétrie, lumières' },
    { id: 'spatial_minimal', label: 'Spatial Minimal',    desc: 'Géométries flottantes, espace infini' },
    { id: 'holographic',     label: 'Holographique',      desc: 'Néon, glassmorphisme cyber' },
    { id: 'organic_3d',      label: 'Organique 3D',       desc: 'Formes fluides, blobs animés' },
    { id: 'cinematic',       label: 'Cinématique',        desc: 'Séquences filmic, storytelling' },
    { id: 'futuristic_ui',   label: 'Futuriste / HUD',    desc: 'Interface sci-fi, particules' },
  ],
  scrollytelling: [
    { id: 'narrative_film',  label: 'Narratif / Film',     desc: 'Séquences cinématiques, texte dramatique' },
    { id: 'editorial_bold',  label: 'Éditorial Audacieux', desc: 'Typographie XXL, style magazine' },
    { id: 'poetic_minimal',  label: 'Poétique & Minimal',  desc: 'Textes percutants, révélations douces' },
    { id: 'immersive_3d',    label: 'Immersif 3D',          desc: 'Parallaxe, effets WebGL' },
    { id: 'brand_story',     label: 'Brand Story',          desc: 'Histoire de la marque, origines' },
    { id: 'product_reveal',  label: 'Révélation Produit',   desc: 'Apple-style, section par section' },
  ],
};

const COLOR_THEMES: Record<string, { key: string; label: string; preview: string; desc: string }[]> = {
  standard: [
    { key: 'light',   label: 'Clair',   preview: '#f8f8f7', desc: 'Fond blanc / beige' },
    { key: 'dark',    label: 'Sombre',  preview: '#0f0f12', desc: 'Fond noir / anthracite' },
    { key: 'neutral', label: 'Neutre',  preview: '#f4f4f5', desc: 'Fond gris doux' },
  ],
  '3d': [
    { key: 'deep_space', label: 'Cosmos',      preview: '#05050f', desc: 'Quasi-noir stellaire' },
    { key: 'neon_dark',  label: 'Néon Sombre', preview: '#0a0a0a', desc: 'Noir, accents néon' },
    { key: 'midnight',   label: 'Minuit',       preview: '#060818', desc: 'Bleu nuit profond' },
    { key: 'vantablack', label: 'Pure Black',   preview: '#000000', desc: 'Contraste maximal' },
  ],
  scrollytelling: [
    { key: 'deep_black', label: 'Cinéma',       preview: '#080808', desc: 'Révélations dramatiques' },
    { key: 'midnight',   label: 'Nuit Profonde', preview: '#060818', desc: 'Bleu nuit, poétique' },
    { key: 'ink',        label: 'Encre',         preview: '#0c0a08', desc: 'Noir chaud, éditorial' },
    { key: 'neon_dark',  label: 'Néon',          preview: '#0a0a0a', desc: 'Accents lumineux' },
  ],
};

interface AISuggestions {
  palettes?: { name: string; description: string; primary: string; secondary: string; accent: string }[];
  suggestedVisualStyle?: string;
  suggestedColorTheme?: string;
  tip?: string;
}

interface Props {
  data: Partial<FormSubmitData>;
  update: (fields: Partial<FormSubmitData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Style({ data, update, onNext, onBack }: Props) {
  const siteType = (data.siteType as string) || 'standard';
  const styles = VISUAL_STYLES[siteType] ?? VISUAL_STYLES.standard;
  const themes = COLOR_THEMES[siteType] ?? COLOR_THEMES.standard;

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [logoAnalysisMsg, setLogoAnalysisMsg] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);
  const [aiError, setAiError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const colors = data.colors?.length ? data.colors : ['#6366f1'];
  const canContinue = data.visualStyle && data.colorTheme;

  const handleLogoFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = e => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const path = `logos/${Date.now()}_${file.name}`;
      const snap = await uploadBytes(storageRef(storage, path), file);
      const url = await getDownloadURL(snap.ref);
      update({ logoUrl: url });

      // Analyse logo avec Gemini
      setAnalyzing(true);
      setLogoAnalysisMsg('');
      try {
        const base64 = await fileToBase64(file);
        const res = await fetch(`${API_BASE}/analyze-logo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_base64: base64.split(',')[1], media_type: file.type }),
        });
        const analysis = await res.json();
        if (!analysis.error && analysis.colors) {
          update({ colors: analysis.colors, visualStyle: analysis.visualStyle, colorTheme: analysis.colorTheme });
          setLogoAnalysisMsg(analysis.reasoning || 'Couleurs et style harmonisés avec votre logo.');
        }
      } catch {}
      finally { setAnalyzing(false); }
    } catch {}
    finally { setUploading(false); }
  };

  const fetchAiSuggestions = async () => {
    setAiLoading(true);
    setAiError('');
    setAiSuggestions(null);
    try {
      const res = await fetch(`${API_BASE}/gemini-preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: data.businessName,
          sector: data.sector,
          siteGoal: data.siteGoal,
          description: data.description,
          targetAudience: data.targetAudience,
          uniqueValue: data.uniqueValue,
          colors, colorTheme: data.colorTheme,
          visualStyle: data.visualStyle,
          siteType,
        }),
      });
      const d = await res.json();
      if (d.success) setAiSuggestions(d.suggestions);
      else setAiError(d.error || 'Erreur inconnue');
    } catch { setAiError('Impossible de contacter le serveur'); }
    finally { setAiLoading(false); }
  };

  const applyAll = () => {
    if (!aiSuggestions) return;
    if (aiSuggestions.palettes?.[0]) {
      const p = aiSuggestions.palettes[0];
      update({ colors: [p.primary, p.secondary, p.accent].filter(Boolean) });
    }
    if (aiSuggestions.suggestedVisualStyle) update({ visualStyle: aiSuggestions.suggestedVisualStyle });
    if (aiSuggestions.suggestedColorTheme) update({ colorTheme: aiSuggestions.suggestedColorTheme });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 8 }}>
          L&apos;identité visuelle
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
          L&apos;ambiance et les couleurs de votre site.
        </p>
      </motion.div>

      {/* Logo */}
      <div>
        <SectionLabel>Logo <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>— optionnel</span></SectionLabel>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleLogoFile(f); }}
          style={{
            border: '2px dashed rgba(255,255,255,0.12)', borderRadius: 12, padding: '24px 16px',
            textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.3)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.12)'; }}
        >
          {uploading || analyzing ? (
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              <Spinner /> {analyzing ? 'Analyse en cours…' : 'Upload en cours…'}
            </div>
          ) : logoPreview ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <img src={logoPreview} alt="Logo" style={{ maxHeight: 60, objectFit: 'contain' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Cliquer pour changer</span>
            </div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📎</div>
              Glisser ou cliquer pour uploader<br />
              <span style={{ fontSize: 11 }}>PNG, JPG, SVG — max 5 Mo</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoFile(f); }} />
        {logoAnalysisMsg && (
          <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(99,255,180,0.8)', padding: '8px 12px', background: 'rgba(99,255,180,0.06)', borderRadius: 8, border: '1px solid rgba(99,255,180,0.15)' }}>
            ✨ {logoAnalysisMsg}
          </div>
        )}
        <button type="button" onClick={() => update({ generateLogo: !data.generateLogo })}
          style={{ marginTop: 10, fontSize: 12, color: data.generateLogo ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
          {data.generateLogo ? '✓ ' : ''}Je n&apos;ai pas de logo — en générer un simple
        </button>
      </div>

      {/* Thème de fond */}
      <div>
        <SectionLabel>Thème général</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {themes.map(t => (
            <button key={t.key} type="button" onClick={() => update({ colorTheme: t.key })}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                borderRadius: 99, border: `1.5px solid ${data.colorTheme === t.key ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                background: data.colorTheme === t.key ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: data.colorTheme === t.key ? '#fff' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', fontSize: 13,
              }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: t.preview, border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style visuel */}
      <div>
        <SectionLabel>Style visuel</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
          {styles.map(s => (
            <button key={s.id} type="button" onClick={() => update({ visualStyle: s.id })}
              style={{
                textAlign: 'left', padding: '12px 14px', borderRadius: 10,
                border: `1.5px solid ${data.visualStyle === s.id ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
                background: data.visualStyle === s.id ? 'rgba(255,255,255,0.07)' : 'transparent',
                cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
              }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Couleurs */}
      <div>
        <SectionLabel>Couleurs de votre marque <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>— jusqu&apos;à 4</span></SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          {colors.map((color, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ position: 'relative' }}>
                <input type="color" value={color}
                  onChange={e => { const next = [...colors]; next[i] = e.target.value; update({ colors: next }); }}
                  style={{ width: 48, height: 48, borderRadius: 10, border: '2px solid rgba(255,255,255,0.12)', cursor: 'pointer', background: 'transparent', padding: 2 }} />
                {colors.length > 1 && (
                  <button type="button" onClick={() => update({ colors: colors.filter((_, j) => j !== i) })}
                    style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', border: 'none', background: '#333', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>×</button>
                )}
              </div>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{color}</span>
            </div>
          ))}
          {colors.length < 4 && (
            <button type="button" onClick={() => update({ colors: [...colors, '#ffffff'] })}
              style={{ width: 48, height: 48, borderRadius: 10, border: '2px dashed rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>+</button>
          )}
        </div>
      </div>

      {/* Suggestions IA */}
      <div>
        <button type="button" onClick={fetchAiSuggestions} disabled={aiLoading}
          style={{ ...inputStyle, textAlign: 'center', cursor: aiLoading ? 'wait' : 'pointer', border: '1.5px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.06)', color: 'rgba(180,180,255,0.8)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {aiLoading ? <><Spinner /> Analyse en cours…</> : '✨ Suggestions IA pour mon projet'}
        </button>
        {aiError && <p style={{ fontSize: 12, color: '#f87171', marginTop: 6 }}>{aiError}</p>}
        {aiSuggestions && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 12, padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {aiSuggestions.palettes?.slice(0, 1).map((p, i) => (
              <div key={i}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>{p.name}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[p.primary, p.secondary, p.accent].filter(Boolean).map((c, j) => (
                    <div key={j} style={{ width: 32, height: 32, borderRadius: 8, background: c, border: '1px solid rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{p.description}</p>
              </div>
            ))}
            {aiSuggestions.tip && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>{aiSuggestions.tip}</p>}
            <button type="button" onClick={applyAll}
              style={{ padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Tout appliquer
            </button>
          </motion.div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <NavButton onClick={onBack} label="← Retour" secondary />
        <div style={{ flex: 1 }}>
          <NavButton onClick={onNext} disabled={!canContinue} label="Continuer →" />
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>{children}</div>;
}

function Spinner() {
  return (
    <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'rgba(255,255,255,0.6)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
