
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Settings, LayoutDashboard, Calendar, BarChart3, CheckCircle2, X } from 'lucide-react';
import { Task, Category, TabType } from './types';
import Dashboard from './components/Dashboard';
import DailyView from './components/DailyView';
import SettingsView from './components/SettingsView';
import AnalyticsView from './components/AnalyticsView';
import { CATEGORIES } from './constants';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('aether-tasks-v2');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Q4 Product Roadmap', category: 'Work', completed: false, time: '5:00 PM', date: new Date().toISOString() },
      { id: '2', title: 'Review client feedback', category: 'Work', completed: true, time: 'Completed', date: new Date().toISOString() },
      { id: '3', title: 'Grocery shopping', category: 'Personal', completed: false, time: 'Evening', date: new Date().toISOString() },
      { id: '4', title: 'Morning meditation', category: 'Wellness', completed: true, time: 'Completed', date: new Date().toISOString() },
      { id: 'food-1', title: 'Chick-fil-A', category: 'Food', completed: false, time: 'Lunch', date: new Date().toISOString(), logoUrl: 'https://logo.clearbit.com/chick-fil-a.com' },
      { id: 'food-2', title: 'Starbucks', category: 'Food', completed: false, time: 'Coffee', date: new Date().toISOString(), logoUrl: 'https://logo.clearbit.com/starbucks.com' },
      { id: 'food-3', title: 'Chipotle', category: 'Food', completed: false, time: 'Dinner', date: new Date().toISOString(), logoUrl: 'https://logo.clearbit.com/chipotle.com' },
    ];
  });

  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('aether-user');
    return saved ? JSON.parse(saved) : { 
      name: 'Alex Rivera', 
      avatar: 'https://picsum.photos/seed/user/100', 
      notifications: true,
      accentColor: '#A5F3E3',
      accentName: 'Seafoam',
      trueDarkMode: true
    };
  });

  useEffect(() => {
    localStorage.setItem('aether-tasks-v2', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('aether-user', JSON.stringify(userData));
    
    // Theme Management
    const root = document.documentElement;
    root.style.setProperty('--accent-color', userData.accentColor);
    
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '165, 243, 227';
    };
    root.style.setProperty('--accent-color-muted', `rgba(${hexToRgb(userData.accentColor)}, 0.1)`);

    // Theme Switching: Precise solid borders to prevent artifacts
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<Category>('Work');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchBrandLogo = async (brandName: string): Promise<string | undefined> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Identify the primary official website domain for the brand "${brandName}". 
        Output ONLY the raw domain name (e.g., brand.com). 
        Do not include "www", markdown, or any explanation. 
        If it's not a recognizable commercial brand, respond exactly with "none".`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      
      const textOutput = response.text?.trim().toLowerCase();
      const domainMatch = textOutput?.match(/([a-z0-9|-]+\.)+[a-z]{2,}/);
      const domain = domainMatch ? domainMatch[0] : null;

      if (domain && domain !== 'none' && !textOutput?.includes('none')) {
        return `https://logo.clearbit.com/${domain}`;
      }
    } catch (e) {
      console.error("Failed to fetch logo", e);
    }
    return undefined;
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed, time: !t.completed ? 'Completed' : '12:00 PM' } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const resetCategoryTasks = (category: Category) => {
    setTasks(prev => prev.map(t => t.category === category ? { ...t, completed: false } : t));
  };

  const addTask = async () => {
    if (!newTaskTitle.trim() || isProcessing) return;
    
    setIsProcessing(true);
    const taskId = Math.random().toString(36).substr(2, 9);
    
    const newTask: Task = {
      id: taskId,
      title: newTaskTitle,
      category: newTaskCategory,
      completed: false,
      time: 'Just now',
      date: new Date().toISOString(),
    };
    
    setTasks(prev => [newTask, ...prev]);
    const currentTitle = newTaskTitle;
    setNewTaskTitle('');
    setIsModalOpen(false);
    setIsProcessing(false);

    if (newTaskCategory === 'Food') {
      const logoUrl = await fetchBrandLogo(currentTitle);
      if (logoUrl) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, logoUrl } : t));
      }
    }
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden max-w-md mx-auto relative shadow-2xl transition-colors duration-500">
        <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
          <Routes>
            <Route path="/" element={<Dashboard tasks={tasks} userData={userData} toggleTask={toggleTask} deleteTask={deleteTask} resetCategoryTasks={resetCategoryTasks} />} />
            <Route path="/daily" element={<DailyView tasks={tasks} toggleTask={toggleTask} deleteTask={deleteTask} />} />
            <Route path="/stats" element={<AnalyticsView tasks={tasks} />} />
            <Route path="/settings" element={<SettingsView tasks={tasks} setTasks={setTasks} userData={userData} setUserData={setUserData} />} />
          </Routes>
        </main>

        <FloatingActionButton onClick={() => setIsModalOpen(true)} />

        <BottomNav />

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isProcessing && setIsModalOpen(false)} />
            <div className="relative w-full bg-[var(--bg-surface)] rounded-t-[32px] p-8 pb-12 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-main">New Task</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-[var(--bg-main)] rounded-full border border-subtle">
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>
              
              <input 
                autoFocus
                type="text"
                placeholder={newTaskCategory === 'Food' ? "e.g. Jersey Mike's" : "What needs to be done?"}
                className="w-full bg-transparent border-b border-subtle pb-4 text-2xl font-medium focus:outline-none focus:border-accent transition-colors mb-8 placeholder-zinc-500 text-main"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                disabled={isProcessing}
              />

              <div className="mb-10">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Category</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => setNewTaskCategory(cat.name)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        newTaskCategory === cat.name 
                          ? 'bg-accent text-black' 
                          : 'bg-[var(--bg-main)] text-muted hover:bg-zinc-500/10 border border-subtle'
                      }`}
                      disabled={isProcessing}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={addTask}
                disabled={isProcessing}
                className={`w-full py-4 font-bold rounded-2xl transition-all ${
                  isProcessing ? 'bg-zinc-800 text-muted' : 'bg-accent text-black hover:opacity-90 active:scale-[0.98]'
                }`}
              >
                {isProcessing ? 'Thinking...' : 'Create Task'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
};

const FloatingActionButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const location = useLocation();
  if (location.pathname === '/settings' || location.pathname === '/stats') return null;
  
  return (
    <button 
      onClick={onClick}
      className="fixed bottom-24 right-8 w-14 h-14 bg-accent text-black rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all z-40 border-4 border-[var(--bg-main)]"
    >
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
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[var(--bg-main)] border-t border-subtle px-10 flex items-center justify-between max-w-md mx-auto z-40 transition-colors duration-500">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`p-2 transition-all relative ${
            location.pathname === item.path ? 'text-accent scale-110' : 'text-muted hover:text-accent'
          }`}
        >
          {item.icon}
          {location.pathname === item.path && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
          )}
        </button>
      ))}
    </nav>
  );
};

export default App;
