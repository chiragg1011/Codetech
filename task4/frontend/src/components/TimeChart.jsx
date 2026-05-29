import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function TimeChart({ data }) {
  // Format seconds to hours
  const formatSecondsToHours = (seconds) => {
    return Math.round((seconds / 3600) * 10) / 10;
  };

  // Convert raw seconds in data to hours for graphing
  const formattedData = data.map(item => ({
    day: item.day.substring(0, 3), // e.g. "Monday" -> "Mon"
    "Productive Hrs": formatSecondsToHours(item.productive),
    "Unproductive Hrs": formatSecondsToHours(item.unproductive),
    "Neutral Hrs": formatSecondsToHours(item.neutral)
  }));

  // Custom tooltips matching SaaS glassmorphism
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-slateDark-border backdrop-blur-xl p-4 rounded-xl shadow-2xl">
          <p className="text-sm font-bold text-white mb-2">{label} Analytics</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs font-semibold py-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slateDark-muted">{entry.name}:</span>
              <span className="text-white">{entry.value} hrs</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-100 h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
          <XAxis 
            dataKey="day" 
            stroke="#64748b" 
            fontSize={12} 
            fontWeight={600}
            tickLine={false} 
            axisLine={false}
            dy={8}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12} 
            fontWeight={600}
            tickLine={false} 
            axisLine={false} 
            dx={-8}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.02)" }} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingBottom: 15 }}
          />
          <Bar dataKey="Productive Hrs" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Neutral Hrs" stackId="a" fill="#94a3b8" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Unproductive Hrs" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
