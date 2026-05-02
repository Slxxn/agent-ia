"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function Modal({
  open,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "default",
  onConfirm,
  onCancel,
}: ModalProps) {
  /* Close on Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  const isDanger = variant === "danger";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onCancel}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
              zIndex: 100,
            }}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 101,
              width: "100%",
              maxWidth: 420,
              padding: "0 16px",
            }}
          >
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--bd-bright)",
                borderRadius: 14,
                padding: "24px",
                boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {isDanger && (
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        background: "var(--error-bg)",
                        border: "1px solid var(--error-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <AlertTriangle size={16} color="var(--error)" />
                    </div>
                  )}
                  <h3
                    style={{
                      fontWeight: 600,
                      fontSize: 15,
                      color: "var(--text)",
                      lineHeight: 1.3,
                    }}
                  >
                    {title}
                  </h3>
                </div>
                <button
                  onClick={onCancel}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    border: "none",
                    background: "transparent",
                    color: "var(--muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              <p
                style={{
                  color: "var(--text2)",
                  fontSize: 13,
                  lineHeight: 1.6,
                  marginBottom: 20,
                }}
              >
                {description}
              </p>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={onCancel}
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 8,
                    border: "1px solid var(--bd-bright)",
                    background: "var(--surface3)",
                    color: "var(--text2)",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 8,
                    border: isDanger ? "1px solid var(--error-border)" : "1px solid var(--primary-border)",
                    background: isDanger ? "var(--error-bg)" : "var(--primary-muted)",
                    color: isDanger ? "var(--error)" : "var(--primary)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
