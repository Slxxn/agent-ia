import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Service } from '@/lib/theme';
import { generateId } from '@/lib/utils';

export interface Appointment {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  services: Service[];
  date: string;
  time: string;
  duration: number;
  notes: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  createdAt: string;
}

interface AppointmentState {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  fetchAppointments: () => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Promise<void>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  getAppointmentById: (id: string) => Appointment | undefined;
  getAppointmentsByDate: (date: string) => Appointment[];
  clearError: () => void;
}

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set, get) => ({
      appointments: [],
      isLoading: false,
      error: null,

      fetchAppointments: async () => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          set({ isLoading: false });
        } catch (err) {
          set({ error: 'Erreur lors du chargement des rendez-vous', isLoading: false });
        }
      },

      addAppointment: async (appointmentData) => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 400));
          const newAppointment: Appointment = {
            ...appointmentData,
            id: generateId(),
            createdAt: new Date().toISOString(),
          };
          set((state) => ({
            appointments: [...state.appointments, newAppointment],
            isLoading: false,
          }));
        } catch (err) {
          set({ error: 'Erreur lors de l\'ajout du rendez-vous', isLoading: false });
        }
      },

      updateAppointment: async (id, data) => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));
          set((state) => ({
            appointments: state.appointments.map((a) =>
              a.id === id ? { ...a, ...data } : a
            ),
            isLoading: false,
          }));
        } catch (err) {
          set({ error: 'Erreur lors de la mise à jour', isLoading: false });
        }
      },

      cancelAppointment: async (id) => {
        await get().updateAppointment(id, { status: 'cancelled' });
      },

      getAppointmentById: (id) => {
        return get().appointments.find((a) => a.id === id);
      },

      getAppointmentsByDate: (date) => {
        return get().appointments.filter((a) => a.date === date);
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'ixshelco-appointments',
    }
  )
);