
import React, { useState, useRef } from 'react';
import { Search, MoreVertical, CheckCircle2, RefreshCcw, Trash2 } from 'lucide-react';
import { Task, TabType, Category } from '../types';
import { getCategoryIcon, getCategoryTheme, CATEGORIES } from '../constants';

interface DashboardProps {
  tasks: Task[];
  userData: { name: string; avatar: string; accentColor: string; trueDarkMode: boolean };
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  resetCategoryTasks: (category: Category) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, userData, toggleTask, deleteTask, resetCategoryTasks }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Today');

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'Today') return !t.completed;
    if (activeTab === 'Completed') return t.completed;
    return true;
  });

  const groupedTasks = filteredTasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {} as Record<Category, Task[]>);

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-900 overflow-hidden flex items-center justify-center border border-subtle">
            <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Good Morning</p>
            <h1 className="text-xl font-bold tracking-tight text-main">{userData.name}</h1>
          </div>
        </div>
        <button className="p-2.5 bg-surface rounded-full border border-subtle hover:bg-zinc-500/10 transition-colors">
          <Search className="w-5 h-5 text-muted" />
        </button>
      </header>

      {/* Premium Progress Card */}
      <div className="bg-surface rounded-[32px] p-6 mb-8 flex items-center gap-6 border border-subtle shadow-sm transition-all duration-500">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              className="text-zinc-100 dark:text-zinc-800"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className="text-accent transition-all duration-1000 ease-out"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-main tracking-tighter">{progressPercent}%</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-1">Daily Target</p>
          <h3 className="text-lg font-bold mb-1 text-main">Daily Progress</h3>
          <p className="text-sm text-muted mb-0">{completedCount} of {totalCount} tasks completed</p>
        </div>
      </div>

      <div className="flex gap-8 mb-8 overflow-x-auto no-scrollbar">
        {(['Today', 'Upcoming', 'Completed'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-semibold whitespace-nowrap pb-2 transition-all relative ${
              activeTab === tab ? 'text-main' : 'text-muted'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full animate-in fade-in duration-300" />
            )}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {(Object.entries(groupedTasks) as [Category, Task[]][]).map(([category, catTasks]) => (
          <div key={category} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: getCategoryTheme(category).color }} 
                />
                <h4 className="text-sm font-bold tracking-wide uppercase text-muted">{category}</h4>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => resetCategoryTasks(category)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-zinc-500/10 text-[10px] font-bold uppercase tracking-wider text-muted transition-colors border border-subtle"
                  title={`Reset ${category} checklist`}
                >
                  <RefreshCcw className="w-3.5 h-3.5 mr-1" />
                  RESET
                </button>
                <span className="text-[10px] text-muted font-bold uppercase tracking-widest">{catTasks.length} ITEMS</span>
              </div>
            </div>
            <div className="space-y-3">
              {catTasks.map(task => (
                <TaskItem key={task.id} task={task} toggleTask={toggleTask} deleteTask={deleteTask} />
              ))}
            </div>
          </div>
        ))}
        {filteredTasks.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted font-medium">All caught up for today.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TaskItem: React.FC<{ 
  task: Task; 
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}> = ({ task, toggleTask, deleteTask }) => {
  const theme = getCategoryTheme(task.category);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [imgError, setImgError] = useState(false);
  const startTouchX = useRef(0);
  const isSwiping = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startTouchX.current = e.touches[0].clientX;
    isSwiping.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping.current) return;
    const currentX = e.touches[0].clientX;
    const offset = Math.min(0, Math.max(-80, currentX - startTouchX.current));
    setSwipeOffset(offset);
  };

  const handleTouchEnd = () => {
    isSwiping.current = false;
    if (swipeOffset < -40) {
      setSwipeOffset(-70);
    } else {
      setSwipeOffset(0);
    }
  };

  return (
    <div className="relative group overflow-hidden rounded-[24px]">
      {/* Background Actions - Only visible when swiping to prevent ghosting */}
      <div 
        className={`absolute inset-0 bg-red-600 flex justify-end items-center px-4 transition-opacity duration-200 ${swipeOffset === 0 ? 'opacity-0' : 'opacity-100'}`}
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(task.id);
          }}
          className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center active:scale-90 transition-transform"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div 
        onClick={() => toggleTask(task.id)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="swipe-item bg-surface rounded-[24px] p-4 flex items-center justify-between group cursor-pointer active:scale-[0.99] border border-subtle transition-all duration-400 shadow-sm"
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-11 h-11 rounded-[16px] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm"
            style={{ 
              backgroundColor: (task.logoUrl && !imgError) ? 'white' : theme.bgColor, 
              color: theme.color,
              border: (task.logoUrl && !imgError) ? '1px solid var(--border-subtle)' : 'none'
            }}
          >
            {(task.logoUrl && !imgError) ? (
              <img 
                src={task.logoUrl} 
                alt={task.title} 
                className="w-full h-full object-contain p-1.5 animate-in fade-in duration-500" 
                onError={() => {
                  setImgError(true);
                }}
              />
            ) : getCategoryIcon(task.category)}
          </div>
          <div>
            <h5 className={`font-semibold text-[15px] transition-all ${task.completed ? 'text-muted line-through' : 'text-main'}`}>
              {task.title}
            </h5>
            <p className="text-[12px] text-muted font-medium">{task.time}</p>
          </div>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
          task.completed 
            ? 'bg-accent border-accent text-black' 
            : 'border-zinc-300 dark:border-zinc-800'
        }`}>
          {task.completed && <CheckCircle2 className="w-4 h-4" strokeWidth={3} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
