import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'motion/react';

export default function Login() {
  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <div className="min-h-screen f4-gradient flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-10 rounded-3xl text-center"
      >
        <div className="w-20 h-20 bg-f4-gold rounded-2xl flex items-center justify-center font-bold text-f4-blue text-4xl mx-auto mb-8 shadow-xl shadow-f4-gold/20">
          F4
        </div>
        <h1 className="text-3xl font-bold text-f4-blue mb-2 tracking-tight">F4 PARTNERS</h1>
        <p className="text-slate-500 mb-10 font-medium">Sistema Operacional de Crescimento (MOC-F4)</p>
        
        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-f4-blue text-white p-4 rounded-2xl font-semibold hover:bg-f4-accent transition-all shadow-lg shadow-f4-blue/20"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          Entrar com Google
        </button>

        <p className="mt-8 text-xs text-slate-400 uppercase tracking-widest font-bold">
          Gestão com Independência e Propósito
        </p>
      </motion.div>
    </div>
  );
}
