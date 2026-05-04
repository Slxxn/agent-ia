/**
 * ContactForm — Full contact section with form + info sidebar.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Mail, Phone } from 'lucide-react';
import { fadeUp, slideLeft, slideRight, stagger, VIEWPORT } from '@/lib/motion';

export interface ContactInfo {
  address?: string;
  email?: string;
  phone?: string;
}

export interface ContactFormProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub?: string;
  info?: ContactInfo;
  submitLabel?: string;
  successMessage?: string;
}

export default function ContactForm({ badge, headline, headlineAccent, sub, info, submitLabel = 'Envoyer le message', successMessage = 'Message envoyé ! On vous répond sous 24h.' }: ContactFormProps) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
  };

  const field = (id: keyof typeof form, label: string, type = 'text', rows?: number) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.04em' }}>{label}</label>
      {rows ? (
        <textarea
          id={id}
          rows={rows}
          value={form[id]}
          onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
          required
          style={{ padding: '11px 14px', background: 'var(--surface2)', border: '1px solid var(--bd)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: 14, resize: 'vertical', outline: 'none', fontFamily: 'var(--font-body)', transition: 'border-color 0.15s' }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--bd)'}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={form[id]}
          onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
          required
          style={{ padding: '11px 14px', background: 'var(--surface2)', border: '1px solid var(--bd)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)', transition: 'border-color 0.15s' }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--bd)'}
        />
      )}
    </div>
  );

  return (
    <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={VIEWPORT} style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 56px' }}>
          {badge && <motion.div variants={fadeUp} style={{ marginBottom: 16 }}><span className="section-label">{badge}</span></motion.div>}
          <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 14 }}>
            {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
          </motion.h2>
          {sub && <motion.p variants={fadeUp} style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.7 }}>{sub}</motion.p>}
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Info sidebar */}
          {info && (
            <motion.div variants={slideLeft} initial="hidden" whileInView="show" viewport={VIEWPORT} className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                info.address && { icon: <MapPin size={18} />, label: 'Adresse', value: info.address },
                info.email && { icon: <Mail size={18} />, label: 'Email', value: info.email },
                info.phone && { icon: <Phone size={18} />, label: 'Téléphone', value: info.phone },
              ].filter(Boolean).map((item: any, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '20px', background: 'var(--surface)', border: '1px solid var(--bd)', borderRadius: 'var(--radius)' }}>
                  <div style={{ width: 40, height: 40, background: 'var(--primary-muted)', border: '1px solid var(--primary-border)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{item.label}</p>
                    <p style={{ fontSize: 14, color: 'var(--text2)' }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Form */}
          <motion.div variants={slideRight} initial="hidden" whileInView="show" viewport={VIEWPORT} className={info ? 'lg:col-span-3' : 'lg:col-span-5'}>
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '48px 32px', background: 'var(--surface)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, background: 'rgba(34,197,94,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{successMessage}</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '32px', background: 'var(--surface)', border: '1px solid var(--bd)', borderRadius: 'var(--radius-lg)' }}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {field('name', 'Nom complet')}
                  {field('email', 'Email', 'email')}
                </div>
                {field('subject', 'Sujet')}
                {field('message', 'Message', 'text', 5)}
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 28px' }} disabled={loading}>
                  {loading ? 'Envoi...' : submitLabel} {!loading && <Send size={15} />}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
