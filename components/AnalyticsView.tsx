
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  Zap, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Activity,
  Award
} from 'lucide-react';
import { Task } from '../types';
import { CATEGORIES } from '../constants';

interface AnalyticsViewProps {
  tasks: Task[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tasks }) => {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const categoryData = CATEGORIES.map(cat => ({
      name: cat.name,
      value: tasks.filter(t => t.category === cat.name).length,
      color: cat.color
    })).filter(d => d.value > 0);

    const weeklyData = [
      { day: 'Mon', completed: 4 },
      { day: 'Tue', completed: 7 },
      { day: 'Wed', completed: 5 },
      { day: 'Thu', completed: 8 },
      { day: 'Fri', completed: completed },
      { day: 'Sat', completed: 3 },
      { day: 'Sun', completed: 2 },
    ];

    return { total, completed, completionRate, categoryData, weeklyData };
  }, [tasks]);

  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#A5F3E3';

  return (
    <div className="p-6 pb-32 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8 text-main">Analytics</h1>

      <div className="bg-surface rounded-[32px] p-8 mb-8 border border-subtle relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-muted blur-3xl -mr-16 -mt-16" />
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-accent-muted flex items-center justify-center text-accent">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-muted uppercase tracking-widest">Productivity Score</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-main">{stats.completionRate}</span>
              <span className="text-muted font-bold">/ 100</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-subtle">
            <p className="text-[10px] font-bold text-muted uppercase mb-1">Weekly Streak</p>
            <p className="text-xl font-bold text-main">12 Days</p>
          </div>
          <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-subtle">
            <p className="text-[10px] font-bold text-muted uppercase mb-1">Focus Time</p>
            <p className="text-xl font-bold text-main">24.5h</p>
          </div>
        </div>
      </div>

      <SectionHeader title="Completion Trend" icon={<TrendingUp className="w-4 h-4" />} />
      <div className="bg-surface rounded-[32px] p-6 mb-8 border border-subtle h-64 shadow-sm overflow-hidden">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={stats.weeklyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1C1C1E" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 600 }}
              dy={10}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }}
              contentStyle={{ 
                backgroundColor: '#141416', 
                border: '1px solid #1C1C1E', 
                borderRadius: '16px',
                fontSize: '12px',
                color: '#fff'
              }}
              itemStyle={{ color: accentColor }}
            />
            <Bar 
              dataKey="completed" 
              fill={accentColor} 
              radius={[6, 6, 6, 6]} 
              barSize={18}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="min-w-0">
          <SectionHeader title="Categories" icon={<Activity className="w-4 h-4" />} />
          <div className="bg-surface rounded-[32px] p-4 border border-subtle h-[200px] flex items-center justify-center shadow-sm overflow-hidden">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="min-w-0">
          <SectionHeader title="Efficiency" icon={<Zap className="w-4 h-4" />} />
          <div className="bg-surface rounded-[32px] p-8 border border-subtle h-[200px] flex flex-col justify-center shadow-sm">
             <p className="text-[13px] font-medium text-muted mb-2">Morning Peak</p>
             <p className="text-[28px] font-bold text-main mb-6 leading-none">9:30 AM</p>
             <div className="w-full h-[6px] bg-[#1C1C1E] rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-[#C084FC] rounded-full shadow-[0_0_12px_rgba(192,132,252,0.4)]" />
             </div>
             <p className="text-[10px] text-muted mt-5 font-bold uppercase tracking-[0.15em]">HIGH ENERGY</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <SummaryTile 
          icon={<Clock className="w-5 h-5" />} 
          label="Average Task Time" 
          value="45 mins" 
          color="#818CF8" 
        />
        <SummaryTile 
          icon={<CheckCircle className="w-5 h-5" />} 
          label="Tasks Finished" 
          value={stats.completed.toString()} 
          color="#2DD4BF" 
        />
        <SummaryTile 
          icon={<Calendar className="w-5 h-5" />} 
          label="Days Active" 
          value="31" 
          color="#F472B6" 
        />
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ title: string; icon: any }> = ({ title, icon }) => (
  <div className="flex items-center gap-2 mb-4 ml-2">
    <div className="text-muted">{icon}</div>
    <p className="text-[11px] font-bold text-muted uppercase tracking-[0.2em] truncate">{title}</p>
  </div>
);

const SummaryTile: React.FC<{ icon: any; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-surface rounded-2xl p-4 flex items-center justify-between border border-subtle shadow-sm transition-all">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-subtle bg-zinc-500/5" style={{ color }}>
        {icon}
      </div>
      <span className="text-[14px] font-semibold text-main">{label}</span>
    </div>
    <span className="text-[14px] font-bold text-muted">{value}</span>
  </div>
);

export default AnalyticsView;
