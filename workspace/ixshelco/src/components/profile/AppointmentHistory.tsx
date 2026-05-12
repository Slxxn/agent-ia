import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useAppointmentStore, Appointment } from '../../stores/appointmentStore';
import { useAuthStore } from '../../stores/authStore';
import { formatDate, formatTime, formatPrice } from '../../lib/utils';
import Badge from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

const statusConfig = {
  confirmed: { label: 'Confirmé', color: 'bg-green-100 text-green-800' },
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800' },
  completed: { label: 'Terminé', color: 'bg-blue-100 text-blue-800' },
};

export const AppointmentHistory: React.FC = () => {
  const { user } = useAuthStore();
  const { appointments, cancelAppointment, isLoading } = useAppointmentStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const userAppointments = appointments
    .filter(apt => apt.clientName === user?.name)
    .filter(apt => {
      if (filter === 'upcoming') return new Date(apt.date) >= new Date();
      if (filter === 'past') return new Date(apt.date) < new Date();
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCancel = async (appointmentId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      await cancelAppointment(appointmentId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#550b14]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Mon Historique</h3>
        <div className="flex gap-2">
          {(['all', 'upcoming', 'past'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                filter === f
                  ? 'bg-[#550b14] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'upcoming' ? 'À venir' : 'Passés'}
            </button>
          ))}
        </div>
      </div>

      {userAppointments.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-12 h-12" />}
          title="Aucun rendez-vous"
          description="Vous n'avez pas encore de rendez-vous enregistré."
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {userAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors"
              >
                <button
                  onClick={() => setExpandedId(expandedId === appointment.id ? null : appointment.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#550b14]/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#550b14]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.services[0]?.name || 'Service'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(appointment.date)} à {formatTime(appointment.time)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        appointment.status === 'confirmed' ? 'success' :
                        appointment.status === 'cancelled' ? 'error' :
                        appointment.status === 'completed' ? 'info' : 'warning'
                      }
                    >
                      {statusConfig[appointment.status]?.label || appointment.status}
                    </Badge>
                    {expandedId === appointment.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedId === appointment.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(appointment.time)} - {appointment.duration} min</span>
                        </div>
                        {appointment.totalPrice && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium text-[#550b14]">{formatPrice(appointment.totalPrice)}</span>
                          </div>
                        )}
                        {appointment.notes && (
                          <p className="text-sm text-gray-500 italic">
                            Note : {appointment.notes}
                          </p>
                        )}
                        <div className="flex gap-2 mt-3">
                          {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                            <button
                              onClick={() => handleCancel(appointment.id)}
                              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              Annuler
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default AppointmentHistory;