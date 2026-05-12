import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  deleteUser,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const ADMIN_EMAILS = ['sloan.dlrz@gmail.com'];

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'admin';
}

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  init: () => () => void;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (params: { name: string; email: string; password: string; phone?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
  clearError: () => void;
  deleteAccount: () => Promise<void>;
}

function firebaseErrorToFrench(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
      return 'Aucun compte trouvé avec cet email.';
    case 'auth/wrong-password':
      return 'Mot de passe incorrect.';
    case 'auth/invalid-credential':
      return 'Email ou mot de passe incorrect.';
    case 'auth/email-already-in-use':
      return 'Cet email est déjà utilisé.';
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    case 'auth/invalid-email':
      return 'Adresse email invalide.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessayez dans quelques minutes.';
    case 'auth/network-request-failed':
      return 'Erreur réseau. Vérifiez votre connexion.';
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé.';
    default:
      return 'Une erreur est survenue. Veuillez réessayer.';
  }
}

function toAuthUser(firebaseUser: { uid: string; email: string | null; displayName: string | null }): AuthUser {
  const email = firebaseUser.email ?? '';
  return {
    id: firebaseUser.uid,
    email,
    name: firebaseUser.displayName ?? email.split('@')[0],
    role: ADMIN_EMAILS.includes(email) ? 'admin' : 'client',
  };
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  init: () => {
    // Handle redirect result from Google sign-in
    getRedirectResult(auth).catch(() => {});
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        set({ user: toAuthUser(firebaseUser), isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    });
    return unsubscribe;
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const provider = new GoogleAuthProvider();
      // Try popup first, fall back to redirect on mobile or blocked popups
      try {
        await signInWithPopup(auth, provider);
      } catch (popupErr: unknown) {
        const code = (popupErr as { code?: string }).code ?? '';
        if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
          await signInWithRedirect(auth, provider);
          return true;
        }
        throw popupErr;
      }
      set({ isLoading: false });
      return true;
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      set({ isLoading: false, error: firebaseErrorToFrench(code) });
      return false;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      set({ isLoading: false });
      return true;
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      set({ isLoading: false, error: firebaseErrorToFrench(code) });
      return false;
    }
  },

  register: async ({ name, email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      set({ isLoading: false });
      return true;
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      set({ isLoading: false, error: firebaseErrorToFrench(code) });
      return false;
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...userData } });
    }
  },

  clearError: () => set({ error: null }),

  deleteAccount: async () => {
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
      set({ user: null, isAuthenticated: false });
    }
  },
}));

export const useAuth = useAuthStore;
export const useAuthContext = useAuthStore;
