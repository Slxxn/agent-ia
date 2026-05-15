import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Cpu, GitBranch } from 'lucide-react';
import { fadeUp, stagger } from '@/lib/motion';

export interface HeroTechProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub: string;
  cta: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  techTags?: string[];
  terminalLines?: string[];
}

const DEFAULT_TAGS = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'];
const DEFAULT_TERMINAL = [
  '$ npm run deploy',
  '▸ Building for production...',
  '▸ Bundle size: 42kb gzipped',
  '✓ Deployed in 1.2s',
];

export default function HeroTech({ badge, headline, headlineAccent, sub, cta, ctaSecondary, techTags = DEFAULT_TAGS, terminalLines = DEFAULT_TERMINAL }: HeroTechProps) {
  return (
    <section style={{ position: 'relative', minHeight: '100dvh', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', overflow: 'hidden', background: 'var(--bg)', paddingTop: 80 }}>
      {/* Grid dot background */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, var(--bd) 1px, transparent 1px)', backgroundSize: '28px 28px', opacity: 0.4 }} />
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, transparent 40%, var(--bg) 80%)' }} />

      {/* Left — content */}
      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        animate="show"
        style={{ position: 'relative', zIndex: 1, padding: 'clamp(2rem,7vw,5rem) clamp(1.5rem,5vw,4rem)' }}
      >
        {badge && (
          <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--bd)', fontSize: 11, fontWeight: 600, color: 'var(--text2)', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.04em' }}>
              <Terminal size={10} style={{ color: 'var(--primary)' }} /> {badge}
            </span>
          </motion.div>
        )}

        <motion.h1
          variants={fadeUp}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.4rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 16 }}
        >
          {headline}
          {headlineAccent && (
            <> <span className="gradient-text">{headlineAccent}</span></>
          )}
        </motion.h1>

        <motion.p variants={fadeUp} style={{ fontSize: 'clamp(1rem, 1.8vw, 1.1rem)', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 420, marginBottom: 32 }}>
          {sub}
        </motion.p>

        <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 36 }}>
          {techTags.map((tag, i) => (
            <span key={i} style={{ padding: '4px 10px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--bd)', fontSize: 11, fontWeight: 600, color: 'var(--text2)', fontFamily: 'var(--font-mono, monospace)' }}>
              {tag}
            </span>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to={cta.href} className="btn-primary" style={{ fontSize: 15, padding: '13px 28px' }}>
            {cta.label} <ArrowRight size={16} />
          </Link>
          {ctaSecondary && (
            <Link to={ctaSecondary.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: 'var(--text2)', border: '1.5px solid var(--bd)', borderRadius: 8, padding: '12px 22px' }}>
              <GitBranch size={14} /> {ctaSecondary.label}
            </Link>
          )}
        </motion.div>
      </motion.div>

      {/* Right — terminal window */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        style={{ position: 'relative', zIndex: 1, padding: 'clamp(2rem,5vw,4rem)' }}
      >
        <div style={{ background: 'var(--surface)', border: '1px solid var(--bd)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
          {/* Window chrome */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px', borderBottom: '1px solid var(--bd)', background: 'var(--surface2)' }}>
            {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
            ))}
            <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono, monospace)' }}>terminal</span>
          </div>
          <div style={{ padding: '20px 20px 24px', fontFamily: 'var(--font-mono, monospace)', fontSize: 13, lineHeight: 1.8 }}>
            {terminalLines.map((line, i) => (
              <div key={i} style={{ color: line.startsWith('✓') ? '#4ade80' : line.startsWith('▸') ? 'var(--muted)' : 'var(--text2)' }}>
                {line}
              </div>
            ))}
            <span style={{ display: 'inline-block', width: 8, height: 16, background: 'var(--primary)', marginTop: 4, animation: 'blink 1s step-end infinite' }} />
          </div>
        </div>

        {/* Floating metric */}
        <div style={{ position: 'absolute', top: 24, right: 24, background: 'var(--surface)', border: '1px solid var(--bd)', borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Cpu size={12} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace' }}>perf score</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#4ade80', lineHeight: 1.2 }}>99</div>
        </div>
      </motion.div>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@media(max-width:768px){section{grid-template-columns:1fr!important}section>div:last-child{display:none!important}}`}</style>
    </section>
  );
}
