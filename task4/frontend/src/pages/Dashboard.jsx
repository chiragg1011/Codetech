import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import MetricCard from "../components/MetricCard";
import TimeChart from "../components/TimeChart";
import CategoryPie from "../components/CategoryPie";
import PomoTimer from "../components/PomoTimer";
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  LogOut, 
  Clock, 
  Activity, 
  ShieldAlert, 
  Globe, 
  Cpu, 
  HelpCircle,
  TrendingUp,
  User
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ totalTime: 0, productiveTime: 0, unproductiveTime: 0, neutralTime: 0, focusScore: 100, topDomains: [] });
  const [report, setReport] = useState({ dailyAnalytics: [], aiSuggestions: "Fetching deep focus reports..." });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      const statsData = await api.getStats();
      const reportData = await api.getWeeklyReport();
      const rawActivities = await api.getActivities();
      
      setStats(statsData);
      setReport(reportData);
      setActivities(rawActivities);
    } catch (err) {
      console.error("[Dashboard] Load failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatDuration = (seconds) => {
    if (seconds === 0) return "0s";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slateDark-bg text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slateDark-muted">Syncing focus analytics...</p>
        </div>
      </div>
    );
  }

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
            <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">FocusFlow</span>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-500/10 text-focusFlow-indigo font-bold border border-indigo-500/15">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
            <Link to="/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slateDark-muted hover:text-white font-semibold hover:bg-slate-800/30 border border-transparent transition-all">
              <BarChart3 size={18} />
              <span>Weekly Reports</span>
            </Link>
            <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slateDark-muted hover:text-white font-semibold hover:bg-slate-800/30 border border-transparent transition-all">
              <Settings size={18} />
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
      <main className="flex-grow p-8 max-w-7xl overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none">Focus Analytics Workspace</h1>
            <p className="text-slateDark-muted font-medium text-sm mt-1.5">Monitor, catalog, and control browser productivity logs in real-time.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-slateDark-border rounded-xl text-xs font-bold text-slate-300">
            <div className="w-2 h-2 rounded-full bg-focusFlow-productive animate-pulse"></div>
            <span>Extension Linked</span>
          </div>
        </header>

        {/* KPI Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            title="Focus Hours" 
            value={`${Math.round((stats.productiveTime / 3600) * 10) / 10}h`}
            subtitle="Deep learning sessions active" 
            icon={Clock} 
            colorClass="text-indigo-400"
          />
          <MetricCard 
            title="Focus Score" 
            value={`${stats.focusScore}%`}
            subtitle="Rating target: > 75%" 
            icon={TrendingUp} 
            colorClass={stats.focusScore >= 75 ? "text-emerald-400" : "text-amber-400"}
          />
          <MetricCard 
            title="Distractions Duration" 
            value={formatDuration(stats.unproductiveTime)}
            subtitle="Social media block intercepts" 
            icon={ShieldAlert} 
            colorClass="text-red-400"
          />
          <MetricCard 
            title="Primary Domain" 
            value={stats.topDomains.length > 0 ? stats.topDomains[0].domain : "None"}
            subtitle="Top tracked active domain" 
            icon={Globe} 
            colorClass="text-purple-400"
          />
        </section>

        {/* Charts & Pomodoro Deck */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Daily Analytics */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
            <h3 className="text-lg font-bold text-white mb-4">Weekly Category Distribution</h3>
            <TimeChart data={report.dailyAnalytics} />
          </div>

          {/* Pomodoro Timer */}
          <PomoTimer />
        </section>

        {/* AI & History Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Productivity Suggestions */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 text-focusFlow-indigo">
                <Cpu size={20} className="neon-glow-text" />
                <h3 className="text-lg font-bold text-white">AI Suggestion Deck</h3>
              </div>
              <p className="text-sm font-medium text-slate-300 leading-relaxed bg-slate-950/40 border border-slateDark-border p-4 rounded-xl">
                {report.aiSuggestions}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slateDark-muted font-bold">
              <HelpCircle size={14} />
              <span>Suggestions update automatically weekly.</span>
            </div>
          </div>

          {/* Top Domain Logs */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
            <h3 className="text-lg font-bold text-white mb-4">Tracked Domain History Logs</h3>
            
            {stats.topDomains.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slateDark-border rounded-2xl">
                <Activity size={32} className="text-slateDark-muted mx-auto mb-2 animate-bounce" />
                <h4 className="text-sm font-bold text-white">No active track records found</h4>
                <p className="text-xs text-slateDark-muted mt-1">Activities logged from Chrome will be rendered here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-medium">
                  <thead>
                    <tr className="text-slateDark-muted border-b border-slateDark-border text-xs uppercase font-bold">
                      <th className="pb-3">Website Domain</th>
                      <th className="pb-3">Rating Tag</th>
                      <th className="pb-3 text-right">Time Logged</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topDomains.map((item, idx) => {
                      // default tag classes
                      let tagClass = "bg-slate-800/60 text-slateDark-muted border-slate-700/40";
                      
                      // Match user customized domains categories in memory
                      let category = "neutral";
                      if (user?.settings?.categories && user.settings.categories[item.domain]) {
                        category = user.settings.categories[item.domain];
                      } else {
                        const productiveKeywords = ["github.com", "stackoverflow.com", "medium.com", "coursera.org", "w3schools.com", "docs.", "mdn", "localhost"];
                        const unproductiveKeywords = ["facebook.com", "youtube.com", "reddit.com", "twitter.com", "instagram.com", "netflix.com", "twitch.tv"];
                        
                        if (productiveKeywords.some(kw => item.domain.includes(kw))) category = "productive";
                        else if (unproductiveKeywords.some(kw => item.domain.includes(kw))) category = "unproductive";
                      }

                      if (category === "productive") tagClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/15";
                      else if (category === "unproductive") tagClass = "bg-red-500/10 text-red-400 border-red-500/15";

                      return (
                        <tr key={idx} className="border-b border-slate-800/40 hover:bg-slate-800/10 transition-colors">
                          <td className="py-3 font-semibold text-white">{item.domain}</td>
                          <td className="py-3">
                            <span className={`inline-block text-[10px] uppercase font-bold border px-2 py-0.5 rounded-md ${tagClass}`}>
                              {category}
                            </span>
                          </td>
                          <td className="py-3 text-right font-bold text-slate-300">{formatDuration(item.duration)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
