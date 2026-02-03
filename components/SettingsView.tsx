
import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Moon, 
  Sun,
  Trash2, 
  Download, 
  Upload, 
  ChevronRight, 
  Star, 
  MessageCircle, 
  Check, 
  ShieldCheck,
  Palette,
  X,
  Volume2,
  Cpu
} from 'lucide-react';
import { Task } from '../types';

interface SettingsViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  userData: any;
  setUserData: React.Dispatch<React.SetStateAction<any>>;
}

const ACCENT_COLORS = [
  { name: 'Seafoam', hex: '#A5F3E3' },
  { name: 'Rose', hex: '#FFB7C5' },
  { name: 'Lavender', hex: '#C084FC' },
  { name: 'Sky', hex: '#7DD3FC' },
  { name: 'Amber', hex: '#FCD34D' },
  { name: 'Mint', hex: '#6EE7B7' },
  { name: 'Slate', hex: '#94A3B8' }
];

const SettingsView: React.FC<SettingsViewProps> = ({ tasks, setTasks, userData, setUserData }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userData.name);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleClearData = () => {
    if (confirm("Are you sure you want to delete all tasks? This cannot be undone.")) {
      setTasks([]);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aether-tasks-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const importedTasks = JSON.parse(event.target.result);
          if (Array.isArray(importedTasks)) {
            setTasks(importedTasks);
            alert("Tasks imported successfully!");
          }
        } catch (err) {
          alert("Invalid file format.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const toggleNotifications = () => {
    setUserData({ ...userData, notifications: !userData.notifications });
  };

  const toggleAudio = () => {
    setUserData({ ...userData, audioEnabled: !userData.audioEnabled });
  };

  const toggleTheme = () => {
    setUserData({ ...userData, trueDarkMode: !userData.trueDarkMode });
  };

  const saveName = () => {
    setUserData({ ...userData, name: tempName });
    setIsEditingName(false);
  };

  const selectColor = (color: typeof ACCENT_COLORS[0]) => {
    setUserData({ ...userData, accentColor: color.hex, accentName: color.name });
    setIsPickerOpen(false);
  };

  return (
    <div className="p-6 animate-in fade-in duration-500 pb-8 flex flex-col min-h-full">
      <h1 className="text-3xl font-bold mb-8 text-main">Settings</h1>

      {/* Profile Section */}
      <div className="bg-surface rounded-[28px] p-6 mb-8 border border-subtle transition-all duration-500 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group">
            <img src={userData.avatar} className="w-16 h-16 rounded-2xl object-cover border border-subtle" alt="Profile" />
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Palette className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input 
                  autoFocus
                  className="bg-[var(--bg-main)] border border-subtle rounded-lg px-2 py-1 text-main w-full focus:ring-1 ring-accent outline-none"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveName()}
                />
                <button onClick={saveName} className="p-1 text-accent"><Check className="w-5 h-5" /></button>
              </div>
            ) : (
              <h2 className="text-lg font-bold flex items-center gap-2 text-main">
                {userData.name}
                <button onClick={() => setIsEditingName(true)} className="text-muted hover:text-zinc-400">
                  <Palette className="w-4 h-4" />
                </button>
              </h2>
            )}
            <p className="text-xs text-muted">Aether Premium Member</p>
          </div>
        </div>
        <div className="bg-accent-muted rounded-2xl p-4 flex items-center justify-between border border-accent/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <Star className="w-4 h-4" fill="currentColor" />
            </div>
            <span className="text-sm font-semibold text-main">Upgrade to Aether+</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted" />
        </div>
      </div>

      {/* Preferences Section */}
      <SectionTitle title="Preferences" />
      <div className="bg-surface rounded-[28px] overflow-hidden border border-subtle mb-8 transition-all duration-500 shadow-sm">
        <SettingToggle 
          icon={<Volume2 className="w-5 h-5" />} 
          label="Audio Feedback" 
          active={userData.audioEnabled} 
          onToggle={toggleAudio}
          color="#2DD4BF"
        />
        <Divider />
        <SettingToggle 
          icon={<Bell className="w-5 h-5" />} 
          label="Push Notifications" 
          active={userData.notifications} 
          onToggle={toggleNotifications}
          color="#818CF8"
        />
        <Divider />
        <SettingToggle 
          icon={userData.trueDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />} 
          label="Dark Appearance" 
          active={userData.trueDarkMode} 
          onToggle={toggleTheme} 
          color="#C084FC"
        />
        <Divider />
        <button 
          onClick={() => setIsPickerOpen(true)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-500/10 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-subtle bg-zinc-500/5" style={{ color: userData.accentColor }}>
              <Palette className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-main">Accent Color</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted font-medium">{userData.accentName || 'Seafoam'}</span>
            <ChevronRight className="w-4 h-4 text-muted" />
          </div>
        </button>
      </div>

      {/* Data Section */}
      <SectionTitle title="Data & Privacy" />
      <div className="bg-surface rounded-[28px] overflow-hidden border border-subtle mb-8 transition-all duration-500 shadow-sm">
        <button 
          onClick={handleExport}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-500/10 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-[var(--bg-main)] flex items-center justify-center text-muted border border-subtle">
              <Download className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-main">Export Backup</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted" />
        </button>
        <Divider />
        <button 
          onClick={handleImport}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-500/10 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-[var(--bg-main)] flex items-center justify-center text-muted border border-subtle">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-main">Restore Backup</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted" />
        </button>
        <Divider />
        <button 
          onClick={handleClearData}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-red-500/5 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/10">
              <Trash2 className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-red-500">Delete All Data</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted group-hover:text-red-500" />
        </button>
      </div>

      {/* Support Section */}
      <SectionTitle title="Support" />
      <div className="bg-surface rounded-[28px] overflow-hidden border border-subtle mb-6 transition-all duration-500 shadow-sm">
        <SettingItem 
          icon={<MessageCircle className="w-5 h-5" />} 
          label="Contact Support" 
          color="#FB923C"
        />
        <Divider />
        <SettingItem 
          icon={<ShieldCheck className="w-5 h-5" />} 
          label="Privacy Policy" 
          color="#A5F3E3"
        />
      </div>

      {/* Bottom info to fill the gap */}
      <div className="mt-auto pt-6 border-t border-subtle flex flex-col items-center">
        <div className="flex items-center gap-2 text-muted mb-4">
          <Cpu className="w-3 h-3 animate-pulse text-accent" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Aether AI System Ready</span>
        </div>
        <div className="w-full flex justify-between items-center px-2">
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Aether Task</span>
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest opacity-60">v2.1.0</span>
        </div>
      </div>

      {/* Accent Color Picker Modal */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPickerOpen(false)} />
          <div className="relative w-full max-w-xs bg-surface rounded-[32px] p-8 border border-subtle shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-main">Choose Accent</h3>
              <button onClick={() => setIsPickerOpen(false)} className="text-muted"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {ACCENT_COLORS.map(color => (
                <button
                  key={color.name}
                  onClick={() => selectColor(color)}
                  className={`w-12 h-12 rounded-2xl transition-all active:scale-90 relative ${userData.accentColor === color.hex ? 'ring-2 ring-accent ring-offset-4 ring-offset-[var(--bg-surface)]' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {userData.accentColor === color.hex && <Check className="w-5 h-5 text-black absolute inset-0 m-auto" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-3 ml-2">{title}</p>
);

const Divider = () => <div className="mx-6 h-[1px] bg-subtle" />;

const SettingToggle: React.FC<{ icon: any; label: string; active: boolean; onToggle: () => void; color: string }> = ({ icon, label, active, onToggle, color }) => (
  <div className="px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-subtle bg-zinc-500/5" style={{ color }}>
        {icon}
      </div>
      <span className="text-sm font-medium text-main">{label}</span>
    </div>
    <button 
      onClick={onToggle}
      className={`w-11 h-6 rounded-full relative transition-all duration-300 ${active ? 'bg-accent' : 'bg-zinc-300 dark:bg-zinc-800'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${active ? 'left-6' : 'left-1'}`} />
    </button>
  </div>
);

const SettingItem: React.FC<{ icon: any; label: string; value?: string; color: string }> = ({ icon, label, value, color }) => (
  <div className="px-6 py-4 flex items-center justify-between hover:bg-zinc-500/10 transition-colors cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-subtle bg-zinc-500/5" style={{ color }}>
        {icon}
      </div>
      <span className="text-sm font-medium text-main">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {value && <span className="text-xs text-muted font-medium">{value}</span>}
      <ChevronRight className="w-4 h-4 text-muted" />
    </div>
  </div>
);

export default SettingsView;
