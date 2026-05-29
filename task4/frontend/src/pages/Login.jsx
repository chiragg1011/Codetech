import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Mail, Lock, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-height-screen min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full filter blur-[80px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-panel max-w-md w-full p-8 rounded-3xl relative overflow-hidden"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
            <Sparkles size={24} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="text-slateDark-muted text-sm mt-1.5 font-medium">Log in to check your deep focus metrics.</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2.5"
          >
            <ShieldAlert size={16} />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slateDark-muted uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slateDark-muted">
                <Mail size={16} />
              </span>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-slate-950/60 border border-slateDark-border text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-focusFlow-indigo text-sm font-medium transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slateDark-muted uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slateDark-muted">
                <Lock size={16} />
              </span>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/60 border border-slateDark-border text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-focusFlow-indigo text-sm font-medium transition-colors"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-focusFlow-indigo to-focusFlow-purple text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-focusFlow-indigo/20 active:scale-98 transition-all duration-200"
          >
            <span>{loading ? "Authenticating..." : "Sign In to FocusFlow"}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-slateDark-muted font-medium">
            New to FocusFlow?{" "}
            <Link to="/register" className="text-focusFlow-indigo hover:text-focusFlow-purple font-semibold hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
