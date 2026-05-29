import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import CategoryPie from "../components/CategoryPie";
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  LogOut, 
  User, 
  Printer, 
  TrendingUp, 
  AlertTriangle,
  Award,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";

export default function Reports() {
  const { user, logout } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const loadReport = async () => {
    try {
      const reportData = await api.getWeeklyReport();
      setReport(reportData);
    } catch (err) {
      console.error("[Reports] Load failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const handlePrint = () => {
    window.print();
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
          <p className="text-sm font-semibold text-slateDark-muted">Syncing reports...</p>
        </div>
      </div>
    );
  }

  const formattedWeeklySum = report ? Math.round((report.totalDuration / 3600) * 10) / 10 : 0;

  return (
    <div className="min-h-screen flex bg-slateDark-bg font-outfit text-slate-100 print:bg-white print:text-black">
      
      {/* Sidebar Navigation - Hide during Print */}
      <aside className="w-64 border-r border-slateDark-border bg-slate-950/80 backdrop-blur-xl flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0 print:hidden">
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
            <Link to="/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-500/10 text-focusFlow-indigo font-bold border border-indigo-500/15">
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
      <main className="flex-grow p-8 max-w-5xl overflow-y-auto print:p-0 print:overflow-visible">
        
        {/* Printable Report Header */}
        <header className="flex justify-between items-center mb-8 border-b border-slateDark-border pb-6 print:pb-4 print:border-black/10">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none print:text-black">Weekly Focus Evaluation</h1>
            <p className="text-slateDark-muted font-medium text-sm mt-1.5 print:text-black/60 flex items-center gap-1.5">
              <Calendar size={14} />
              <span>Reviewing last 7 days of browser analytics.</span>
            </p>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-focusFlow-indigo to-focusFlow-purple hover:shadow-lg hover:shadow-focusFlow-indigo/10 text-white rounded-xl text-sm font-bold active:scale-98 transition-all print:hidden"
          >
            <Printer size={16} />
            <span>Export Report PDF</span>
          </button>
        </header>

        {report && (
          <div className="space-y-8">
            
            {/* Highlights Deck */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
              <div className="glass-panel p-6 rounded-2xl border border-slate-700/20 print:border-black/10 print:bg-slate-50">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-slateDark-muted text-xs font-bold uppercase tracking-wider print:text-black/60">Weekly Tracking</span>
                  <Award size={18} className="text-focusFlow-indigo" />
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight print:text-black">{formattedWeeklySum} hrs</h2>
                <p className="text-xs text-slateDark-muted font-semibold mt-1 print:text-black/60">Accumulated browser activity</p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-slate-700/20 print:border-black/10 print:bg-slate-50">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-slateDark-muted text-xs font-bold uppercase tracking-wider print:text-black/60">Productive Target</span>
                  <TrendingUp size={18} className="text-focusFlow-productive" />
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight print:text-black">{report.focusScore}%</h2>
                <p className="text-xs text-slateDark-muted font-semibold mt-1 print:text-black/60">Average deep focus score</p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-slate-700/20 print:border-black/10 print:bg-slate-50">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-slateDark-muted text-xs font-bold uppercase tracking-wider print:text-black/60">Top Disruption</span>
                  <AlertTriangle size={18} className="text-focusFlow-unproductive" />
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight print:text-black">{formatDuration(report.totalUnprod)}</h2>
                <p className="text-xs text-slateDark-muted font-semibold mt-1 print:text-black/60">Total unproductive duration</p>
              </div>
            </section>

            {/* Performance Layout */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
              {/* Category donut distribution */}
              <div className="glass-panel p-6 rounded-2xl print:bg-slate-50">
                <h3 className="text-base font-bold text-white mb-4 print:text-black">Time Allocation By Category</h3>
                <CategoryPie 
                  productive={report.totalProd} 
                  unproductive={report.totalUnprod} 
                  neutral={report.totalDuration - (report.totalProd + report.totalUnprod)} 
                />
              </div>

              {/* Statistics Details */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between print:bg-slate-50">
                <div>
                  <h3 className="text-base font-bold text-white mb-4 print:text-black">Productivity Benchmarks</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800/40 pb-2 print:border-black/10">
                      <span className="text-sm font-semibold text-slateDark-muted print:text-black/70">Most Productive Day</span>
                      <span className="text-sm font-bold text-white print:text-black">{report.mostProductiveDay}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-slate-800/40 pb-2 print:border-black/10">
                      <span className="text-sm font-semibold text-slateDark-muted print:text-black/70">Least Focused Day</span>
                      <span className="text-sm font-bold text-white print:text-black">{report.leastProductiveDay}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2">
                      <span className="text-sm font-semibold text-slateDark-muted print:text-black/70">Total Focused Time</span>
                      <span className="text-sm font-bold text-focusFlow-productive">{formatDuration(report.totalProd)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs font-medium text-slate-300 leading-relaxed print:bg-slate-100 print:text-black print:border-none">
                  <span className="font-bold text-indigo-400 block mb-1">FocusFlow Recommendation:</span>
                  Your most focused day was <span className="font-bold text-white print:text-black">{report.mostProductiveDay}</span>. Protect your schedule on <span className="font-bold text-white print:text-black">{report.leastProductiveDay}</span> next week by organizing your most difficult cognitive tasks then!
                </div>
              </div>
            </section>

            {/* AI suggestion Block - full width */}
            <section className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-slate-900/60 to-slate-950/60 border-slateDark-border print:bg-slate-100 print:border-none">
              <h3 className="text-base font-bold text-white mb-2 print:text-black flex items-center gap-1.5">
                <span>AI Productivity Assessment</span>
              </h3>
              <p className="text-sm font-medium text-slate-300 leading-relaxed print:text-black/80">
                {report.aiSuggestions}
              </p>
            </section>

          </div>
        )}

      </main>
    </div>
  );
}
