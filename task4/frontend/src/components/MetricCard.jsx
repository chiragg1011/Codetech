import React from "react";
import { motion } from "framer-motion";

export default function MetricCard({ title, value, subtitle, icon: Icon, colorClass = "text-indigo-400" }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden"
    >
      {/* Background Decorative Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-full pointer-events-none" />

      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slateDark-muted text-sm font-semibold uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold mt-1 text-white tracking-tight leading-none">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 ${colorClass}`}>
          <Icon size={20} />
        </div>
      </div>
      
      {subtitle && (
        <p className="text-xs text-slateDark-muted font-medium mt-2 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
