import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from './CartStore';

export interface CartDrawerProps {
  checkoutHref?: string;
  currency?: string;
}

export default function CartDrawer({ checkoutHref = '/checkout', currency = '€' }: CartDrawerProps) {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, count } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, backdropFilter: 'blur(2px)' }}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(420px, 100vw)', background: 'var(--surface)', borderLeft: '1px solid var(--bd)', zIndex: 1001, display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--bd)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShoppingBag size={18} style={{ color: 'var(--text)' }} />
                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Panier</span>
                {count() > 0 && (
                  <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: 999, fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>{count()}</span>
                )}
              </div>
              <button onClick={closeCart} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--muted)', borderRadius: 8 }}>
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <ShoppingBag size={40} style={{ color: 'var(--bd)', margin: '0 auto 16px' }} />
                  <p style={{ fontSize: 14, color: 'var(--muted)' }}>Votre panier est vide</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {items.map((item) => (
                    <div key={item.id + (item.variant ?? '')} style={{ display: 'flex', gap: 12, padding: 12, background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--bd)' }}>
                      {item.image && (
                        <img src={item.image} alt={item.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                        {item.variant && <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>{item.variant}</div>}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)} style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--bd)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
                              <Minus size={10} />
                            </button>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)} style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--bd)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
                              <Plus size={10} />
                            </button>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{(item.price * item.quantity).toFixed(2)}{currency}</span>
                            <button onClick={() => removeItem(item.id, item.variant)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 2 }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div style={{ padding: '20px 24px', borderTop: '1px solid var(--bd)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 14, color: 'var(--muted)' }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{total().toFixed(2)}{currency}</span>
                </div>
                <Link to={checkoutHref} onClick={closeCart} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '14px' }}>
                  Commander <ArrowRight size={16} />
                </Link>
                <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 10 }}>Livraison et taxes calculées à l'étape suivante</p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
