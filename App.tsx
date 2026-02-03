
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Settings, LayoutDashboard, Calendar, BarChart3, CheckCircle2, X, Wand2 } from 'lucide-react';
import { Task, Category, TabType, Subtask } from './types';
import Dashboard from './components/Dashboard';
import DailyView from './components/DailyView';
import SettingsView from './components/SettingsView';
import AnalyticsView from './components/AnalyticsView';
import { CATEGORIES, ICON_MAP } from './constants';
import { GoogleGenAI, Type } from "@google/genai";

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('aether-tasks-v3');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Q4 Product Roadmap', category: 'Work', completed: false, time: '5:00 PM', date: new Date().toISOString(), subtasks: [] },
      { id: '2', title: 'Review client feedback', category: 'Work', completed: true, time: 'Completed', date: new Date().toISOString() },
      { id: 'food-1', title: 'Chick-fil-A', category: 'Food', completed: false, time: 'Lunch', date: new Date().toISOString(), logoUrl: 'https://logo.clearbit.com/chick-fil-a.com' },
    ];
  });

  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('aether-user');
    return saved ? JSON.parse(saved) : { 
      name: 'Alex Rivera', 
      avatar: 'https://picsum.photos/seed/user/100', 
      notifications: true,
      audioEnabled: true,
      accentColor: '#A5F3E3',
      accentName: 'Seafoam',
      trueDarkMode: true
    };
  });

  useEffect(() => {
    localStorage.setItem('aether-tasks-v3', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('aether-user', JSON.stringify(userData));
    const root = document.documentElement;
    root.style.setProperty('--accent-color', userData.accentColor);
    
    if (userData.trueDarkMode) {
      root.style.setProperty('--bg-main', '#0B0B0C');
      root.style.setProperty('--bg-surface', '#141416');
      root.style.setProperty('--text-main', '#F4F4F5');
      root.style.setProperty('--text-muted', '#6B7280');
      root.style.setProperty('--border-subtle', '#1C1C1E');
    } else {
      root.style.setProperty('--bg-main', '#F4F4F5');
      root.style.setProperty('--bg-surface', '#FFFFFF');
      root.style.setProperty('--text-main', '#09090B');
      root.style.setProperty('--text-muted', '#6B7280');
      root.style.setProperty('--border-subtle', '#E5E7EB');
    }
  }, [userData]);

  const playFeedback = useCallback(() => {
    if (!userData.audioEnabled) return;
    if (navigator.vibrate) navigator.vibrate(10);
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }, [userData.audioEnabled]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        if (!t.completed) playFeedback();
        return { ...t, completed: !t.completed, time: !t.completed ? 'Completed' : '12:00 PM' };
      }
      return t;
    }));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks?.map(st => 
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    }));
  };

  const breakdownTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.isBreakingDown) return;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isBreakingDown: true } : t));

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Break down the task "${task.title}" into 3-5 small, actionable subtasks.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING }
              },
              required: ["title"]
            }
          }
        }
      });

      const subtasksData = JSON.parse(response.text || "[]");
      const newSubtasks: Subtask[] = subtasksData.map((st: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: st.title,
        completed: false
      }));

      setTasks(prev => prev.map(t => t.id === taskId ? { 
        ...t, 
        subtasks: newSubtasks, 
        isBreakingDown: false 
      } : t));
    } catch (e) {
      console.error("Breakdown failed", e);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isBreakingDown: false } : t));
    }
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const resetCategoryTasks = (category: Category) => {
    setTasks(prev => prev.map(t => t.category === category ? { ...t, completed: false, subtasks: t.subtasks?.map(st => ({...st, completed: false})) } : t));
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<Category>('Work');
  const [newTaskIcon, setNewTaskIcon] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-set icon name based on category if not specifically chosen
  useEffect(() => {
    const cat = CATEGORIES.find(c => c.name === newTaskCategory);
    if (cat && (!newTaskIcon || !cat.suggestedIcons.includes(newTaskIcon))) {
       setNewTaskIcon(cat.icon);
    }
  }, [newTaskCategory]);

  const addTask = async () => {
    if (!newTaskTitle.trim() || isProcessing) return;
    setIsProcessing(true);
    const taskId = Math.random().toString(36).substr(2, 9);
    
    // Simple heuristic to try and find a logo if it's a known brand
    let logoUrl: string | undefined = undefined;
    const lowerTitle = newTaskTitle.toLowerCase();
    if (newTaskCategory === 'Food' || newTaskCategory === 'Shopping') {
      if (lowerTitle.includes('starbucks')) logoUrl = 'https://logo.clearbit.com/starbucks.com';
      if (lowerTitle.includes('amazon')) logoUrl = 'https://logo.clearbit.com/amazon.com';
      if (lowerTitle.includes('target')) logoUrl = 'https://logo.clearbit.com/target.com';
      if (lowerTitle.includes('mcdonald')) logoUrl = 'https://logo.clearbit.com/mcdonalds.com';
    }

    const newTask: Task = {
      id: taskId,
      title: newTaskTitle,
      category: newTaskCategory,
      completed: false,
      time: 'Just now',
      date: new Date().toISOString(),
      subtasks: [],
      iconName: newTaskIcon,
      logoUrl: logoUrl
    };
    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
    setNewTaskIcon(undefined);
    setIsModalOpen(false);
    setIsProcessing(false);
  };

  const activeCategoryTheme = CATEGORIES.find(c => c.name === newTaskCategory);
  const displayedIcons = activeCategoryTheme?.suggestedIcons || [];

  return (
    <Router>
      <div className="flex flex-col h-screen bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden max-w-md mx-auto relative shadow-2xl transition-colors duration-500">
        <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
          <Routes>
            <Route path="/" element={<Dashboard tasks={tasks} userData={userData} toggleTask={toggleTask} deleteTask={deleteTask} resetCategoryTasks={resetCategoryTasks} breakdownTask={breakdownTask} toggleSubtask={toggleSubtask} />} />
            <Route path="/daily" element={<DailyView tasks={tasks} toggleTask={toggleTask} deleteTask={deleteTask} />} />
            <Route path="/stats" element={<AnalyticsView tasks={tasks} />} />
            <Route path="/settings" element={<SettingsView tasks={tasks} setTasks={setTasks} userData={userData} setUserData={setUserData} />} />
          </Routes>
        </main>
        <FloatingActionButton onClick={() => setIsModalOpen(true)} />
        <BottomNav />
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => !isProcessing && setIsModalOpen(false)} />
            <div className="relative w-full max-w-md overflow-hidden bg-[var(--bg-surface)] rounded-t-[32px] animate-in slide-in-from-bottom duration-300 pointer-events-auto shadow-2xl">
              <div className="max-h-[85vh] overflow-y-auto no-scrollbar p-8 pb-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-main">New Task</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 bg-[var(--bg-main)] rounded-full border border-subtle">
                    <X className="w-5 h-5 text-muted" />
                  </button>
                </div>
                
                <input 
                  autoFocus
                  type="text"
                  placeholder="What needs to be done?"
                  className="w-full bg-transparent border-b border-subtle pb-4 text-2xl font-medium focus:outline-none focus:border-accent transition-colors mb-8 placeholder-zinc-500 text-main"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  disabled={isProcessing}
                />
                
                <div className="mb-6">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-3 ml-1">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.name}
                        onClick={() => setNewTaskCategory(cat.name)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          newTaskCategory === cat.name ? 'bg-accent text-black' : 'bg-[var(--bg-main)] text-muted border border-subtle'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-10 min-h-[64px]">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-3 ml-1">Symbol</p>
                  <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar -mx-1 px-1">
                    {displayedIcons.map(name => (
                      <button
                        key={name}
                        onClick={() => setNewTaskIcon(name)}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          newTaskIcon === name 
                            ? 'bg-accent/20 border-2 border-accent text-accent' 
                            : 'bg-[var(--bg-main)] text-muted border border-subtle hover:bg-zinc-800'
                        }`}
                      >
                        {ICON_MAP[name]}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={addTask} className="w-full py-4 font-bold rounded-2xl bg-accent text-black hover:opacity-90 active:scale-[0.98] shadow-lg shadow-accent/10">
                  Create Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
};

const FloatingActionButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const location = useLocation();
  if (['/settings', '/stats'].includes(location.pathname)) return null;
  return (
    <button onClick={onClick} className="fixed bottom-24 right-8 w-14 h-14 bg-accent text-black rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all z-40 border-4 border-[var(--bg-main)]">
      <Plus className="w-7 h-7" strokeWidth={2.5} />
    </button>
  );
};

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = [
    { icon: <LayoutDashboard className="w-6 h-6" />, path: '/' },
    { icon: <Calendar className="w-6 h-6" />, path: '/daily' },
    { icon: <BarChart3 className="w-6 h-6" />, path: '/stats' },
    { icon: <Settings className="w-6 h-6" />, path: '/settings' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[var(--bg-main)] border-t border-subtle px-10 flex items-center justify-between max-w-md mx-auto z-40">
      {navItems.map((item) => (
        <button key={item.path} onClick={() => navigate(item.path)} className={`p-2 transition-all relative ${location.pathname === item.path ? 'text-accent scale-110' : 'text-muted'}`}>
          {item.icon}
          {location.pathname === item.path && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />}
        </button>
      ))}
    </nav>
  );
};

export default App;
