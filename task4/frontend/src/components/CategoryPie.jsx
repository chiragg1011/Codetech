import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function CategoryPie({ productive, unproductive, neutral }) {
  const total = productive + unproductive + neutral;

  const data = [
    { name: "Productive", value: Math.round((productive / 3600) * 10) / 10, color: "#10b981" },
    { name: "Neutral", value: Math.round((neutral / 3600) * 10) / 10, color: "#94a3b8" },
    { name: "Unproductive", value: Math.round((unproductive / 3600) * 10) / 10, color: "#ef4444" }
  ].filter(item => item.value > 0);

  // If no data exists, load default blank state to look premium
  const emptyData = [{ name: "No Tracked Time", value: 1, color: "rgba(255, 255, 255, 0.05)" }];
  const dataToRender = data.length > 0 ? data : emptyData;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-slateDark-border backdrop-blur-xl px-3 py-2 rounded-lg shadow-2xl">
          <p className="text-xs font-bold text-white">
            {payload[0].name}: <span className="text-indigo-400">{payload[0].value} hrs</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-100 h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataToRender}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {dataToRender.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            iconSize={6}
            wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 10 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
