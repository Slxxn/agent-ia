import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onLoginClick }) => {
  const { register, loginWithGoogle, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await register({ name, email, password });
    if (ok) onSuccess?.();
  };

  const handleGoogle = async () => {
    const ok = await loginWithGoogle();
    if (ok) onSuccess?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="w-full"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#1a1412] mb-1">Créer un compte</h2>
        <p className="text-sm text-[#8a7f7a]">Rejoignez IXSHEL&CO.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button type="button" onClick={clearError} className="ml-auto text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#e5e2df] rounded-xl bg-white hover:bg-[#f8f8f7] transition-colors text-sm font-medium text-[#1a1412] mb-4"
      >
        <GoogleIcon />
        Continuer avec Google
      </button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#e5e2df]" /></div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-[#8a7f7a]">ou</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7f7a]" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre prénom"
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#e5e2df] rounded-xl text-[#1a1412] placeholder-[#8a7f7a] focus:outline-none focus:ring-2 focus:ring-[#550b14]/20 focus:border-[#550b14] transition-all text-sm"
            required
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7f7a]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#e5e2df] rounded-xl text-[#1a1412] placeholder-[#8a7f7a] focus:outline-none focus:ring-2 focus:ring-[#550b14]/20 focus:border-[#550b14] transition-all text-sm"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7f7a]" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe (6 caractères min.)"
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#e5e2df] rounded-xl text-[#1a1412] placeholder-[#8a7f7a] focus:outline-none focus:ring-2 focus:ring-[#550b14]/20 focus:border-[#550b14] transition-all text-sm"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#550b14] text-white rounded-xl font-semibold text-sm hover:bg-[#440910] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Création...</> : 'Créer mon compte'}
        </button>
      </form>

      <p className="text-center text-sm text-[#8a7f7a] mt-4">
        Déjà inscrit ?{' '}
        <button type="button" onClick={onLoginClick} className="text-[#550b14] font-medium hover:text-[#7e6961]">
          Se connecter
        </button>
      </p>
    </motion.div>
  );
};

export default RegisterForm;
