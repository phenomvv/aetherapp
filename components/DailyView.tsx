
import React, { useState, useRef } from 'react';
import { Calendar, MoreVertical, ChevronLeft, Check, Trash2 } from 'lucide-react';
import { Task } from '../types';
import { useNavigate } from 'react-router-dom';

interface DailyViewProps {
  tasks: Task[];
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

const DailyView: React.FC<DailyViewProps> = ({ tasks, toggleTask, deleteTask }) => {
  const navigate = useNavigate();
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="p-6 min-h-full">
      <header className="flex justify-between items-center mb-8">
        <button onClick={() => navigate('/')} className="p-2 bg-zinc-900 rounded-full active:scale-95 transition-transform">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Daily Checklist</h1>
        <button className="p-2">
          <MoreVertical className="w-5 h-5 text-zinc-500" />
        </button>
      </header>

      <div className="mb-10">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Daily Progress</p>
            <h2 className="text-3xl font-extrabold tracking-tight">
              {progressPercent === 100 ? 'Awesome!' : progressPercent > 50 ? 'Almost there!' : 'Good start!'}
            </h2>
          </div>
          <span className="text-xs font-bold text-zinc-500">{completedCount} / {totalCount} tasks</span>
        </div>
        <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-zinc-500" />
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{todayStr}</span>
      </div>

      <div className="space-y-2">
        {tasks.map(task => (
          <DailyTaskItem key={task.id} task={task} toggleTask={toggleTask} deleteTask={deleteTask} />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-zinc-700" />
          </div>
          <p className="text-zinc-500">Your day looks clear. Add some tasks to get started!</p>
        </div>
      )}
    </div>
  );
};

const DailyTaskItem: React.FC<{ 
  task: Task; 
  toggleTask: (id: string) => void; 
  deleteTask: (id: string) => void;
}> = ({ task, toggleTask, deleteTask }) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const startTouchX = useRef(0);
  const startTouchY = useRef(0);
  const isSwiping = useRef(false);
  const hasLock = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startTouchX.current = e.touches[0].clientX;
    startTouchY.current = e.touches[0].clientY;
    isSwiping.current = true;
    hasLock.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping.current) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const dx = currentX - startTouchX.current;
    const dy = currentY - startTouchY.current;

    if (!hasLock.current) {
      if (Math.abs(dy) > Math.abs(dx)) {
        isSwiping.current = false;
        return;
      }
      if (Math.abs(dx) > 10) {
        hasLock.current = true;
      } else {
        return;
      }
    }

    const offset = Math.min(0, Math.max(-100, dx));
    setSwipeOffset(offset);
  };

  const handleTouchEnd = () => {
    isSwiping.current = false;
    if (swipeOffset < -50) {
      if (navigator.vibrate) navigator.vibrate(10);
      setSwipeOffset(-70);
    } else {
      setSwipeOffset(0);
    }
    hasLock.current = false;
  };

  return (
    <div className="relative group overflow-hidden rounded-xl touch-pan-y select-none">
      <div 
        className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex justify-end items-center px-4"
        onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
      >
        <button className="text-red-500 p-2 active:scale-90 transition-transform">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div 
        onClick={() => swipeOffset === 0 && toggleTask(task.id)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="swipe-item flex items-center gap-4 py-4 px-2 border-b border-white/5 bg-[var(--bg-main)] group cursor-pointer transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
          task.completed 
            ? 'bg-accent border-accent text-[#0B0B0C]' 
            : 'border-zinc-800 bg-transparent'
        }`}>
          {task.completed && <Check className="w-3 h-3" strokeWidth={4} />}
        </div>
        <div className="flex-1">
          <h4 className={`text-base font-medium transition-all ${
            task.completed ? 'text-zinc-600 line-through' : 'text-zinc-200'
          }`}>
            {task.title}
          </h4>
          {task.time && !task.completed && (
            <span className="text-xs text-zinc-500">Scheduled for {task.time}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyView;
