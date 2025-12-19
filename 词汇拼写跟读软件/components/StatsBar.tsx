
import React, { useMemo } from 'react';
import { UserStats } from '../types';

interface StatsBarProps {
  stats: UserStats;
  currentIndex: number;
  totalCount: number;
}

const StatsBar: React.FC<StatsBarProps> = ({ stats, currentIndex, totalCount }) => {
  const timeDisplay = useMemo(() => {
    if (!stats.startTime) return "00:00";
    const diff = Math.floor((Date.now() - stats.startTime) / 1000);
    const mins = Math.floor(diff / 60).toString().padStart(2, '0');
    const secs = (diff % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }, [stats.startTime]);

  const items = [
    { label: "时间", value: timeDisplay, sub: "TIME" },
    { label: "进度", value: `${currentIndex + 1} / ${totalCount}`, sub: "PROGRESS" },
    { label: "正确率", value: `${stats.accuracy}%`, sub: "ACCURACY" }
  ];

  return (
    <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 py-8 px-12 grid grid-cols-3 gap-4">
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col items-center justify-center border-r last:border-0 border-slate-100 px-2">
          <span className="text-4xl font-bold text-slate-800 mb-1 whitespace-nowrap tracking-tight">{item.value}</span>
          <span className="text-xs font-black text-slate-400 tracking-[0.2em] uppercase">{item.label}</span>
          <span className="text-[10px] text-slate-300 font-bold tracking-widest">{item.sub}</span>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;
