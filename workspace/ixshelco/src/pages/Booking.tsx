import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, startOfDay, isSunday, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, User, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { services } from '../data/services';
import { db } from '../lib/firebase';
import { useAuthStore } from '../stores/authStore';
import { formatDuration } from '../lib/utils';

type Step = 'service' | 'datetime' | 'info' | 'confirm';

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: 'service', label: 'Service', icon: Calendar },
  { id: 'datetime', label: 'Date & Heure', icon: Clock },
  { id: 'info', label: 'Informations', icon: User },
  { id: 'confirm', label: 'Confirmation', icon: CheckCircle },
];

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  let h = 9;
  let m = 0;
  while (h < 19 || (h === 19 && m === 0)) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += 45;
    if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState<Step>('service');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [clientInfo, setClientInfo] = useState({ name: user?.name ?? '', email: user?.email ?? '', phone: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = startOfDay(new Date());
  const weekStart = addDays(today, weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const selectedService = services.find((s) => s.id === selectedServiceId);

  const goNext = () => setStep(STEPS[stepIndex + 1].id);
  const goPrev = () => setStep(STEPS[stepIndex - 1].id);

  const canNext = () => {
    if (step === 'service') return !!selectedServiceId;
    if (step === 'datetime') return !!selectedDate && !!selectedTime;
    if (step === 'info') return !!clientInfo.name && !!clientInfo.email && !!clientInfo.phone;
    return false;
  };

  const handleConfirm = async () => {
    if (!selectedService) { toast.error('Veuillez sélectionner un service.'); return; }
    if (!selectedDate) { toast.error('Veuillez sélectionner une date.'); return; }
    if (!selectedTime) { toast.error('Veuillez sélectionner un créneau.'); return; }
    if (!clientInfo.name || !clientInfo.email || !clientInfo.phone) { toast.error('Veuillez remplir vos coordonnées.'); return; }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        serviceDuration: selectedService.duration,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        clientName: clientInfo.name,
        clientEmail: clientInfo.email,
        clientPhone: clientInfo.phone,
        notes: clientInfo.notes,
        userId: user?.id ?? null,
        status: 'pending',
        createdAt: Timestamp.now(),
      });
      toast.success('Rendez-vous confirmé ! À bientôt 💅');
      navigate('/');
    } catch (err: unknown) {
      console.error('Booking error:', err);
      toast.error('Erreur lors de la réservation. Vérifiez votre connexion et réessayez.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2 text-center">Réserver un rendez-vous</h1>
        <p className="text-[var(--muted)] text-center mb-10">Studio IXSHEL&CO. — Nail art à domicile</p>

        {/* Progress bar */}
        <div className="flex items-center mb-10 gap-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`flex flex-col items-center flex-1`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    done ? 'bg-[var(--primary)] border-[var(--primary)]' :
                    active ? 'border-[var(--primary)] bg-[var(--surface)]' :
                    'border-[var(--border)] bg-[var(--surface)]'
                  }`}>
                    <Icon className={`w-5 h-5 ${done || active ? 'text-[var(--primary)]' : 'text-[var(--muted)]'} ${done ? 'text-white' : ''}`} />
                  </div>
                  <span className={`text-xs mt-1 font-medium ${active ? 'text-[var(--primary)]' : done ? 'text-[var(--text)]' : 'text-[var(--muted)]'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mt-[-18px] transition-all ${i < stepIndex ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >

            {/* Step 1: Service */}
            {step === 'service' && (
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)] mb-6">Choisissez votre service</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.filter((s) => s.isActive).map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`text-left p-5 rounded-xl border-2 transition-all ${
                        selectedServiceId === service.id
                          ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/40'
                      }`}
                    >
                      <div className="aspect-[3/2] rounded-lg overflow-hidden mb-3">
                        <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-semibold text-[var(--text)]">{service.name}</h3>
                      <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{service.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-bold text-[var(--primary)]">{service.price} €</span>
                        <span className="text-xs text-[var(--muted)]">{formatDuration(service.duration)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Date & Heure */}
            {step === 'datetime' && (
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)] mb-6">Choisissez une date et un créneau</h2>

                {/* Week navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
                    disabled={weekOffset === 0}
                    className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium text-[var(--text)]">
                    {format(weekStart, 'MMMM yyyy', { locale: fr })}
                  </span>
                  <button
                    onClick={() => setWeekOffset((w) => w + 1)}
                    className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Week days */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {weekDays.map((day) => {
                    const disabled = isSunday(day) || isBefore(day, today);
                    const selected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => { if (!disabled) { setSelectedDate(day); setSelectedTime(''); } }}
                        disabled={disabled}
                        className={`flex flex-col items-center py-3 px-1 rounded-xl border-2 transition-all ${
                          disabled ? 'opacity-30 cursor-not-allowed border-transparent' :
                          selected ? 'border-[var(--primary)] bg-[var(--primary)]/10' :
                          'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/40'
                        }`}
                      >
                        <span className="text-[10px] text-[var(--muted)] uppercase">
                          {format(day, 'EEE', { locale: fr })}
                        </span>
                        <span className={`text-lg font-bold mt-0.5 ${selected ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}>
                          {format(day, 'd')}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Time slots */}
                {selectedDate && (
                  <>
                    <h3 className="text-sm font-medium text-[var(--muted)] mb-3">
                      Créneaux disponibles — {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
                    </h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                            selectedTime === slot
                              ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--primary)]/40'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Informations */}
            {step === 'info' && (
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)] mb-6">Vos coordonnées</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">Nom complet *</label>
                    <input
                      type="text"
                      value={clientInfo.name}
                      onChange={(e) => setClientInfo((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Votre nom"
                      className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">Email *</label>
                    <input
                      type="email"
                      value={clientInfo.email}
                      onChange={(e) => setClientInfo((p) => ({ ...p, email: e.target.value }))}
                      placeholder="vous@exemple.com"
                      className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">Téléphone *</label>
                    <input
                      type="tel"
                      value={clientInfo.phone}
                      onChange={(e) => setClientInfo((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">Notes (optionnel)</label>
                    <textarea
                      value={clientInfo.notes}
                      onChange={(e) => setClientInfo((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Allergies, préférences, demandes particulières..."
                      rows={3}
                      className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 'confirm' && selectedService && selectedDate && (
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)] mb-6">Récapitulatif du rendez-vous</h2>
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4 mb-8">
                  <div className="flex items-center gap-4 pb-4 border-b border-[var(--border)]">
                    <img src={selectedService.image} alt={selectedService.name} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <h3 className="font-bold text-[var(--text)] text-lg">{selectedService.name}</h3>
                      <p className="text-[var(--muted)] text-sm">{formatDuration(selectedService.duration)}</p>
                    </div>
                    <span className="ml-auto text-xl font-bold text-[var(--primary)]">{selectedService.price} €</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[var(--primary)]" />
                    <span className="text-[var(--text)]">{format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[var(--primary)]" />
                    <span className="text-[var(--text)]">{selectedTime}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-[var(--primary)]" />
                    <div>
                      <p className="text-[var(--text)]">{clientInfo.name}</p>
                      <p className="text-[var(--muted)] text-sm">{clientInfo.email} · {clientInfo.phone}</p>
                    </div>
                  </div>
                  {clientInfo.notes && (
                    <div className="bg-[var(--bg)] rounded-xl p-3 text-sm text-[var(--muted)]">
                      {clientInfo.notes}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-semibold text-lg hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Confirmation...' : 'Confirmer mon rendez-vous'}
                </button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8">
          {stepIndex > 0 ? (
            <button
              onClick={goPrev}
              className="flex items-center gap-2 px-5 py-3 border border-[var(--border)] text-[var(--muted)] rounded-xl hover:text-[var(--text)] transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </button>
          ) : <div />}
          {step !== 'confirm' && (
            <button
              onClick={goNext}
              disabled={!canNext()}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
