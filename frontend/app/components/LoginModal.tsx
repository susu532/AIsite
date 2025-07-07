
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setError("");
    onLogin(username, password);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-gradient-to-br from-white via-purple-50 to-blue-100 rounded-3xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center border border-purple-200"
            initial={{ scale: 0.85, y: -40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-purple-600 text-2xl font-bold focus:outline-none"
              onClick={onClose}
              aria-label="Fermer"
            >
              &times;
            </button>
            <div className="flex flex-col items-center mb-4">
              <div className="bg-gradient-to-r from-purple-400 to-blue-400 rounded-full p-3 mb-2 shadow-lg">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="12" fill="#a78bfa" />
                  <text x="12" y="17" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">🔒</text>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Connexion</h2>
              <p className="text-gray-500 text-sm text-center">Accédez à votre compte StageAI</p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full mt-2">
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                className="px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition bg-white"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
              />
              <input
                type="password"
                placeholder="Mot de passe"
                className="px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition bg-white"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              <motion.button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-2 rounded-lg shadow-md transition-all duration-200 mt-2"
                whileTap={{ scale: 0.97 }}
              >
                Se connecter
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
