import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Flame } from "lucide-react";

export default function PomoTimer() {
  const [status, setStatus] = useState("idle"); // "idle" | "focus" | "break"
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [duration, setDuration] = useState(25 * 60);

  const timerRef = useRef(null);

  useEffect(() => {
    if (status !== "idle") {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            triggerAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [status]);

  const triggerAlarm = () => {
    // Show standard browser HTML5 notification
    if (Notification.permission === "granted") {
      new Notification(status === "focus" ? "Focus Completed!" : "Break Finished!", {
        body: status === "focus" 
          ? "Amazing job! Take a well-deserved 5-minute break." 
          : "Ready to dive back in? Let's start another focus block!",
        icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>"
      });
    }

    // Toggle status
    if (status === "focus") {
      setStatus("break");
      setDuration(5 * 60);
      setTimeLeft(5 * 60);
    } else {
      setStatus("idle");
      setDuration(25 * 60);
      setTimeLeft(25 * 60);
    }
  };

  const handleStartPause = () => {
    if (status === "idle") {
      // Request HTML5 Notifications permission
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
      setStatus("focus");
    } else if (status === "focus" || status === "break") {
      setStatus("idle");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setDuration(25 * 60);
    setTimeLeft(25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Circle loader params
  const strokeDasharray = 2 * Math.PI * 52; // r = 52
  const strokeDashoffset = strokeDasharray - (timeLeft / duration) * strokeDasharray;

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slateDark-muted uppercase tracking-wider mb-4">
        <Flame size={14} className="text-orange-500 animate-pulse" />
        <span>Deep Focus Timer</span>
      </div>

      {/* Visual Circle Gauge */}
      <div className="relative w-36 h-36 flex items-center justify-center mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="72" cy="72" r="52" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="6" fill="none" />
          <circle 
            cx="72" 
            cy="72" 
            r="52" 
            stroke={status === "break" ? "#10b981" : "url(#pomoGradient)"} 
            strokeWidth="6" 
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            fill="none" 
            style={{ transition: "stroke-dashoffset 0.4s ease" }}
          />
          <defs>
            <linearGradient id="pomoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase font-bold text-slateDark-muted tracking-wider mt-0.5">
            {status === "focus" ? "Focus" : status === "break" ? "Break" : "Pomodoro"}
          </span>
        </div>
      </div>

      {/* Controls Deck */}
      <div className="flex gap-2">
        <button 
          onClick={handleStartPause}
          className="p-3 bg-gradient-to-r from-focusFlow-indigo to-focusFlow-purple text-white rounded-xl shadow-lg shadow-focusFlow-indigo/10 hover:shadow-focusFlow-indigo/25 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          {status !== "idle" ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button 
          onClick={handleReset}
          className="p-3 bg-slate-800/60 border border-slateDark-border text-slateDark-muted hover:text-white rounded-xl hover:bg-slate-700/40 active:scale-95 transition-all duration-200"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
