import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Users, TrendingUp, ShoppingCart, Settings, LogOut, Eye, ChevronRight } from 'lucide-react';
import { useAuthStore } from './AuthStore';
import { fadeUp, stagger } from '@/lib/motion';

interface Order {
  id: string;
  customer: string;
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

export interface AdminDashboardProps {
  stats?: { revenue: number; orders: number; customers: number; conversion: number };
  recentOrders?: Order[];
  currency?: string;
}

const STATUS_COLORS: Record<Order['status'], string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'En attente',
  processing: 'En cours',
  shipped: 'Expédié',
  delivered: 'Livré',
  cancelled: 'Annulé',
};

const DEFAULT_STATS = { revenue: 12840, orders: 147, customers: 89, conversion: 3.2 };

export default function AdminDashboard({ stats = DEFAULT_STATS, recentOrders = [], currency = '€' }: AdminDashboardProps) {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'customers'>('overview');

  const kpis = [
    { icon: TrendingUp, label: 'Revenus', value: `${stats.revenue.toLocaleString()}${currency}`, change: '+12%' },
    { icon: ShoppingCart, label: 'Commandes', value: stats.orders, change: '+8%' },
    { icon: Users, label: 'Clients', value: stats.customers, change: '+23%' },
    { icon: Package, label: 'Conversion', value: `${stats.conversion}%`, change: '+0.4%' },
  ];

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex' }}>
      {/* Sidebar */}
      <nav style={{ width: 240, background: 'var(--surface)', borderRight: '1px solid var(--bd)', padding: '24px 16px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100dvh' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Administration</div>
          {user && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{user.email}</div>}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {([
            { key: 'overview', icon: TrendingUp, label: 'Vue d'ensemble' },
            { key: 'orders', icon: ShoppingCart, label: 'Commandes' },
            { key: 'customers', icon: Users, label: 'Clients' },
          ] as const).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: activeTab === key ? 'var(--primary-muted)' : 'transparent', color: activeTab === key ? 'var(--primary)' : 'var(--text2)', fontSize: 13, fontWeight: activeTab === key ? 600 : 400, textAlign: 'left' }}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--muted)', fontSize: 13 }}>
          <LogOut size={15} /> Déconnexion
        </button>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, padding: 'clamp(1.5rem,3vw,2.5rem)', overflowY: 'auto' }}>
        <motion.div variants={stagger(0.08)} initial="hidden" animate="show">
          <motion.h1 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,2.5vw,2rem)', fontWeight: 800, color: 'var(--text)', marginBottom: 24 }}>
            {activeTab === 'overview' ? 'Vue d'ensemble' : activeTab === 'orders' ? 'Commandes' : 'Clients'}
          </motion.h1>

          {activeTab === 'overview' && (
            <>
              {/* KPI cards */}
              <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
                {kpis.map(({ icon: Icon, label, value, change }, i) => (
                  <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--bd)', borderRadius: 12, padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={16} style={{ color: 'var(--primary)' }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 999 }}>{change}</span>
                    </div>
                    <div style={{ fontSize: 'clamp(1.3rem,2vw,1.6rem)', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </motion.div>

              {/* Recent orders */}
              <motion.div variants={fadeUp} style={{ background: 'var(--surface)', border: '1px solid var(--bd)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Commandes récentes</span>
                </div>
                {recentOrders.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Aucune commande pour le moment</div>
                ) : (
                  recentOrders.slice(0, 8).map((order, i) => (
                    <div key={order.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: i < recentOrders.length - 1 ? '1px solid var(--bd)' : 'none', gap: 16 }}>
                      <div style={{ flex: 1, fontSize: 13 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>#{order.id}</span>
                        <span style={{ color: 'var(--muted)', marginLeft: 8 }}>{order.customer}</span>
                      </div>
                      <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 999, background: STATUS_COLORS[order.status] + '20', color: STATUS_COLORS[order.status], fontWeight: 600 }}>
                        {STATUS_LABELS[order.status]}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', minWidth: 70, textAlign: 'right' }}>{order.amount.toFixed(2)}{currency}</span>
                    </div>
                  ))
                )}
              </motion.div>
            </>
          )}

          {activeTab === 'orders' && (
            <motion.div variants={fadeUp} style={{ background: 'var(--surface)', border: '1px solid var(--bd)', borderRadius: 12, padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
              Module commandes — brancher sur votre API
            </motion.div>
          )}

          {activeTab === 'customers' && (
            <motion.div variants={fadeUp} style={{ background: 'var(--surface)', border: '1px solid var(--bd)', borderRadius: 12, padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
              Module clients — brancher sur votre API
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
