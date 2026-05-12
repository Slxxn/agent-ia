import { create } from 'zustand';
import type { Service } from '@/lib/theme';

export interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

interface BookingState {
  selectedServices: Service[];
  selectedDate: string | null;
  selectedTime: string | null;
  clientInfo: ClientInfo;
  step: number;
  totalDuration: number;
  totalPrice: number;
  addService: (service: Service) => void;
  removeService: (serviceId: string) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setClientInfo: (info: Partial<ClientInfo>) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  recalcTotals: () => void;
}

const initialState = {
  selectedServices: [] as Service[],
  selectedDate: null as string | null,
  selectedTime: null as string | null,
  clientInfo: { name: '', email: '', phone: '', notes: '' },
  step: 0,
  totalDuration: 0,
  totalPrice: 0,
};

export const useBookingStore = create<BookingState>((set, get) => ({
  ...initialState,

  addService: (service) => {
    set((state) => {
      if (state.selectedServices.find((s) => s.id === service.id)) {
        return state;
      }
      const services = [...state.selectedServices, service];
      const totalDuration = services.reduce((acc, s) => acc + s.duration, 0);
      const totalPrice = services.reduce((acc, s) => acc + s.price, 0);
      return { selectedServices: services, totalDuration, totalPrice };
    });
  },

  removeService: (serviceId) => {
    set((state) => {
      const services = state.selectedServices.filter((s) => s.id !== serviceId);
      const totalDuration = services.reduce((acc, s) => acc + s.duration, 0);
      const totalPrice = services.reduce((acc, s) => acc + s.price, 0);
      return { selectedServices: services, totalDuration, totalPrice };
    });
  },

  setDate: (date) => set({ selectedDate: date }),

  setTime: (time) => set({ selectedTime: time }),

  setClientInfo: (info) =>
    set((state) => ({
      clientInfo: { ...state.clientInfo, ...info },
    })),

  setStep: (step) => set({ step }),

  nextStep: () => {
    const { step } = get();
    if (step < 3) set({ step: step + 1 });
  },

  prevStep: () => {
    const { step } = get();
    if (step > 0) set({ step: step - 1 });
  },

  reset: () => set(initialState),

  recalcTotals: () => {
    const services = get().selectedServices;
    const totalDuration = services.reduce((acc, s) => acc + s.duration, 0);
    const totalPrice = services.reduce((acc, s) => acc + s.price, 0);
    set({ totalDuration, totalPrice });
  },
}));