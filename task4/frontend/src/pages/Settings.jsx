import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings as SettingsIcon, 
  LogOut, 
  User, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  Check, 
  Info,
  Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Settings() {
  const { user, logout, updateUserSettings } = useAuth();
  
  // Settings Local States
  const [blockedDomains, setBlockedDomains] = useState([]);
  const [newDomain, setNewDomain] = useState("");
  const [pomodoroDuration, setPomodoroDuration] = useState(25);
  const [saveStatus, setSaveStatus] = useState(""); // "" | "saving" | "success" | "error"

  const navigate = useNavigate();

  // Load user settings on mount
  useEffect(() => {
    if (user && user.settings) {
      setBlockedDomains(user.settings.blockedDomains || []);
      setPomodoroDuration(user.settings.pomodoroDuration || 25);
    }
  }, [user]);

  const handleAddDomain = (e) => {
    e.preventDefault();
    const cleanDomain = newDomain.trim().toLowerCase();
    if (!cleanDomain) return;

    // Check formatting
    if (cleanDomain.includes("/") || cleanDomain.includes("http")) {
      alert("Please enter a base domain only (e.g. facebook.com, not http://facebook.com/)");
      return;
    }

    if (!blockedDomains.includes(cleanDomain)) {
      const updatedList = [...blockedDomains, cleanDomain];
      setBlockedDomains(updatedList);
      setNewDomain("");
      autoSaveSettings(updatedList, pomodoroDuration);
    }
  };

  const handleRemoveDomain = (domainToRemove) => {
    const updatedList = blockedDomains.filter(d => d !== domainToRemove);
    setBlockedDomains(updatedList);
    autoSaveSettings(updatedList, pomodoroDuration);
  };

  const handlePomoChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      setPomodoroDuration(val);
      autoSaveSettings(blockedDomains, val);
    }
  };

  const autoSaveSettings = async (domains, pomoDur) => {
    setSaveStatus("saving");
    try {
      await updateUserSettings({
        blockedDomains: domains,
        pomodoroDuration: pomoDur
      });
      
      // Update browser local chrome.storage if extension linked
      if (window.chrome && window.chrome.storage) {
        window.chrome.storage.local.set({
          settings: {
            blockedDomains: domains,
            pomodoroDuration: pomoDur
          }
        });
      }

      setSaveStatus("success");
      setTimeout(() => setSaveStatus(""), 2500);
    } catch (error) {
      console.error("[Settings Page] Save failed:", error.message);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-slateDark-bg font-outfit text-slate-100">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slateDark-border bg-slate-950/80 backdrop-blur-xl flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 font-bold text-xl text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-focusFlow-indigo to-focusFlow-purple flex items-center justify-center text-white text-base">
              ⚡
            </div>
            <span>FocusFlow</span>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slateDark-muted hover:text-white font-semibold hover:bg-slate-800/30 border border-transparent transition-all">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
            <Link to="/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slateDark-muted hover:text-white font-semibold hover:bg-slate-800/30 border border-transparent transition-all">
              <BarChart3 size={18} />
              <span>Weekly Reports</span>
            </Link>
            <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-500/10 text-focusFlow-indigo font-bold border border-indigo-500/15">
              <SettingsIcon size={18} />
              <span>Blocker & Rules</span>
            </Link>
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2 py-1.5 border-t border-slateDark-border pt-4">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
              <User size={16} />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate leading-none mb-1">{user?.username || "Developer"}</p>
              <p className="text-[10px] font-medium text-slateDark-muted truncate">{user?.email || "user@domain.com"}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 font-bold hover:bg-red-500/10 border border-transparent hover:border-red-500/15 transition-all"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-grow p-8 max-w-4xl overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 border-b border-slateDark-border pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none">Blocker & Custom Rules</h1>
            <p className="text-slateDark-muted font-medium text-sm mt-1.5">Configure forbidden domains, Pomodoro times, and category thresholds.</p>
          </div>

          {/* Autosave Alert Toasts */}
          <div className="text-xs font-semibold">
            {saveStatus === "saving" && (
              <span className="text-indigo-400 flex items-center gap-1.5 bg-indigo-500/5 px-3 py-1.5 rounded-lg border border-indigo-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                Saving settings...
              </span>
            )}
            {saveStatus === "success" && (
              <span className="text-emerald-400 flex items-center gap-1.5 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                <Check size={14} />
                Settings saved!
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-red-400 flex items-center gap-1.5 bg-red-500/5 px-3 py-1.5 rounded-lg border border-red-500/10">
                <ShieldAlert size={14} />
                Failed to sync settings.
              </span>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Right panel setting presets */}
          <div className="space-y-6 md:col-span-1">
            {/* Pomodoro Preset Card */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-1.5">
                <Sliders size={16} className="text-focusFlow-indigo" />
                <span>Timer Presets</span>
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-slateDark-muted uppercase tracking-wider mb-2">Focus Block (Mins)</label>
                <input 
                  type="number"
                  min="1"
                  max="120"
                  value={pomodoroDuration}
                  onChange={handlePomoChange}
                  className="w-full bg-slate-950/60 border border-slateDark-border text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-focusFlow-indigo font-bold text-sm"
                />
                <span className="block text-[10px] text-slateDark-muted font-semibold mt-2 leading-relaxed">
                  Adjusts the default duration for deep focus pomodoro clocks.
                </span>
              </div>
            </div>

            {/* Sync Guide Widget */}
            <div className="glass-panel p-6 rounded-2xl bg-indigo-500/5 border-indigo-500/10">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Info size={14} />
                <span>Sync with Extension</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rules saved here are instantly broadcasted to your Chrome Extension background service-worker interceptors. Make sure you are logged in to the extension!
              </p>
            </div>
          </div>

          {/* Left panel Block Domains list */}
          <div className="glass-panel p-6 rounded-2xl md:col-span-2">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-1.5">
              <ShieldAlert size={16} className="text-focusFlow-unproductive" />
              <span>Blocked Distracting Domains</span>
            </h3>

            {/* Add Domain Form */}
            <form onSubmit={handleAddDomain} className="flex gap-2 mb-6">
              <input 
                type="text"
                placeholder="domainName.com (e.g. facebook.com)"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="flex-grow bg-slate-950/60 border border-slateDark-border text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-focusFlow-indigo text-sm font-semibold transition-colors"
              />
              <button 
                type="submit"
                className="p-3 bg-gradient-to-r from-focusFlow-indigo to-focusFlow-purple hover:shadow-lg text-white rounded-xl active:scale-95 transition-all duration-200"
              >
                <Plus size={16} />
              </button>
            </form>

            {/* Domains Render List */}
            {blockedDomains.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slateDark-border rounded-xl">
                <p className="text-xs text-slateDark-muted font-bold">Your blocked list is currently empty.</p>
                <p className="text-[10px] text-slateDark-muted/80 mt-1">Add social media or entertainment websites to maintain focus.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                <AnimatePresence>
                  {blockedDomains.map((domain, idx) => (
                    <motion.div 
                      key={domain}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex justify-between items-center bg-slate-950/40 border border-slateDark-border p-3 rounded-xl hover:bg-slate-800/10 transition-colors"
                    >
                      <span className="text-sm font-semibold text-white">{domain}</span>
                      <button 
                        onClick={() => handleRemoveDomain(domain)}
                        className="p-1.5 text-slateDark-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
