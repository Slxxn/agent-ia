import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Settings, BarChart3, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAppointmentStore } from '../stores/appointmentStore';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

type Tab = 'dashboard' | 'appointments' | 'clients' | 'settings';

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { user } = useAuthStore();
  const { appointments, isLoading } = useAppointmentStore();

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'appointments', label: 'Rendez-vous', icon: Calendar },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const stats = [
    { label: 'Rendez-vous aujourd\'hui', value: '3', icon: Clock, color: 'bg-[#550b14]/10 text-[#550b14]' },
    { label: 'Cette semaine', value: '12', icon: Calendar, color: 'bg-[#7e6961]/10 text-[#7e6961]' },
    { label: 'Confirmés', value: '8', icon: CheckCircle, color: 'bg-green-100 text-green-600' },
    { label: 'En attente', value: '4', icon: AlertCircle, color: 'bg-yellow-100 text-yellow-600' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">Accès restreint</h2>
          <p className="text-[#7e6961] mb-6">Connectez-vous pour accéder à l'administration.</p>
          <Button variant="primary" onClick={() => window.location.href = '/profile'}>
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-2">
            Administration
          </h1>
          <p className="text-[#7e6961]">
            Gérez vos rendez-vous et vos clients.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#550b14] text-white shadow-lg shadow-[#550b14]/20'
                  : 'bg-white border border-[#e2e8f0] text-[#7e6961] hover:border-[#550b14]/30 hover:text-[#550b14]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="bg-white border border-[#e2e8f0] rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#1a1a1a]">{stat.value}</p>
                  <p className="text-sm text-[#7e6961]">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Appointments */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Rendez-vous récents</h3>
              {appointments.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="Aucun rendez-vous"
                  description="Les rendez-vous apparaîtront ici une fois réservés."
                />
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 5).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#f8f8f7]"
                    >
                      <div>
                        <p className="font-medium text-[#1a1a1a]">{appointment.clientName}</p>
                        <p className="text-sm text-[#7e6961]">{appointment.services}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#1a1a1a]">{appointment.time}</p>
                        <Badge
                          variant={appointment.status === 'confirmed' ? 'success' : 'warning'}
                        >
                          {appointment.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-[#e2e8f0] rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Tous les rendez-vous</h3>
            {appointments.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Aucun rendez-vous"
                description="Commencez par ajouter des services pour recevoir des réservations."
              />
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-[#f8f8f7]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#550b14]/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-[#550b14]">
                          {appointment.clientName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[#1a1a1a]">{appointment.clientName}</p>
                        <p className="text-sm text-[#7e6961]">{appointment.services}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[#1a1a1a]">{appointment.date}</p>
                      <p className="text-sm text-[#7e6961]">{appointment.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-[#e2e8f0] rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Clients</h3>
            <EmptyState
              icon={Users}
              title="Aucun client"
              description="Les clients apparaîtront ici après leur première réservation."
            />
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-[#e2e8f0] rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Paramètres</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                  Horaires d'ouverture
                </label>
                <p className="text-sm text-[#7e6961]">
                  Gérez vos horaires de travail et vos jours de fermeture.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                  Notifications
                </label>
                <p className="text-sm text-[#7e6961]">
                  Configurez les notifications par email et SMS pour les nouveaux rendez-vous.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                  Services
                </label>
                <p className="text-sm text-[#7e6961]">
                  Ajoutez, modifiez ou supprimez vos services proposés.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Admin;
