// NOTE: Requires 'framer-motion'. Install with: npm install framer-motion
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type AuthStatus = "idle" | "logged_in" | "logged_out" | "error";

export default function Home() {
  // Auth state
  const [authStatus, setAuthStatus] = useState<AuthStatus>("idle");
  const [authMessage, setAuthMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const [backendMessage, setBackendMessage] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/")
      .then((res) => res.text())
      .then((data) => setBackendMessage(data))
      .catch(() => setBackendMessage("Erreur de connexion au backend"));
    // Optionally, check session here
    // setAuthStatus("logged_out");
  }, []);
  // Auth handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage("");
    try {
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuthStatus("logged_in");
        setAuthMessage("Connecté !");
        setShowLogin(false);
      } else {
        setAuthStatus("error");
        setAuthMessage(data.error || "Erreur de connexion");
      }
    } catch {
      setAuthStatus("error");
      setAuthMessage("Erreur de connexion au serveur");
    }
  };

  const handleLogout = async () => {
    setAuthMessage("");
    try {
      const res = await fetch("http://127.0.0.1:5000/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setAuthStatus("logged_out");
        setAuthMessage("Déconnecté.");
      } else {
        setAuthStatus("error");
        setAuthMessage(data.error || "Erreur de déconnexion");
      }
    } catch {
      setAuthStatus("error");
      setAuthMessage("Erreur de connexion au serveur");
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedText("");
    try {
      const res = await fetch("http://127.0.0.1:5000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setGeneratedText(data.generated_text);
    } catch {
      setGeneratedText("Erreur lors de la génération.");
    }
    setLoading(false);
  };

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingImage(true);
    setGeneratedImage("");
    try {
      const res = await fetch("http://127.0.0.1:5000/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      const data = await res.json();
      setGeneratedImage(data.image_url);
    } catch {
      setGeneratedImage("");
    }
    setLoadingImage(false);
  };

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMessage = { role: "user", content: chatInput };
    setChatHistory((prev) => [...prev, userMessage]);
    setChatLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput }),
      });
      const data = await res.json();
      if (data.reply) {
        setChatHistory((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setChatHistory((prev) => [...prev, { role: "assistant", content: "Erreur de l'IA." }]);
      }
    } catch {
      setChatHistory((prev) => [...prev, { role: "assistant", content: "Erreur de connexion." }]);
    }
    setChatInput("");
    setChatLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400 flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      <main className="w-full max-w-3xl mx-auto flex flex-col items-center gap-8">
        {/* Auth UI */}
        <div className="w-full flex flex-col items-end mb-4">
          {authStatus === "logged_in" ? (
            <div className="flex items-center gap-4">
              <span className="text-green-700 font-semibold">Connecté</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin((v) => !v)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
            >
              {showLogin ? "Fermer" : "Connexion"}
            </button>
          )}
          {authMessage && (
            <div className={`mt-2 text-sm ${authStatus === "error" ? "text-red-600" : "text-green-600"}`}>{authMessage}</div>
          )}
        </div>
        {showLogin && authStatus !== "logged_in" && (
          <form onSubmit={handleLogin} className="w-full max-w-xs bg-white/90 p-4 rounded-xl shadow flex flex-col gap-3 mb-6">
            <label className="font-semibold">Nom d'utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border px-2 py-1 rounded"
              required
            />
            <label className="font-semibold">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border px-2 py-1 rounded"
              required
            />
            <button type="submit" className="bg-purple-600 text-white rounded px-3 py-1 mt-2 hover:bg-purple-700 transition">Se connecter</button>
          </form>
        )}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="flex flex-col items-center gap-2"
        >
         {/* ...existing code... */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg bg-gradient-to-r from-white via-fuchsia-300 to-yellow-200 bg-clip-text text-transparent">
            StageAI Playground
          </h1>
          <p className="text-lg text-white/90 font-medium">
            Expérimentez la génération IA de texte et d'images avec style.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full"
        >
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-6 flex flex-col gap-4 border border-white/30">
            <strong className="text-purple-700 text-lg flex items-center gap-2">
              <svg
                width="22"
                height="22"
                fill="none"
                viewBox="0 0 24 24"
                className="flex-shrink-0"
              >
                <circle cx="12" cy="12" r="10" fill="#a78bfa" />
                <text
                  x="12"
                  y="16"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#fff"
                  fontWeight="bold"
                >
                  AI
                </text>
              </svg>
              Message du backend&nbsp;:
            </strong>
            <span className="text-gray-700">{backendMessage}</span>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8 w-full">
          {/* Text Generation Card */}
          <motion.form
            onSubmit={handleGenerate}
            className="flex-1 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 flex flex-col gap-4 border border-white/30"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <label htmlFor="prompt" className="font-semibold text-purple-700">
              Prompt pour génération IA&nbsp;:
            </label>
            <input
              id="prompt"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="border-2 border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              placeholder="Décrivez le contenu à générer..."
              required
            />
            <motion.button
              type="submit"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg px-6 py-2 mt-2 shadow-lg hover:scale-105 hover:from-pink-500 hover:to-purple-500 transition-all duration-200"
              disabled={loading}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Génération...
                </span>
              ) : (
                "Générer le texte"
              )}
            </motion.button>
            <AnimatePresence>
              {generatedText && (
                <motion.div
                  className="mt-4 p-4 border rounded-xl bg-green-50 text-green-800 w-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <strong className="block mb-2 text-green-700">
                    Texte généré&nbsp;:
                  </strong>
                  <span className="whitespace-pre-line">{generatedText}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>

          {/* Image Generation Card */}
          <motion.form
            onSubmit={handleGenerateImage}
            className="flex-1 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 flex flex-col gap-4 border border-white/30"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <label htmlFor="imagePrompt" className="font-semibold text-pink-700">
              Prompt pour génération d'image IA&nbsp;:
            </label>
            <input
              id="imagePrompt"
              type="text"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="border-2 border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              placeholder="Décrivez l'image à générer..."
              required
            />
            <motion.button
              type="submit"
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-lg px-6 py-2 mt-2 shadow-lg hover:scale-105 hover:from-purple-500 hover:to-pink-500 transition-all duration-200"
              disabled={loadingImage}
              whileTap={{ scale: 0.95 }}
            >
              {loadingImage ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Génération...
                </span>
              ) : (
                "Générer l'image"
              )}
            </motion.button>
            <AnimatePresence>
              {generatedImage && (
                <motion.div
                  className="mt-4 p-4 border rounded-xl bg-purple-50 text-purple-800 w-full flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <strong className="block mb-2 text-purple-700">
                    Image générée&nbsp;:
                  </strong>
                  <img
                    src={`http://127.0.0.1:5000${generatedImage}`}
                    alt="Générée par IA"
                    className="mt-2 max-w-full h-auto border rounded-xl shadow-lg"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
        </div>

        {/* Simple AI Chat UI */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 flex flex-col gap-4 border border-white/30 mb-8"
        >
          <strong className="text-blue-700 text-lg mb-2">Chat IA (GPT-3.5)</strong>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-2">
            {chatHistory.length === 0 && (
              <span className="text-gray-400">Commencez la conversation...</span>
            )}
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`px-3 py-2 rounded-xl max-w-[80%] ${msg.role === "user" ? "self-end bg-blue-100 text-blue-900" : "self-start bg-gray-100 text-gray-800"}`}>
                <span className="font-semibold mr-2">{msg.role === "user" ? "Vous" : "IA"}:</span>
                <span>{msg.content}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleChatSend} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 border-2 border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Écrivez un message..."
              disabled={chatLoading}
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white font-bold rounded-lg px-4 py-2 shadow-lg hover:bg-blue-600 transition-all duration-200"
              disabled={chatLoading}
            >
              {chatLoading ? "..." : "Envoyer"}
            </button>
          </form>
        </motion.div>

        <motion.footer
          className="w-full flex flex-col sm:flex-row gap-4 items-center justify-center mt-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
        >
         
        
        </motion.footer>
      </main>
    </div>
  );
}
