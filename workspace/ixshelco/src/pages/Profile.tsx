import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Calendar, Settings, LogOut, Edit2, Save, X, Trash2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { db } from '../lib/firebase';
import { useAuthStore } from '../stores/authStore';

type Tab = 'appointments' | 'profile' | 'settings';

interface Appointment {
  id: string;
  serviceName: string;
  servicePrice: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'done';
  clientName: string;
  clientEmail: string;
}

function StatusBadge({ status }: { status: Appointment['status'] }) {
  const config = {
    pending: { label: 'En attente', color: 'text-yellow-400 bg-yellow-400/10', icon: Clock },
    confirmed: { label: 'Confirmé', color: 'text-green-400 bg-green-400/10', icon: CheckCircle },
    cancelled: { label: 'Annulé', color: 'text-red-400 bg-red-400/10', icon: XCircle },
    done: { label: 'Terminé', color: 'text-[var(--muted)] bg-[var(--border)]', icon: CheckCircle },
  }[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser, deleteAccount } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);

  useEffect(() => {
    if (!user) {
      toast.error('Connectez-vous pour accéder à votre compte.');
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'appointments' && user) {
      fetchAppointments();
    }
  }, [activeTab, user]);

  const fetchAppointments = async () => {
    if (!user) return;
    setLoadingAppts(true);
    try {
      const q = query(collection(db, 'appointments'), where('userId', '==', user.id));
      const snap = await getDocs(q);
      const appts: Appointment[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
      appts.sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
      setAppointments(appts);
    } catch {
      toast.error('Erreur lors du chargement des rendez-vous.');
    } finally {
      setLoadingAppts(false);
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' });
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: 'cancelled' } : a));
      toast.success('Rendez-vous annulé.');
    } catch {
      toast.error('Erreur lors de l\'annulation.');
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      await setDoc(doc(db, 'users', user.id), {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      updateUser({ name: editForm.name, email: editForm.email });
      setIsEditing(false);
      toast.success('Profil mis à jour.');
    } catch {
      toast.error('Erreur lors de la sauvegarde.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Supprimer définitivement votre compte ? Cette action est irréversible.')) return;
    try {
      await deleteAccount();
      toast.success('Compte supprimé.');
      navigate('/');
    } catch {
      toast.error('Erreur lors de la suppression. Reconnectez-vous et réessayez.');
    }
  };

  if (!user) return null;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'appointments', label: 'Mes RDV', icon: Calendar },
    { id: 'profile', label: 'Mon profil', icon: User },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Retour</span>
          </button>

          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 border-2 border-[var(--primary)]/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-[var(--primary)]">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text)]">{user.name}</h1>
              <p className="text-[var(--muted)]">{user.email}</p>
              {user.role === 'admin' && (
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium rounded-full">
                  Admin
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 bg-[var(--surface)] rounded-xl border border-[var(--border)] w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >

          {/* Mes RDV */}
          {activeTab === 'appointments' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[var(--text)]">Mes rendez-vous</h2>
                <button
                  onClick={() => navigate('/booking')}
                  className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
                >
                  + Nouveau RDV
                </button>
              </div>

              {loadingAppts ? (
                <div className="text-center py-16 text-[var(--muted)]">Chargement...</div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-16 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
                  <Calendar className="w-12 h-12 text-[var(--muted)] mx-auto mb-3" />
                  <p className="text-[var(--muted)]">Aucun rendez-vous pour le moment.</p>
                  <button
                    onClick={() => navigate('/booking')}
                    className="mt-4 px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
                  >
                    Prendre un RDV
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appt, i) => (
                    <motion.div
                      key={appt.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--primary)]/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-[var(--text)]">{appt.serviceName}</h3>
                            <StatusBadge status={appt.status} />
                          </div>
                          <p className="text-sm text-[var(--muted)] flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(appt.date), 'EEEE d MMMM yyyy', { locale: fr })}
                            <span className="mx-1">·</span>
                            <Clock className="w-3.5 h-3.5" />
                            {appt.time}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[var(--primary)]">{appt.servicePrice} €</span>
                          {(appt.status === 'pending' || appt.status === 'confirmed') && (
                            <button
                              onClick={() => cancelAppointment(appt.id)}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Annuler"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mon profil */}
          {activeTab === 'profile' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[var(--text)]">Mon profil</h2>
                {!isEditing && (
                  <button
                    onClick={() => { setEditForm({ name: user.name, email: user.email, phone: '' }); setIsEditing(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </button>
                )}
              </div>

              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">Nom complet</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                        className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">Téléphone</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="+33 6 12 34 56 78"
                        className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-all"
                      >
                        <Save className="w-4 h-4" />
                        {savingProfile ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 border border-[var(--border)] text-[var(--muted)] rounded-xl text-sm font-medium hover:text-[var(--text)] transition-all"
                      >
                        <X className="w-4 h-4" />
                        Annuler
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-[var(--primary)]" />
                      <div>
                        <p className="text-xs text-[var(--muted)]">Nom</p>
                        <p className="text-[var(--text)] font-medium">{user.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-[var(--primary)]" />
                      <div>
                        <p className="text-xs text-[var(--muted)]">Email</p>
                        <p className="text-[var(--text)] font-medium">{user.email}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Paramètres */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[var(--text)]">Paramètres du compte</h2>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl divide-y divide-[var(--border)]"
              >
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[var(--text)]">Notifications email</h3>
                    <p className="text-sm text-[var(--muted)]">Confirmations de RDV et rappels</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotif}
                      onChange={(e) => setEmailNotif(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[var(--border)] rounded-full peer peer-checked:bg-[var(--primary)] transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
                  </label>
                </div>

                <div className="p-5">
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-[var(--border)] text-[var(--muted)] rounded-xl text-sm font-medium hover:text-[var(--text)] hover:border-[var(--text)] transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[var(--surface)] border border-red-500/20 rounded-2xl p-5"
              >
                <h3 className="font-semibold text-[var(--text)] mb-1">Zone de danger</h3>
                <p className="text-sm text-[var(--muted)] mb-4">
                  Supprime définitivement votre compte et toutes vos données.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer mon compte
                </button>
              </motion.div>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
