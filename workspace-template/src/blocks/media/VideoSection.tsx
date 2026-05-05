import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeUp, VIEWPORT } from '@/lib/motion';

export interface VideoSectionProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  aspectRatio?: '16/9' | '4/3' | '1/1';
}

export default function VideoSection({ badge, headline, headlineAccent, sub, videoUrl, thumbnailUrl, aspectRatio = '16/9' }: VideoSectionProps) {
  const [playing, setPlaying] = useState(false);
  const isEmbed = videoUrl.includes('youtube') || videoUrl.includes('vimeo') || videoUrl.includes('youtu.be');

  const getEmbedUrl = (url: string) => {
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    return url;
  };

  return (
    <section style={{ padding: '80px 0', background: 'var(--surface)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={VIEWPORT}
          style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
          {badge && <div style={{ marginBottom: 16 }}><span className="section-label">{badge}</span></div>}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 14 }}>
            {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
          </h2>
          {sub && <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.7 }}>{sub}</p>}
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={VIEWPORT}
          style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--bd)', background: '#000', aspectRatio }}>
          {playing && isEmbed ? (
            <iframe src={getEmbedUrl(videoUrl)} style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', inset: 0 }} allow="autoplay; fullscreen" allowFullScreen />
          ) : playing ? (
            <video src={videoUrl} autoPlay controls style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, cursor: 'pointer' }} onClick={() => setPlaying(true)}>
              {thumbnailUrl && <img src={thumbnailUrl} alt="Video thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(99,102,241,0.5)', transition: 'transform 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
