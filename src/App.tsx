import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  PieChart, Pie, Cell
} from 'recharts';
import {
  CheckCircle2, Circle, Plus, Zap, Calendar, BarChart2, Home, Gift, Store, Package,
  ChevronRight, BrainCircuit, Activity, Heart, Clock, AlertTriangle, Filter,
  Sun, Moon, Mic, Image as ImageIcon, MessageSquare, X, LogIn, RefreshCw, Menu, Bell, HelpCircle, Trash2
} from 'lucide-react';
import { initAuth, googleSignIn, getAccessToken, logout, auth, db } from './lib/auth';
import { fetchCalendarEvents, CalendarEvent } from './lib/calendar';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import confetti from 'canvas-confetti';
import fatMujaerCat3D from './assets/images/fat_3d_cat_transparent_1779360687004.png';
import GendutCat from './components/GendutCat';

const GLOBAL_STYLES = `
  body { margin: 0; outline: none; }
  .glass { background: rgba(15,23,42,0.8); backdrop-filter: blur(16px); border: 1px solid rgba(16,185,129,0.15); }
  .glass-light { background: rgba(250, 250, 249, 0.8); backdrop-filter: blur(16px); border: 1px solid rgba(5, 150, 105, 0.2); }
  
  .neon-border { border: 1px solid rgba(16,185,129,0.4); box-shadow: 0 0 10px rgba(16,185,129,0.1); }
  
  .tab-active { background: linear-gradient(to right, rgba(16,185,129,0.2), transparent); border-left: 3px solid #10b981; }
  .tab-active-light { background: linear-gradient(to right, rgba(5, 150, 105, 0.15), transparent); border-left: 3px solid #059669; }
  
  .shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent); background-size: 200% 100%; animation: shimmer 3s infinite; }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  
  .cat-pulse { animation: cat-float 4s ease-in-out infinite; }
  @keyframes cat-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  
  .progress-glow { box-shadow: 0 0 8px #10b981; }
  .neon-glow { box-shadow: 0 0 10px rgba(16,185,129,0.5), 0 0 20px rgba(16,185,129,0.3); }
  .neon-glow-red-pulse { animation: redpulse 2s infinite ease-in-out; border-color: rgba(239, 68, 68, 0.6); }
  @keyframes redpulse {
    0%, 100% { box-shadow: 0 0 6px rgba(239, 68, 68, 0.4), inset 0 0 4px rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.5); }
    50% { box-shadow: 0 0 16px rgba(239, 68, 68, 0.8), inset 0 0 8px rgba(239, 68, 68, 0.3); border-color: rgba(239, 68, 68, 0.9); }
  }
  .animate-pulse-subtle { animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  @keyframes pulse-subtle {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.85; transform: scale(0.99); }
  }

  .hologram-scan { position: absolute; width: 100%; height: 2px; background: rgba(34,211,238,0.5); box-shadow: 0 0 15px #22d3ee; top: 0; animation: scan 4s linear infinite; pointer-events: none; z-index: 10; }
  @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }

  .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.3); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.6); }

  .cat-3d-breathe { animation: cat-3d-breathe 5s ease-in-out infinite; transform-style: preserve-3d; }
  .cat-3d-spin { animation: cat-3d-spin 3s cubic-bezier(0.4, 0, 0.2, 1) infinite; transform-style: preserve-3d; }
  .cat-3d-jump { animation: cat-3d-jump 1.6s ease-in-out infinite; transform-style: preserve-3d; }
  .cat-3d-wiggle { animation: cat-3d-wiggle 1.2s ease-in-out infinite; transform-style: preserve-3d; }

  @keyframes cat-3d-breathe {
    0% { transform: translateY(0) scale(1) rotate(0deg); }
    25% { transform: translateY(-4px) scale(1.02, 0.98) rotate(1deg); }
    50% { transform: translateY(-8px) scale(0.98, 1.02) rotate(0deg); }
    75% { transform: translateY(-4px) scale(1.02, 0.98) rotate(-1deg); }
    100% { transform: translateY(0) scale(1) rotate(0deg); }
  }

  @keyframes cat-3d-spin {
    0% { transform: rotateY(0deg) scale(1); }
    50% { transform: rotateY(180deg) scale(1.1) translateY(-6px); }
    100% { transform: rotateY(360deg) scale(1); }
  }

  @keyframes cat-3d-jump {
    0%, 100% { transform: translateY(0) scale(1, 1); }
    30% { transform: translateY(6px) scale(1.15, 0.82); }
    50% { transform: translateY(-30px) scale(0.85, 1.2); }
    70% { transform: translateY(-6px) scale(1.05, 0.95); }
  }

  @keyframes cat-3d-wiggle {
    0%, 100% { transform: rotateZ(0deg) scale(1) translateY(0); }
    25% { transform: rotateZ(10deg) scale(1.04) translateY(-3px); }
    75% { transform: rotateZ(-10deg) scale(1.04) translateY(-3px); }
  }
`;

const PAGE_LOAD_TIME = Date.now();

const parseEstimateToSeconds = (doc: string): number => {
  if (!doc) return 7200; // default 2 hours
  // Try to find something like "2h" or "1.5h" or "30 mins"
  const hourMatch = doc.match(/(\d+(\.\d+)?)h/i);
  if (hourMatch) {
    return parseFloat(hourMatch[1]) * 3600;
  }
  const minMatch = doc.match(/(\d+)\s*mins?/i);
  if (minMatch) {
    return parseInt(minMatch[1], 10) * 60;
  }
  return 7200; // default 2 hours if no match but Critical
};

interface TaskCountdownProps {
  taskId: number;
  doc: string;
  isLightMode: boolean;
}

function TaskCountdown({ taskId, doc, isLightMode }: TaskCountdownProps) {
  // Parse the base duration
  const durationSeconds = React.useRef(parseEstimateToSeconds(doc));
  
  // Decide the creation timestamp
  const baseTime = taskId > 1000000000000 ? taskId : PAGE_LOAD_TIME;
  
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    const elapsed = Math.floor((Date.now() - baseTime) / 1000);
    return Math.max(0, durationSeconds.current - elapsed);
  });

  useEffect(() => {
    if (secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - baseTime) / 1000);
      const remaining = Math.max(0, durationSeconds.current - elapsed);
      setSecondsRemaining(remaining);
      
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [baseTime, secondsRemaining]);

  const hrs = Math.floor(secondsRemaining / 3600);
  const mins = Math.floor((secondsRemaining % 3600) / 60);
  const secs = secondsRemaining % 60;
  
  const displayStr = [
    hrs.toString().padStart(2, '0'),
    mins.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');

  const isLowTime = secondsRemaining < 600; // under 10 minutes turns red

  return (
    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border transition-all ${
      isLowTime
        ? (isLightMode ? 'bg-red-100 text-red-700 border-red-200' : 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse')
        : (isLightMode ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20')
    }`}>
      <Clock size={10} className={isLowTime ? 'animate-spin text-red-500' : 'text-amber-500'} />
      <span>{displayStr}</span>
    </div>
  );
}

// --- MOCK DATA ---
const MOCK_TASKS = [];

const ANALYTICS_DATA = [
  { day: 'Mon', focus: 4, energy: 80 }, { day: 'Tue', focus: 6, energy: 95 },
  { day: 'Wed', focus: 5, energy: 70 }, { day: 'Thu', focus: 8, energy: 100 },
  { day: 'Fri', focus: 7, energy: 85 }, { day: 'Sat', focus: 3, energy: 40 },
  { day: 'Sun', focus: 4, energy: 60 },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// (monthly analytics calculated dynamically in component)

const RADAR_DATA = [
  { subject: 'Deep Work', A: 120, fullMark: 150 }, { subject: 'Consistency', A: 98, fullMark: 150 },
  { subject: 'Task Boxing', A: 86, fullMark: 150 }, { subject: 'Speed', A: 99, fullMark: 150 },
  { subject: 'Energy Mgt', A: 85, fullMark: 150 }, { subject: 'Flow State', A: 65, fullMark: 150 },
];

const MACRO_GOALS = [];

const INITIAL_INVENTORY = [];

const STORE_ITEMS = [
  { id: 101, icon: '👑', name: 'Golden Crown', type: 'head', price: 5000, rarity: 'legendary' },
  { id: 102, icon: '🕶️', name: 'Cool Shades', type: 'face', price: 1500, rarity: 'rare' },
  { id: 103, icon: '🧣', name: 'Red Scarf', type: 'neck', price: 800, rarity: 'common' },
  { id: 104, icon: '🐟', name: 'Fresh Fish', type: 'bottomRight', price: 300, rarity: 'common' },
  { id: 105, icon: '✨', name: 'Sparkles', type: 'topRight', price: 2500, rarity: 'epic' },
  { id: 106, icon: '🔮', name: 'Magic Orb', type: 'bottomLeft', price: 10000, rarity: 'mythic' },
  { id: 201, icon: '🥩', name: 'Premium Cat Food', type: 'consumable', price: 50, rarity: 'common' },
];

const GACHA_POOL = [
  { id: 301, icon: '🎓', name: 'Graduation Cap', type: 'head', rarity: 'rare' },
  { id: 302, icon: '🎀', name: 'Cute Ribbon', type: 'head', rarity: 'common' },
  { id: 303, icon: '🕶️', name: 'Thug Life Shades', type: 'face', rarity: 'epic' },
  { id: 304, icon: '🥸', name: 'Funny Disguise', type: 'face', rarity: 'common' },
  { id: 305, icon: '🧣', name: 'Cozy Scarf', type: 'neck', rarity: 'common' },
  { id: 306, icon: '🔔', name: 'Golden Bell', type: 'neck', rarity: 'rare' },
  { id: 307, icon: '🎈', name: 'Red Balloon', type: 'topRight', rarity: 'rare' },
  { id: 308, icon: '🪄', name: 'Magic Wand', type: 'bottomRight', rarity: 'epic' },
  { id: 309, icon: '🪐', name: 'Mini Saturn', type: 'topRight', rarity: 'legendary' },
  { id: 310, icon: '🔥', name: 'Fire Aura', type: 'bottomLeft', rarity: 'mythic' },
  { id: 311, icon: '🛡️', name: 'Spike Collar', type: 'neck', rarity: 'epic' },
  { id: 312, icon: '🍩', name: 'Glazed Donut', type: 'bottomRight', rarity: 'common' },
  { id: 313, icon: '🐉', name: 'Mini Dragon', type: 'bottomLeft', rarity: 'mythic' },
  { id: 314, icon: '👾', name: 'Cyber Pet', type: 'topRight', rarity: 'legendary' },
];

const HEATMAP_DATA = [
  0, 1, 2, 3, 0, 2, 1, 0, 2, 3, 4, 0, 2, 1, 3, 2, 0, 3, 4, 1, 2, 0, 3, 2, 0, 0, 3, 3, 4, 0
];

export default function App() {
  const [activeTab, setActiveTab] = useState('command_center');
  const [isLightMode, setIsLightMode] = useState(() => {
    const saved = localStorage.getItem('gendut_theme_light');
    return saved === 'true';
  });
  const [isSleeping, setIsSleeping] = useState(false);

  useEffect(() => {
    localStorage.setItem('gendut_theme_light', isLightMode.toString());
  }, [isLightMode]);
  
  const [isListening, setIsListening] = useState(false);
  const [tasks, setTasks] = useState<any[]>(() => {
    const savedTasks = localStorage.getItem('gendut_tasks');
    return savedTasks ? JSON.parse(savedTasks) : MOCK_TASKS;
  });

  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [taskViewMode, setTaskViewMode] = useState<'Active' | 'Archive'>('Active');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const [energy, setEnergy] = useState(85);
  const [hunger, setHunger] = useState(42);
  const [happiness, setHappiness] = useState(82);
  const [affection, setAffection] = useState(60);
  const [activeCatAnimation, setActiveCatAnimation] = useState<'breathe' | 'spin' | 'jump' | 'wiggle'>('breathe');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMorningReminder, setShowMorningReminder] = useState(false);
  const [showInfoGuides, setShowInfoGuides] = useState(false);
  
  const [coins, setCoins] = useState(0);
  const [tickets, setTickets] = useState(0);
  const [level, setLevel] = useState(0);
  const [pxp, setPxp] = useState(0);
  const [showAiThinking, setShowAiThinking] = useState(false);
  const [isGachaRolling, setIsGachaRolling] = useState(false);
  const [gachaReward, setGachaReward] = useState<any | null>(null);
  const [inventoryFilter, setInventoryFilter] = useState('all');
  const [taskInput, setTaskInput] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<'All' | 'Critical' | 'High' | 'Normal' | 'Low'>('All');
  const [newTaskPriority, setNewTaskPriority] = useState<'Critical' | 'High' | 'Normal' | 'Low'>('Normal');
  const [macroGoals, setMacroGoals] = useState<any[]>(() => {
    const saved = localStorage.getItem('gendut_macro_goals');
    return saved ? JSON.parse(saved) : MACRO_GOALS;
  });
  const [showMacroInput, setShowMacroInput] = useState(false);
  const [macroInputTitle, setMacroInputTitle] = useState('');
  const [macroInputDeadline, setMacroInputDeadline] = useState('');
  const [macroInputCategory, setMacroInputCategory] = useState('');
  const [activeMacroAdding, setActiveMacroAdding] = useState<number | null>(null);
  const [macroTodoInput, setMacroTodoInput] = useState('');
  const [macroCategoryFilter, setMacroCategoryFilter] = useState('All');
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'daily' | 'monthly'>('daily');
  const [analyticsMonth, setAnalyticsMonth] = useState<number | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number | null>(null);
  const [selectedMacroId, setSelectedMacroId] = useState<number | null>(null);
  
  // Google Auth & Calendar Sync State
  const [needsAuth, setNeedsAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  
  // Inventory State
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [feedCountToday, setFeedCountToday] = useState(0);
  const [lastFedDate, setLastFedDate] = useState(() => new Date().toDateString());
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false);
  const [monthlyRewardClaimed, setMonthlyRewardClaimed] = useState(false);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState({ xp: 0, goals: 0 });

  // Monitor energy for notifications
  useEffect(() => {
    if (energy < 15 && !activeAlert) {
      const msg = "Gendut is feeling very weak (Energy < 15%). Please feed or rest him! 🐾";
      setActiveAlert(msg);
      
      // Also try browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Companion Alert", { body: msg });
      }
    } else if (energy >= 15 && activeAlert?.includes("Energy < 15%")) {
      setActiveAlert(null);
    }
  }, [energy, activeAlert]);

  // Request notification permission on first interaction
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      // We don't want to pop it immediately, but it's good to have
    }
  }, []);

  // Auto-select first macro goal when filter changes or current selection becomes invalid
  useEffect(() => {
    const filtered = macroGoals.filter(goal => 
      macroCategoryFilter === 'All' || goal.category === macroCategoryFilter
    );
    
    if (filtered.length > 0 && (!selectedMacroId || !filtered.find(g => g.id === selectedMacroId))) {
      setSelectedMacroId(filtered[0].id);
    }
  }, [macroGoals, macroCategoryFilter, selectedMacroId]);

  const toggleEquip = (itemId: number) => {
    setInventory(prev => {
      const target = prev.find(item => item.id === itemId);
      if (!target) return prev;
      const willEquip = !target.equipped;

      return prev.map(item => {
        if (item.id === itemId) {
          return { ...item, equipped: willEquip };
        }
        if (willEquip && item.type === target.type && target.type !== 'consumable') {
          return { ...item, equipped: false };
        }
        return item;
      });
    });
  };

  const buyItem = (storeId: number) => {
    const item = STORE_ITEMS.find(i => i.id === storeId);
    if (item && coins >= item.price) {
      if (item.type === 'consumable') {
        const today = new Date().toDateString();
        const currentFeedCount = lastFedDate !== today ? 0 : feedCountToday;
        
        if (currentFeedCount < 2) {
          setCoins(prev => prev - item.price);
          setFeedCountToday(currentFeedCount + 1);
          setLastFedDate(today);
          setHunger(prev => Math.min(100, prev + 50));
          setEnergy(prev => Math.min(100, prev + 30)); // Feeding Gendut increases energy!
          setHappiness(prev => Math.min(100, prev + 15)); // Feeding makes Gendut happy!
          setAffection(prev => Math.min(100, prev + 12)); // Feeding increases affection!
          setTimeout(() => alert('🥩 Nyam! Gendut lahap memakan Premium Food! Energi +30%, Kenyang +50, Kebahagiaan +15, Afeksi +12!'), 150);
        } else {
          alert('Gendut sudah kenyang! Dia hanya bisa diberi makan 2 kali sehari.');
        }
      } else {
        // Check if already in inventory
        if (!inventory.some(inv => inv.id === item.id)) {
          setCoins(prev => prev - item.price);
          setInventory(prev => [...prev, {
            id: item.id,
            icon: item.icon,
            rarity: item.rarity,
            equipped: false,
            type: item.type
          }]);
        }
      }
    }
  };

  useEffect(() => {
    // Persist tasks harian whenever they change
    localStorage.setItem('gendut_tasks', JSON.stringify(tasks));
    
    // Daily Reset Logic: Check if the date has changed
    const lastResetDate = localStorage.getItem('gendut_last_reset_date');
    const today = new Date().toDateString();
    
    if (lastResetDate && lastResetDate !== today) {
      // It's a new day! Clear daily tasks
      setTasks([]);
      setDailyRewardClaimed(false);
      // Reset feed count
      setFeedCountToday(0);
      setLastFedDate(today);
      localStorage.setItem('gendut_last_reset_date', today);
    } else if (!lastResetDate) {
      localStorage.setItem('gendut_last_reset_date', today);
    }
  }, [tasks]);

  useEffect(() => {
    // Persist macro goals whenever they change
    localStorage.setItem('gendut_macro_goals', JSON.stringify(macroGoals));
  }, [macroGoals]);

  useEffect(() => {
    // Background energy recovery during sleep
    if (!isSleeping) return;
    const interval = setInterval(() => {
      setEnergy(prev => {
        if (prev >= 100) {
          setIsSleeping(false);
          setTimeout(() => alert('🔋 Gendut sudah terbangun! Energiny telah terisi penuh 100% dan dia siap menemani aktivitas produktifmu!'), 150);
          return 100;
        }
        return Math.min(100, prev + 10);
      });
      setHappiness(prev => Math.min(100, prev + 3));
      setAffection(prev => Math.min(100, prev + 2));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSleeping]);

  useEffect(() => {
    // 6:00 AM Morning Reminder Check
    // Show on mount immediately as if 6:00 AM alarm went off today!
    const key = 'has_seen_6am_reminder_today';
    const todayStr = new Date().toDateString();
    const hasSeen = localStorage.getItem(key);
    if (hasSeen !== todayStr) {
      setShowMorningReminder(true);
      localStorage.setItem(key, todayStr);
    }
  }, []);

  const syncCalendarEventsToTasks = (events: CalendarEvent[]) => {
    const today = new Date();
    const todayStr = today.toDateString();
    
    // Filter calendar events happening today
    const todayEvents = events.filter(e => {
      if (!e.start) return false;
      const eventStart = e.start.dateTime ? new Date(e.start.dateTime) : (e.start.date ? new Date(e.start.date) : null);
      if (!eventStart) return false;
      return eventStart.toDateString() === todayStr;
    });

    if (todayEvents.length > 0) {
      setTasks(prev => {
        let updated = [...prev];
        let addedCount = 0;
        
        todayEvents.forEach(evt => {
          const isAlreadySync = updated.some(t => t.title === evt.summary);
          if (!isAlreadySync) {
            updated.unshift({
              id: Date.now() + Math.floor(Math.random() * 1000000),
              title: evt.summary,
              doc: `📅 Google Calendar • ${evt.start.dateTime ? new Date(evt.start.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'All Day'}`,
              xp: 150,
              priority: 'High',
              completed: false,
              ai: false
            });
            addedCount++;
          }
        });
        
        if (addedCount > 0) {
          // Increase Gendut happiness because a sync was successful!
          setHappiness(h => Math.min(100, h + 10));
          setTimeout(() => alert(`🔄 Sync Sukses! Berhasil mengimpor ${addedCount} agenda hari ini dari Google Calendar sebagai tugas harian Gendut!`), 100);
        }
        return updated;
      });
    }
  };

  const triggerSimulatedCalendarSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const simulatedEvents: CalendarEvent[] = [
        {
          id: 'sim-1',
          summary: 'Review Desain UI & Layout Mobile',
          start: { dateTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString() },
          end: { dateTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString() },
          description: 'Optimasi rendering untuk perangkat mobile dan tablet.'
        },
        {
          id: 'sim-2',
          summary: 'Sesi Kasih Makan Gendut Pagi',
          start: { dateTime: new Date(new Date().setHours(13, 30, 0, 0)).toISOString() },
          end: { dateTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString() },
          description: 'Memberi makan premium cat food hari ini.'
        },
        {
          id: 'sim-3',
          summary: 'Refactoring Logic Level Up System',
          start: { dateTime: new Date(new Date().setHours(16, 0, 0, 0)).toISOString() },
          end: { dateTime: new Date(new Date().setHours(17, 30, 0, 0)).toISOString() },
          description: 'Sinkronisasi skill profile dan level Gendut.'
        }
      ];
      setCalendarEvents(simulatedEvents);
      syncCalendarEventsToTasks(simulatedEvents);
      setIsSyncing(false);
    }, 1500);
  };

  useEffect(() => {
    const unsub = initAuth(
      (user) => { 
        setCurrentUser(user);
        setNeedsAuth(false); 
        fetchEvents(); 
      },
      () => {
        setCurrentUser(null);
        setNeedsAuth(true);
      }
    );
    return () => unsub();
  }, [currentMonthDate]);

  // Periodic sync to Firebase
  useEffect(() => {
    if (!currentUser) return;
    
    const syncData = async () => {
      try {
        await setDoc(doc(db, 'companion_status', currentUser.uid), {
          energy,
          happiness,
          hunger,
          affection,
          coins,
          level,
          updatedAt: Timestamp.now()
        }, { merge: true });
      } catch (err) {
        console.error("Sync failed:", err);
      }
    };

    const interval = setInterval(syncData, 60000); // sync every 1 minute
    return () => clearInterval(interval);
  }, [currentUser, energy, happiness, hunger, affection, coins, level]);

  // Load state once on login
  useEffect(() => {
    if (!currentUser) return;
    
    const loadState = async () => {
      try {
        const docRef = doc(db, 'companion_status', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.energy !== undefined) setEnergy(data.energy);
          if (data.happiness !== undefined) setHappiness(data.happiness);
          if (data.hunger !== undefined) setHunger(data.hunger);
          if (data.affection !== undefined) setAffection(data.affection);
          if (data.coins !== undefined) setCoins(data.coins);
          if (data.level !== undefined) setLevel(data.level);
        }
      } catch (err) {
        console.error("Initial load failed:", err);
      }
    };
    
    loadState();
  }, [currentUser]);

  // Sunday Weekly Summary Logic
  useEffect(() => {
    const checkSunday = () => {
      const now = new Date();
      if (now.getDay() === 0) { // Sunday
        const lastWeeklySummary = localStorage.getItem('last_weekly_summary');
        const todayStr = now.toDateString();
        
        if (lastWeeklySummary !== todayStr) {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          
          const weekTasks = tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt) > weekAgo);
          const weekGoals = macroGoals.filter(g => (g.progress || 0) === 100 && g.completedAt && new Date(g.completedAt) > weekAgo);
          
          setWeeklyStats({ 
            xp: weekTasks.length * 100 + weekGoals.length * 500, 
            goals: weekGoals.length 
          });
          setShowWeeklySummary(true);
          localStorage.setItem('last_weekly_summary', todayStr);
        }
      }
    };
    checkSunday();
  }, [tasks, macroGoals]);

  const handleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setNeedsAuth(false);
        fetchEvents();
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const fetchEvents = async () => {
    setIsSyncing(true);
    try {
      const startOfMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
      const endOfMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      const events = await fetchCalendarEvents(startOfMonth, endOfMonth);
      setCalendarEvents(events);
      syncCalendarEventsToTasks(events);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Styling Helpers based on theme
  const bgMain = isLightMode ? 'bg-stone-50 text-slate-800' : 'bg-[#020617] text-slate-100';
  const glassTheme = isLightMode ? 'glass-light' : 'glass';
  const borderTheme = isLightMode ? 'border-stone-200' : 'border-slate-800';
  const textMute = isLightMode ? 'text-stone-500' : 'text-slate-400';
  const textHighlight = isLightMode ? 'text-emerald-600' : 'text-emerald-400';

  const getCatAnimClass = () => {
    if (activeCatAnimation === 'spin') return 'cat-3d-spin';
    if (activeCatAnimation === 'jump') return 'cat-3d-jump';
    if (activeCatAnimation === 'wiggle') return 'cat-3d-wiggle';
    return 'cat-3d-breathe';
  };

  const getDynamicRadarData = () => {
    const completedTasksCount = tasks.filter(t => t.completed).length;
    const completedMacroCount = macroGoals.flatMap(g => g.todos || []).filter(t => t.completed).length;
    
    return [
      { subject: 'Deep Work', A: Math.min(150, 70 + completedMacroCount * 20), fullMark: 150 },
      { subject: 'Consistency', A: Math.min(150, 60 + completedTasksCount * 15), fullMark: 150 },
      { subject: 'Task Boxing', A: Math.min(150, 50 + completedTasksCount * 12 + completedMacroCount * 8), fullMark: 150 },
      { subject: 'Speed', A: Math.min(150, 50 + level * 3), fullMark: 150 },
      { subject: 'Energy Mgt', A: Math.min(150, energy), fullMark: 150 },
      { subject: 'Flow State', A: Math.min(150, affection), fullMark: 150 },
    ];
  };

  const checkMonthlyBonus = (updatedGoals: typeof macroGoals) => {
    if (monthlyRewardClaimed) return;
    const allTodos = updatedGoals.flatMap(g => g.todos || []);
    const completed = allTodos.filter(t => t.completed).length;
    const total = allTodos.length;
    if (total > 0 && (completed / total >= 0.65)) {
      setCoins(prev => prev + 250);
      setTickets(t => t + 1); // +1 Gacha Ticket reward!
      setMonthlyRewardClaimed(true);
      alert('🎉 Bonus Bulanan (65% task bulanan selesai):\nKamu mendapatkan +250 Koin 🪙 dan +1 Tiket Gacha 🎫!');
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTaskInput(prev => prev ? prev + ' ' + transcript : transcript);
    };

    recognition.start();
  };

  const toggleMacroTodo = (goalId: number, todoId: number) => {
    setMacroGoals(prev => {
      let isCompletedNow = false;
      const updatedGoals = prev.map(goal => {
        if (goal.id === goalId) {
          const updatedTodos = (goal.todos || []).map(t => {
            if (t.id === todoId) {
              if (t.completed) return t; // Lock completed state
              isCompletedNow = true;
              confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#22d3ee', '#34d399'] });
              return { ...t, completed: true };
            }
            return t;
          });
          const completedCount = updatedTodos.filter(t => t.completed).length;
          const total = updatedTodos.length;
          const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100);
          return { 
            ...goal, 
            todos: updatedTodos, 
            completed_tasks: completedCount, 
            tasks: total, 
            progress,
            completedAt: progress === 100 ? (goal.completedAt || new Date().toISOString()) : undefined
          };
        }
        return goal;
      });

      // Award XP & Companion growth on macro subtask completions!
      if (isCompletedNow) {
        setCoins(prev => prev + 20); // +20 coins for macro subtask
        setHappiness(prev => Math.min(100, prev + 5));
        setAffection(prev => Math.min(100, prev + 4));
        
        setPxp(prevProgress => {
          const nextProgress = prevProgress + 10; // +10 XP progress
          if (nextProgress >= 100) {
            setLevel(prevLvl => {
              const newLvl = prevLvl + 1;
              setTickets(t => t + 1); // +1 Gacha Ticket!
              setTimeout(() => {
                alert(`🎉 LEVEL UP! Gendut mencapai Level ${newLvl}!\nKamu mendapatkan bonus hadiah: +1 Tiket Gacha 🎫!`);
              }, 100);
              return newLvl;
            });
            return nextProgress % 100;
          }
          return nextProgress;
        });
      }

      setTimeout(() => checkMonthlyBonus(updatedGoals), 0);
      return updatedGoals;
    });
  };

  const deleteMacroTodo = (goalId: number, todoId: number) => {
    setMacroGoals(prev => {
      const updatedGoals = prev.map(goal => {
        if (goal.id === goalId) {
          const updatedTodos = (goal.todos || []).filter(t => t.id !== todoId);
          const completedCount = updatedTodos.filter(t => t.completed).length;
          const total = updatedTodos.length;
          const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100);
          return { 
            ...goal, 
            todos: updatedTodos, 
            completed_tasks: completedCount, 
            tasks: total, 
            progress,
            completedAt: progress === 100 ? (goal.completedAt || new Date().toISOString()) : undefined
          };
        }
        return goal;
      });
      return updatedGoals;
    });
  };

  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (expandedTaskId === id) setExpandedTaskId(null);
  };

  const deleteMacroGoal = (id: number) => {
    setMacroGoals(prev => prev.filter(g => g.id !== id));
    if (selectedMacroId === id) setSelectedMacroId(null);
  };

  const deleteMacroCategory = (category: string) => {
    setMacroGoals(prev => prev.filter(g => g.category !== category));
    setMacroCategoryFilter('All');
    setSelectedMacroId(null);
  };

  const handleAddMacroTodo = (e: React.FormEvent, goalId: number) => {
    e.preventDefault();
    if (!macroTodoInput.trim()) return;

    setMacroGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const newTodo = { id: Date.now(), title: macroTodoInput, completed: false };
        const updatedTodos = [...(goal.todos || []), newTodo];
        const completedCount = updatedTodos.filter(t => t.completed).length;
        const total = updatedTodos.length;
        const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100);
        return { 
          ...goal, 
          todos: updatedTodos, 
          completed_tasks: completedCount, 
          tasks: total, 
          progress,
          completedAt: progress === 100 ? (goal.completedAt || new Date().toISOString()) : undefined
        };
      }
      return goal;
    }));
    setMacroTodoInput('');
    setActiveMacroAdding(null);
  };

   const toggleTask = (id: number) => {
     const taskObj = tasks.find(t => t.id === id);
     if (!taskObj || taskObj.completed) return; // Lock if already completed
     
     if (isSleeping) {
       alert('😴 Gendut sedang tidur pulas! Bangunkan dia di menu "Habitat" untuk memulihkan tenaganya sebelum melakukan pekerjaan!');
       return;
     }
     if (energy < 5) {
       alert('⚠️ Energi Gendut terlalu rendah (< 5%)! Biarkan dia istirahat (Rest) di "Habitat" atau beri dia makan Premium Cat Food 🥩 di Toko untuk memulihkan tenaganya!');
       return;
     }

     setTasks(prevTasks => {
       const updatedTasks = prevTasks.map(t => t.id === id ? { ...t, completed: true, completedAt: new Date().toISOString() } : t);
       const target = prevTasks.find(t => t.id === id);
       
       if (target && !target.completed) {
         confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#22d3ee', '#34d399'] });
         setEnergy(prev => Math.max(0, prev - 5));
         setCoins(prev => prev + 50);
         
         // 1. Calculate XP increase from task XP
         const xpGain = Math.max(10, Math.round(target.xp / 10)); // minimum 10% progress
         setPxp(prevProgress => {
           const nextProgress = prevProgress + xpGain;
           if (nextProgress >= 100) {
             setLevel(prevLvl => {
               const newLvl = prevLvl + 1;
               setTickets(t => t + 1); // +1 Gacha Ticket reward!
               setTimeout(() => {
                 alert(`🎉 LEVEL UP! Gendut mencapai Level ${newLvl}!\nKamu mendapatkan bonus hadiah: +1 Tiket Gacha 🎫!`);
               }, 100);
               return newLvl;
             });
             return nextProgress % 100;
           }
           return nextProgress;
         });

         // 2. Increase Happiness (+8) and Affection (+6)
         setHappiness(prev => Math.min(100, prev + 8));
         setAffection(prev => Math.min(100, prev + 6));

         // 3. Earning Tickets chance (High or Critical gives 15% chance of finding a ticket)
         if (target.priority === 'Critical' || target.priority === 'High') {
           if (Math.random() < 0.15) {
             setTickets(t => t + 1);
             setTimeout(() => {
               alert(`🎫 Wow! Kamu menemukan bonus hoki sela-sela fokus: +1 Tiket Gacha diperoleh!`);
             }, 150);
           }
         }
       }

       if (!dailyRewardClaimed) {
         const completedCount = updatedTasks.filter(t => t.completed).length;
         const total = updatedTasks.length;
         if (total > 0 && (completedCount / total >= 0.65)) {
           setCoins(prev => prev + 250);
           setTickets(t => t + 1); // Extra +1 Gacha Ticket!
           setDailyRewardClaimed(true);
           setTimeout(() => alert('🎉 Bonus Harian Tercapai (65% task harian selesai):\nKamu mendapatkan +250 Koin 🪙 dan +1 Tiket Gacha 🎫!'), 200);
         }
       }

       return updatedTasks;
     });
   };

  const toggleSubtask = (taskId: number, subtaskId: number) => {
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = (t.subtasks || []).map(st => {
          if (st.id === subtaskId) {
            if (st.completed) return st; // Lock completed state
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#22d3ee', '#34d399'] });
            return { ...st, completed: true };
          }
          return st;
        });
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    }));
  };

  const addSubtask = (taskId: number, title: string) => {
    if (!title.trim()) return;
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id === taskId) {
        const newSub = { id: Date.now(), title: title.trim(), completed: false };
        const updatedSubtasks = [...(t.subtasks || []), newSub];
        let newDoc = t.doc;
        if (newDoc.includes('subtask')) {
          newDoc = newDoc.replace(/\d+\s*subtask/, `${updatedSubtasks.length} subtask`);
        } else {
          newDoc = `${updatedSubtasks.length} subtasks • ${newDoc}`;
        }
        return { 
          ...t, 
          subtasks: updatedSubtasks,
          doc: newDoc
        };
      }
      return t;
    }));
    setNewSubtaskTitle('');
  };

  const deleteSubtask = (taskId: number, subtaskId: number) => {
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = (t.subtasks || []).filter(st => st.id !== subtaskId);
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    }));
  };

  const updateTaskNotes = (taskId: number, notes: string) => {
    setTasks(prevTasks => prevTasks.map(t => 
      t.id === taskId ? { ...t, notes } : t
    ));
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    
    setShowTaskInput(false);
    setShowAiThinking(true);
    
    const newTaskTitle = taskInput;
    const priority = newTaskPriority;
    const dueDate = taskDueDate;
    setTaskInput('');
    setTaskDueDate('');
    setNewTaskPriority('Normal');
    
    setTimeout(() => {
      setShowAiThinking(false);
      const xpValue = priority === 'Critical' ? 450 : (priority === 'High' ? 200 : (priority === 'Normal' ? 120 : 50));
      const docStr = priority === 'Critical' 
        ? `Optimized via AI • 1.5h estimate • Critical`
        : `Optimized via AI • ${priority}`;
      setTasks([{ 
        id: Date.now(), 
        title: newTaskTitle, 
        doc: docStr, 
        xp: xpValue, 
        priority: priority, 
        completed: false, 
        ai: true,
        dueDate: dueDate 
      }, ...tasks]);
    }, 1500);
  };

  const addTaskAction = () => {
    setShowTaskInput(true);
  };

  const spinGachaNew = (tier: 'silver' | 'gold', payment: 'ticket' | 'coin') => {
    if (isGachaRolling) return;

    // Check payment
    if (payment === 'ticket') {
      const required = tier === 'silver' ? 1 : 3;
      if (tickets < required) {
        alert(`Kekurangan tiket! Butuh ${required} 🎫 untuk spin.`);
        return;
      }
      setTickets(t => t - required);
    } else {
      const required = tier === 'silver' ? 200 : 500;
      if (coins < required) {
        alert(`Kekurangan koin! Butuh ${required} 🪙 untuk spin.`);
        return;
      }
      setCoins(c => c - required);
    }

    setIsGachaRolling(true);

    // Determine target rarity
    const rand = Math.random() * 100;
    let chosenRarities: string[] = [];
    if (tier === 'silver') {
      if (rand < 60) chosenRarities = ['common'];
      else if (rand < 90) chosenRarities = ['rare'];
      else chosenRarities = ['epic'];
    } else {
      if (rand < 50) chosenRarities = ['epic'];
      else if (rand < 85) chosenRarities = ['legendary'];
      else chosenRarities = ['mythic'];
    }

    // Filter candidate items
    let candidates = GACHA_POOL.filter(item => chosenRarities.includes(item.rarity));
    if (candidates.length === 0) {
      candidates = GACHA_POOL; // fallback
    }

    // Prefer unowned items
    const unownedCandidates = candidates.filter(c => !inventory.some(inv => inv.id === c.id));
    const finalCandidates = unownedCandidates.length > 0 ? unownedCandidates : candidates;

    // Select randomly
    const rolledItem = finalCandidates[Math.floor(Math.random() * finalCandidates.length)];

    setTimeout(() => {
      setIsGachaRolling(false);
      setGachaReward(rolledItem);

      // Add to inventory
      setInventory(prev => {
        if (prev.some(p => p.id === rolledItem.id)) {
          // If already owned, give duplicate compensation coins
          setCoins(c => c + 150);
          return prev;
        }
        return [...prev, {
          id: rolledItem.id,
          icon: rolledItem.icon,
          rarity: rolledItem.rarity,
          equipped: false,
          type: rolledItem.type,
          name: rolledItem.name
        }];
      });
    }, 2500);
  };

  const handleMacroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!macroInputTitle.trim()) return;

    // Validation: prevent dates in the past
    if (macroInputDeadline) {
      const selectedDate = new Date(macroInputDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time for comparison
      if (selectedDate < today) {
        // We could use window.alert but better just return or handle silently if no toast system
        // The HTML5 min attribute will prevent this in standard UI, but this is safety
        return;
      }
    }

    setMacroGoals([
      {
        id: Date.now(),
        title: macroInputTitle,
        progress: 0,
        deadline: macroInputDeadline || 'TBD',
        tasks: 0,
        completed_tasks: 0,
        category: macroInputCategory || 'General',
        todos: []
      },
      ...macroGoals
    ]);
    
    setMacroInputTitle('');
    setMacroInputDeadline('');
    setMacroInputCategory('');
    setShowMacroInput(false);
  };

  const renderEquippedItems = (size: 'small' | 'large') => {
    return inventory.filter(i => i.equipped).map(item => {
      let posClass = '';
      const s = size === 'small';
      
      // Adjusted positions and sizes for a better "fit" and larger presence
      if (item.type === 'head') {
        posClass = s 
          ? '-top-6 left-1/2 -translate-x-1/2 text-5xl z-20 drop-shadow-md' 
          : '-top-12 left-1/2 -translate-x-1/2 text-9xl z-20 drop-shadow-xl';
      } else if (item.type === 'face') {
        posClass = s 
          ? 'top-4 left-1/2 -translate-x-1/2 text-4xl z-20 drop-shadow-md' 
          : 'top-12 left-1/2 -translate-x-1/2 text-8xl z-20 drop-shadow-xl';
      } else if (item.type === 'neck') {
        posClass = s 
          ? 'top-12 left-1/2 -translate-x-1/2 text-4xl z-20 drop-shadow-md' 
          : 'top-24 left-1/2 -translate-x-1/2 text-7xl z-20 drop-shadow-xl';
      } else if (item.type === 'bottomRight') {
        posClass = s 
          ? 'bottom-0 -right-4 text-4xl z-20 drop-shadow-md' 
          : 'bottom-0 -right-12 text-8xl z-20 drop-shadow-xl';
      } else if (item.type === 'bottomLeft') {
        posClass = s 
          ? 'bottom-0 -left-4 text-4xl z-20 drop-shadow-md' 
          : 'bottom-0 -left-12 text-8xl z-20 drop-shadow-xl';
      } else if (item.type === 'topRight') {
        posClass = s 
          ? '-top-4 -right-6 text-4xl animate-bounce z-20 drop-shadow-md' 
          : '-top-8 -right-16 text-8xl animate-bounce z-20 drop-shadow-xl';
      }
      
      return (
        <div key={item.id} className={`absolute ${posClass} pointer-events-none select-none`}>
          {item.icon}
        </div>
      );
    });
  };

  const renderNav = () => (
    <nav className={`h-16 border-b flex items-center justify-between px-4 sm:px-6 backdrop-blur-md z-50 ${isLightMode ? 'border-stone-200 bg-white/70' : 'border-slate-800 bg-slate-900/50'}`}>
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`lg:hidden p-2 rounded-xl border transition-colors ${
            isLightMode ? 'bg-stone-100 hover:bg-stone-200 border-stone-200' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
          }`}
        >
          <Menu size={16} />
        </button>

        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-lg sm:text-xl ${isLightMode ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-slate-950'}`}>V</div>
        <div>
          <h1 className={`text-sm sm:text-lg font-bold tracking-tight ${isLightMode ? 'text-stone-800' : 'text-white'} flex items-center`}>
            VibePlan <span className={`text-[9px] sm:text-xs font-normal px-1.5 py-0.5 rounded ml-1.5 uppercase tracking-widest ${isLightMode ? 'text-emerald-700 bg-emerald-600/10' : 'text-emerald-400 bg-emerald-400/10'}`}>Pro AI</span>
          </h1>
          <p className={`text-[8px] sm:text-[10px] -mt-1 uppercase tracking-tighter ${textMute}`}>Multimodal Gamified Ecosystem</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-6 lg:gap-8">
        {/* Companion Quick Stats HUD - Hidden on small mobile screens to prevent layout breakage */}
        <div className="hidden md:flex flex-col items-end">
          <div className="flex gap-2 items-center">
            <span className={`text-[10px] uppercase ${textMute}`}>Energy</span>
            <div className={`w-24 sm:w-32 h-2 rounded-full overflow-hidden border ${isLightMode ? 'bg-stone-200 border-stone-300' : 'bg-slate-800 border-slate-700'}`}>
              <div className="h-full bg-cyan-400 progress-glow transition-all" style={{ width: `${energy}%` }}></div>
            </div>
          </div>
          <div className="flex gap-2 items-center mt-1">
            <span className={`text-[10px] uppercase ${textMute}`}>Hunger</span>
            <div className={`w-24 sm:w-32 h-2 rounded-full overflow-hidden border ${isLightMode ? 'bg-stone-200 border-stone-300' : 'bg-slate-800 border-slate-700'}`}>
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${hunger}%` }}></div>
            </div>
          </div>
        </div>

        <div className={`hidden md:block h-10 w-px mx-2 ${borderTheme}`}></div>

        <div className="flex items-center gap-1.5 sm:gap-3 text-xs sm:text-sm font-medium">
          {/* Feature Info Guide Button */}
          <button
            onClick={() => setShowInfoGuides(true)}
            title="Panduan Info Fitur"
            className={`p-2 rounded-full transition-colors flex items-center justify-center ${
              isLightMode ? 'text-stone-500 hover:bg-stone-200' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <HelpCircle size={17} className="animate-pulse text-emerald-500" />
          </button>

          {/* Theme Toggle */}
          <button onClick={() => setIsLightMode(!isLightMode)} className={`p-2 rounded-full transition-colors ${isLightMode ? 'text-stone-500 hover:bg-stone-200' : 'text-slate-400 hover:bg-slate-800'}`}>
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Coins balance HUD */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border ${isLightMode ? 'bg-stone-100 border-stone-200 text-stone-700' : 'bg-slate-800/50 border-slate-700 text-white'}`}>
            <span className={isLightMode ? 'text-amber-500' : 'text-amber-400'}>🪙</span>
            <span className="font-bold text-xs sm:text-sm">{coins.toLocaleString()}</span>
          </div>

          {/* Gacha tickets HUD */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border ${isLightMode ? 'bg-stone-100 border-stone-200 text-stone-700' : 'bg-slate-800/50 border-slate-700 text-white'}`}>
            <span className={isLightMode ? 'text-emerald-600' : 'text-emerald-400'}>🎫</span>
            <span className="font-bold text-xs sm:text-sm">{tickets}</span>
          </div>

          {/* Google Calendar Sync Action */}
          {needsAuth ? (
            <button onClick={handleLogin} className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border flex items-center gap-1 sm:gap-2 ${isLightMode ? 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50' : 'bg-slate-800 text-white border-slate-600 hover:bg-slate-700'}`}>
              <LogIn size={12} /> <span className="hidden sm:inline">Sync</span> GCal
            </button>
          ) : (
            <button
              onClick={triggerSimulatedCalendarSync}
              title="Refresh / Sync Calendar"
              className={`p-2 rounded-full border flex items-center justify-center ${
                isLightMode ? 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              } ${isSyncing ? 'animate-spin border-emerald-500 text-emerald-500' : ''}`}
            >
              <RefreshCw size={13} />
            </button>
          )}

          {/* Gendut Level Counter */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-0.5">
            <div className={`w-full h-full rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${isLightMode ? 'bg-white text-emerald-700' : 'bg-slate-950 text-white'}`}>
              L.{level}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );

  const renderInfoModal = () => {
    if (!showInfoGuides) return null;
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <div className={`w-full max-w-2xl rounded-3xl border p-6 flex flex-col max-h-[85vh] overflow-y-auto ${isLightMode ? 'bg-white border-stone-200 text-stone-800' : 'bg-slate-900 border-slate-705 text-white animate-fade-in'}`}>
          <div className="flex justify-between items-center border-b pb-4 mb-4 border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="text-base sm:text-xl font-bold uppercase tracking-wider">Panduan Info Fitur VibePlan</h3>
                <p className={`text-xs ${textMute}`}>Panduan lengkap cara bermain dan produktivitas bersama Gendut</p>
              </div>
            </div>
            <button onClick={() => setShowInfoGuides(false)} className={`p-2 rounded-full transition-all ${isLightMode ? 'hover:bg-stone-100' : 'hover:bg-slate-800'}`}>
              <X size={18} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-stone-50 border-stone-200' : 'bg-white/5 border-white/5'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⚡</span>
                  <span className="font-bold text-sm uppercase">Command Center</span>
                </div>
                <p className={`text-xs ${textMute}`}>Panel utama produktivitas Anda. Tambahkan tugas harian, lakukan sinkronisasi Google Calendar secara realtime, dapatkan Insight AI untuk mengoptimalkan hari Anda, dan berikan kerja keras harian untuk XP Gendut.</p>
              </div>

              <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-stone-50 border-stone-200' : 'bg-white/5 border-white/5'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📅</span>
                  <span className="font-bold text-sm uppercase">Monthly Macro Tasks</span>
                </div>
                <p className={`text-xs ${textMute}`}>Fokus jangka panjang. Selesaikan target besar bulanan. Selesaikan 65% atau lebih dari subtask harian/bulanan Anda untuk melepaskan bonus instan +250 Koin dan Tiket Gacha spesial!</p>
              </div>

              <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-stone-50 border-stone-200' : 'bg-white/5 border-white/5'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🎰</span>
                  <span className="font-bold text-sm uppercase">Gacha Machine</span>
                </div>
                <p className={`text-xs ${textMute}`}>Waktunya bersenang-senang! Gunakan Tiket Gacha yang telah Anda menangkan karena menjadi produktif untuk menarik item kosmetik acak (Rarity: Common, Rare, Epic, Legendary, Mythic) yang bisa dipakai Gendut.</p>
              </div>

              <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-stone-50 border-stone-200' : 'bg-white/5 border-white/5'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🗄️</span>
                  <span className="font-bold text-sm uppercase">Inventory Vault</span>
                </div>
                <p className={`text-xs ${textMute}`}>Gudang penyimpanan pribadi Anda. Di sini Anda bisa memfilter semua item terperoleh, melengkapi/mencopot kosmetik (Top, Face, Neck, Accessories), serta memantau tampilan visual Gendut di Dinding Cermin Rias.</p>
              </div>

              <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-stone-50 border-stone-200' : 'bg-white/5 border-white/5'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🥩</span>
                  <span className="font-bold text-sm uppercase">Store & Feeding Gendut</span>
                </div>
                <p className={`text-xs ${textMute}`}>Gunakan koin hasil kerja Anda untuk membeli makanan Gendut (Koin 50). Beri makan Gendut secara teratur. Ingat, Gendut hanya boleh makan maksimal 2 kali sehari! Jika berlebihan, dia akan kenyang dan melarangnya!</p>
              </div>

              <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-stone-50 border-stone-200' : 'bg-white/5 border-white/5'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🐾</span>
                  <span className="font-bold text-sm uppercase">Gendut's Loft & 3D Motion</span>
                </div>
                <p className={`text-xs ${textMute}`}>Pantau level, kebahagiaan (happiness), dan kasih sayang (affection) Gendut. Di sini Anda juga bisa mendikte gaya pergerakan Gendut menggunakan teknologi 3D visual animasinya! Coba style Breathe, Spin, High Jump, dan Wiggle Walk!</p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border text-center ${isLightMode ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'}`}>
              <h4 className="font-bold text-xs uppercase mb-1">💡 LOGIKA LEVEL-UP GENDUT</h4>
              <p className="text-[11px] leading-relaxed">
                Setiap kali Anda menuntaskan tugas, Gendut memperoleh XP (PXP). Capai 100% PXP untuk melakukan <b>Level Up</b>. Level-up akan menaikkan level Gendut secara permanen dan menghadiahi Anda <b>+1 Tiket Gacha spesial</b> untuk bermain!
              </p>
            </div>
          </div>
          <button onClick={() => setShowInfoGuides(false)} className={`mt-6 w-full py-3 rounded-xl font-bold transition-all ${isLightMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'}`}>
            Saya Mengerti, Mari Produktif!
          </button>
        </div>
      </div>
    );
  };

  const renderMorningReminderModal = () => {
    if (!showMorningReminder) return null;
    return (
      <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[110] flex items-center justify-center p-4">
        <div className={`w-full max-w-md rounded-3xl border p-6 flex flex-col text-center ${isLightMode ? 'bg-white border-stone-200 text-stone-800' : 'bg-slate-900 border-slate-700 text-white animate-fade-in'}`}>
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
             <Bell size={28} className="text-emerald-400 animate-bounce" />
          </div>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mb-1">Alarm Pagi 06:00 AM 🌅</span>
          <h3 className="text-2xl font-black uppercase tracking-wide">Pengingat Jadwal Gendut</h3>
          
          <p className={`text-xs mt-3 leading-relaxed ${textMute}`}>
            Pagi hari adalah waktu terbaik memulai fokus! Agenda & tugas harian Anda hari ini sudah disinkronkan. Berikan Gendut makan pagi Premium Cat Food 🥩, selesaikan tugas-tugas harian & bulanan Anda hingga mencapai 65%+ untuk meraup <b>makanan gendut, koin ekstra, dan tiket gacha</b>.
          </p>

          <div className={`my-4 p-4 rounded-2xl border text-left space-y-2 text-xs ${isLightMode ? 'bg-stone-50 border-stone-200' : 'bg-white/5 border-white/5'}`}>
            <span className="font-bold uppercase tracking-wider block text-[10px] text-pink-500">Misi Pagi Hari:</span>
            <div className="flex justify-between items-center">
              <span>🍛 Kasih Makan Gendut (Sesi Pagi)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold">Harus 2x Sehari</span>
            </div>
            <div className="flex justify-between items-center">
              <span>📅 Sinkronisasi Google Calendar</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 font-bold">Auto</span>
            </div>
            <div className="flex justify-between items-center">
              <span>🎯 Target Harian & Bulanan (&gt;65%)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">Koin 250 + Tiket 1</span>
            </div>
          </div>

          <button onClick={() => setShowMorningReminder(false)} className={`w-full py-3 rounded-xl font-bold transition-all ${isLightMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'}`}>
            Siap, Mulai Hari Produktif!
          </button>
        </div>
      </div>
    );
  };

  const renderSidebar = () => {
    const tabs = [
      { id: 'command_center', icon: <Zap size={18} />, label: 'Pusat Komando' },
      { id: 'monthly_macro', icon: <Calendar size={18} />, label: 'Makro Bulanan' },
      { id: 'analytics', icon: <BarChart2 size={18} />, label: 'Analisis Mendalam' },
      { id: 'habitat', icon: <Home size={18} />, label: "Habitat Gendut" },
      { id: 'gacha', icon: <Gift size={18} />, label: 'Mesin Gacha' },
      { id: 'inventory', icon: <Package size={18} />, label: 'Gudang Inventaris' },
      { id: 'store', icon: <Store size={18} />, label: 'Toko Koin' },
    ];

    const sidebarContent = (isMobileLayout: boolean) => (
      <div className="flex-1 flex flex-col justify-between h-full">
        <div className="p-4 flex flex-col gap-1">
          <div className="flex justify-between items-center px-3 mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${textMute}`}>Navigation</span>
            {isMobileLayout && (
              <button onClick={() => setIsMobileMenuOpen(false)} className={`p-1 rounded-lg ${isLightMode ? 'hover:bg-stone-200' : 'hover:bg-slate-800'}`}>
                <X size={16} />
              </button>
            )}
          </div>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const activeClass = isLightMode ? 'tab-active-light text-emerald-700 font-bold' : 'tab-active text-emerald-400 font-bold';
            const inactiveClass = isLightMode ? 'text-stone-600 hover:bg-stone-200/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30';
            return (
              <div
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (isMobileLayout) {
                    setIsMobileMenuOpen(false);
                  }
                }}
                className={`flex items-center gap-3 p-3 cursor-pointer rounded-r-lg ${isActive ? activeClass : inactiveClass}`}
              >
                {tab.icon}
                <span className="text-sm">{tab.label}</span>
              </div>
            );
          })}
        </div>
        <div className={`p-4 border-t ${borderTheme} ${isLightMode ? 'bg-stone-100/50' : 'bg-slate-900/30'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] uppercase ${textMute}`}>Current Rank</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${textHighlight}`}>Vibe Master</span>
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLightMode ? 'bg-stone-300' : 'bg-slate-800'}`}>
            <div className={`h-full ${isLightMode ? 'bg-emerald-600' : 'bg-emerald-500'} transition-all`} style={{ width: `${pxp}%` }}></div>
          </div>
          <p className={`text-[10px] mt-2 text-center ${textMute}`}>PXP Progress: {pxp}% to Level {level + 1}</p>
        </div>
      </div>
    );

    return (
      <>
        {/* Persistent Desktop Sidebar */}
        <aside className={`hidden lg:flex w-60 border-r flex-col z-10 ${glassTheme} ${borderTheme}`}>
          {sidebarContent(false)}
        </aside>

        {/* Mobile Slide-out Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Dark fuzzy backdrop overlay */}
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Drawer sheet */}
            <div className={`w-64 max-w-[80vw] h-full relative flex flex-col z-10 border-r shadow-2xl transition-transform duration-300 ${isLightMode ? 'bg-stone-50 border-stone-200 text-stone-800' : 'bg-slate-900 border-slate-800 text-white'}`}>
              {sidebarContent(true)}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderCommandCenter = () => {
    const isTaskArchived = (t: any): boolean => {
      if (!t.completed || !t.completedAt) return false;
      const completedTime = new Date(t.completedAt).getTime();
      const elapsedMs = Date.now() - completedTime;
      return elapsedMs > 24 * 3600 * 1000; // 24 hours
    };

    const activeTasksCount = tasks.filter(t => !isTaskArchived(t)).length;
    const archivedTasksCount = tasks.filter(t => isTaskArchived(t)).length;

    const visibleTasks = tasks
      .filter(t => taskViewMode === 'Active' ? !isTaskArchived(t) : isTaskArchived(t))
      .filter(t => taskPriorityFilter === 'All' || t.priority === taskPriorityFilter);

    return (
      <section className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto animate-fade-in">
        <div className="grid grid-cols-2 gap-6 min-h-[300px]">
          {/* Task Box */}
          <div className={`${glassTheme} p-5 rounded-2xl flex flex-col relative overflow-hidden`}>
            {showAiThinking && (
               <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-sm ${isLightMode ? 'bg-white/80' : 'bg-slate-950/80'}`}>
                  <div className="hologram-scan"></div>
                  <BrainCircuit className="w-12 h-12 mb-4 animate-pulse text-cyan-500" />
                  <div className={`text-sm font-bold uppercase tracking-widest ${isLightMode ? 'text-stone-800' : 'text-white'}`}>Analyzing Schedule</div>
               </div>
            )}
            
            {/* Styled Header Switcher with Archive Indicator */}
            <div className="flex justify-between items-center mb-4 relative z-10 border-b pb-2.5 border-dashed border-slate-700/30">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setTaskViewMode('Active')} 
                  className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all border-b-2 flex items-center gap-1.5 ${
                    taskViewMode === 'Active' 
                      ? (isLightMode ? 'border-emerald-600 text-stone-900' : 'border-emerald-500 text-white') 
                      : 'border-transparent text-slate-500 hover:text-slate-400'
                  }`}
                >
                  Aktif 
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${taskViewMode === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-850 text-slate-500'}`}>
                    {activeTasksCount}
                  </span>
                </button>
                <button 
                  onClick={() => setTaskViewMode('Archive')} 
                  className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all border-b-2 flex items-center gap-1.5 ${
                    taskViewMode === 'Archive' 
                      ? (isLightMode ? 'border-emerald-600 text-stone-900' : 'border-emerald-500 text-white') 
                      : 'border-transparent text-slate-500 hover:text-slate-400'
                  }`}
                >
                  Arsip
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${taskViewMode === 'Archive' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-850 text-slate-500'}`}>
                    {archivedTasksCount}
                  </span>
                </button>
              </div>
              {!showTaskInput && taskViewMode === 'Active' && (
                <button onClick={addTaskAction} className={`text-[10px] px-3 py-1 rounded-full border ${isLightMode ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>+ NEW TASK</button>
              )}
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-2 relative z-10">
              {showTaskInput && (
                <form onSubmit={handleTaskSubmit} className={`p-4 rounded-xl border mb-3 ${isLightMode ? 'bg-white border-emerald-300 shadow-lg' : 'bg-slate-800/80 border-emerald-500/40 neon-glow'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isLightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>Quick Add/AI Input</span>
                    <X size={14} className={`cursor-pointer ${textMute} hover:text-red-500`} onClick={() => setShowTaskInput(false)} />
                  </div>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Type task, paste notes, or use Voice/Photo..." 
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    className={`w-full text-xs p-2 rounded-lg outline-none mb-2 border ${isLightMode ? 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400' : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500/50'}`}
                  />
                  <input 
                    type="date" 
                    value={taskDueDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className={`w-full text-[10px] p-2 rounded-lg outline-none mb-3 border ${isLightMode ? 'bg-stone-50 border-stone-200 text-stone-800' : 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500/50'}`}
                  />
                  
                  {/* Priority Selection for new task */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${textMute}`}>Select Priority:</span>
                    <div className="flex gap-1">
                      {(['Critical', 'High', 'Normal', 'Low'] as const).map((p) => {
                        const isActive = newTaskPriority === p;
                        const activeColors = p === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/40' : (p === 'High' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : (p === 'Normal' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-500/20 text-slate-400 border-slate-500/40'));
                        const activeColorsLight = p === 'Critical' ? 'bg-red-100 text-red-700 border-red-300' : (p === 'High' ? 'bg-amber-100 text-amber-700 border-amber-300' : (p === 'Normal' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-stone-200 text-stone-700 border-stone-300'));
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setNewTaskPriority(p)}
                            className={`text-[9px] px-2 py-0.5 rounded border transition-all ${isActive ? (isLightMode ? activeColorsLight : activeColors) : `border-transparent ${textMute} hover:opacity-80`}`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={startVoiceInput}
                        className={`p-1.5 rounded-md border transition-all ${isListening ? 'bg-red-500 text-white animate-pulse border-red-600' : (isLightMode ? 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-600' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400')}`} 
                        title="Voice Input (Mic)"
                      >
                        <Mic size={14} />
                      </button>
                      <button type="button" className={`p-1.5 rounded-md border ${isLightMode ? 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-600' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400'}`} title="Photo/Doodle"><ImageIcon size={14} /></button>
                      <button type="button" className={`p-1.5 rounded-md border ${isLightMode ? 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-600' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400'}`} title="Sticky Note Drag&Drop"><MessageSquare size={14} /></button>
                    </div>
                    <button type="submit" className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1 ${isLightMode ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-emerald-50 text-slate-900 border-emerald-400'}`}>
                      <Zap size={12} className={isLightMode ? 'text-amber-300' : 'text-slate-900'} /> TAMBAH TUGAS
                    </button>
                  </div>
                </form>
              )}
  
              {/* Task Priority Filter Toggles */}
              <div className={`flex flex-wrap gap-1.5 mb-3 pb-2 border-b border-dashed relative z-10 ${isLightMode ? 'border-stone-200' : 'border-slate-700/50'}`}>
                {(['All', 'Critical', 'High', 'Normal', 'Low'] as const).map(p => {
                  const count = p === 'All' 
                    ? tasks.filter(t => taskViewMode === 'Active' ? !isTaskArchived(t) : isTaskArchived(t)).length
                    : tasks.filter(t => (taskViewMode === 'Active' ? !isTaskArchived(t) : isTaskArchived(t)) && t.priority === p).length;
                  const isActive = taskPriorityFilter === p;
                  
                  let activeStyle = '';
                  if (p === 'All') {
                    activeStyle = isLightMode ? 'bg-cyan-100 text-cyan-800 border-cyan-300' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 neon-glow-cyan';
                  } else if (p === 'Critical') {
                    activeStyle = isLightMode 
                      ? 'bg-red-100 text-red-800 border-red-300 neon-glow-red-pulse' 
                      : 'bg-red-500/20 text-red-400 border-red-500/40 neon-glow-red-pulse';
                  } else if (p === 'High') {
                    activeStyle = isLightMode ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-500/20 text-amber-400 border-amber-500/40';
                  } else if (p === 'Normal') {
                    activeStyle = isLightMode ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
                  } else {
                    activeStyle = isLightMode ? 'bg-stone-200 text-stone-800 border-stone-300' : 'bg-slate-700 text-slate-300 border-slate-600';
                  }
  
                  const inactiveStyle = isLightMode 
                    ? 'bg-stone-50 border-stone-200 hover:bg-stone-100/70 text-stone-500' 
                    : 'bg-slate-900/40 border-slate-700/60 hover:bg-slate-800/40 text-slate-400';
  
                  return (
                    <button
                      key={p}
                      onClick={() => setTaskPriorityFilter(p)}
                      className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-lg border transition-all duration-200 flex items-center gap-1.5 ${isActive ? activeStyle : inactiveStyle}`}
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        {isActive && (
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            p === 'Critical' ? 'bg-red-400' : p === 'High' ? 'bg-amber-400' : p === 'Normal' ? 'bg-emerald-400' : p === 'All' ? 'bg-cyan-400' : 'bg-slate-400'
                          }`}></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                          p === 'Critical' ? 'bg-red-500' : p === 'High' ? 'bg-amber-500' : p === 'Normal' ? 'bg-emerald-500' : p === 'All' ? 'bg-cyan-400' : 'bg-slate-400'
                        }`}></span>
                      </span>
                      <span>{p}</span>
                      <span className="text-[8px] font-mono opacity-80 px-1 rounded-sm bg-black/10">{count}</span>
                    </button>
                  );
                })}
              </div>
  
              {visibleTasks.length === 0 && (
                <div className={`p-6 text-center text-xs italic ${textMute}`}>
                  No {taskPriorityFilter !== 'All' ? `${taskPriorityFilter} ` : ''} {taskViewMode === 'Archive' ? 'archived ' : ''}tasks found.
                </div>
              )}
  
              {visibleTasks.map(t => {
                const isCritical = t.priority === 'Critical';
                const isExpanded = expandedTaskId === t.id;
                const containerClass = t.completed 
                  ? (isLightMode ? 'bg-stone-100 border-stone-200 opacity-60' : 'bg-slate-800/20 border-slate-700/70 opacity-80') 
                  : (isCritical
                    ? (isLightMode 
                        ? 'bg-red-50/50 border-red-300 neon-glow-red-pulse shadow-md' 
                        : 'bg-red-950/20 border-red-500/60 neon-glow-red-pulse shadow-lg')
                    : (isLightMode ? 'bg-white border-stone-200 hover:shadow-md' : 'bg-slate-800/40 border-slate-700 hover:border-emerald-500/40')
                  );

                const totalSubtasks = t.subtasks?.length || 0;
                const completedSubtasks = t.subtasks?.filter((st: any) => st.completed).length || 0;
                const subtasksProgressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  
                return (
                  <div 
                    key={t.id} 
                    className={`flex flex-col p-3.5 rounded-xl border transition-all cursor-pointer select-none group ${containerClass} ${isExpanded ? (isLightMode ? 'ring-1 ring-emerald-500 border-emerald-350' : 'ring-1 ring-emerald-500/50 border-emerald-500/50') : ''}`}
                    onClick={() => setExpandedTaskId(isExpanded ? null : t.id)}
                  >
                    <div className="flex items-center w-full">
                      {/* Checkbox */}
                      <div 
                        onClick={(e) => { e.stopPropagation(); toggleTask(t.id); }} 
                        className={`w-5 h-5 rounded border-2 mr-4 flex items-center justify-center cursor-pointer shrink-0 transition-colors ${
                          t.completed 
                            ? (isLightMode ? 'bg-stone-305 border-stone-400 text-stone-500' : 'bg-emerald-500/20 border-emerald-500 text-emerald-400') 
                            : (isLightMode ? 'border-stone-400 hover:bg-stone-100' : 'border-slate-600 hover:bg-slate-700')
                        }`}
                      >
                        {t.completed && <CheckCircle2 size={13} className="stroke-[2.5]" />}
                      </div>

                      {/* Info block */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`text-xs font-semibold ${t.completed ? `line-through ${textMute}` : (isLightMode ? 'text-stone-800' : 'text-white')}`}>{t.title}</span>
                          {t.priority && (
                            <span className={`text-[8px] font-bold px-1 py-0.2 rounded uppercase border tracking-wide whitespace-nowrap ${
                              t.priority === 'Critical' 
                                ? (isLightMode ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-500/10 text-red-400 border-red-500/20')
                                : t.priority === 'High'
                                ? (isLightMode ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20')
                                : t.priority === 'Normal'
                                ? (isLightMode ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20')
                                : (isLightMode ? 'bg-stone-100 text-stone-600 border-stone-200' : 'bg-slate-800 text-slate-400 border-slate-700')
                            }`}>
                              {t.priority}
                            </span>
                          )}
                          {t.priority === 'Critical' && !t.completed && (
                            <TaskCountdown taskId={t.id} doc={t.doc} isLightMode={isLightMode} />
                          )}
                        </div>
                        <div className={`text-[10px] mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 ${textMute}`}>
                          <span>{t.doc}</span>
                          {t.dueDate && (
                            <span className={`inline-flex items-center gap-1 font-bold ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}>
                              <Calendar size={10} /> {new Date(t.dueDate).toLocaleDateString('id-ID')}
                            </span>
                          )}
                          {totalSubtasks > 0 && (
                            <span className={`inline-flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.2 rounded ${isLightMode ? 'bg-stone-200/50' : 'bg-slate-800 text-slate-400'}`}>
                              📋 {completedSubtasks}/{totalSubtasks}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* XP Reward text */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className={`text-xs font-mono font-bold ${t.completed ? textMute : textHighlight}`}>+{t.xp} XP</div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteTask(t.id); }}
                          className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 text-red-500`}
                          title="Hapus Tugas"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Expandable detailed drawer panel */}
                    {isExpanded && (
                      <div 
                        className={`mt-3.5 pt-3.5 border-t border-dashed w-full animate-fade-in ${
                          isLightMode ? 'border-stone-200' : 'border-slate-750'
                        }`}
                        onClick={(e) => e.stopPropagation()} // Stop bubbling
                      >
                        {/* Task Notes Textarea */}
                        <div className="mb-3.5">
                          <label className={`text-[9px] font-bold uppercase tracking-wider block mb-1.5 ${textMute}`}>Task Notes & Documentation</label>
                          <textarea
                            className={`w-full text-xs p-2.5 rounded-lg outline-none border focus:ring-1 resize-none h-20 transition-all ${
                              isLightMode 
                                ? 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400 focus:border-emerald-500/40 focus:ring-emerald-500/20' 
                                : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500/40 focus:ring-emerald-500/20'
                            }`}
                            placeholder="Add reference notes, web guidelines, or context details here..."
                            value={t.notes || ''}
                            onChange={(e) => updateTaskNotes(t.id, e.target.value)}
                          />
                        </div>

                        {/* Checklist indicator */}
                        <div className="pt-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold mb-1.5">
                            <span className={isLightMode ? 'text-stone-700' : 'text-slate-300'}>Subtask Progress Checklist</span>
                            <span className="font-mono text-[11px] text-emerald-400">
                              {completedSubtasks}/{totalSubtasks} completed ({subtasksProgressPercent}%)
                            </span>
                          </div>

                          {/* Progress bar container */}
                          <div className={`w-full h-1.5 rounded-full relative overflow-hidden mb-3 ${isLightMode ? 'bg-stone-200' : 'bg-slate-850'}`}>
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                              style={{ width: `${subtasksProgressPercent}%` }}
                            />
                          </div>

                          {/* Checklist item list */}
                          {t.subtasks && t.subtasks.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 mb-3">
                              {t.subtasks.map((st: any) => (
                                <div 
                                  key={st.id} 
                                  className={`flex items-center justify-between p-1.5 rounded-lg border group/sub transition-all ${
                                    isLightMode
                                      ? 'bg-stone-50/50 border-stone-150 hover:bg-stone-50'
                                      : 'bg-slate-900/30 border-slate-800/60 hover:bg-slate-900/60'
                                  }`}
                                >
                                  <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer text-[11px]">
                                    <input
                                      type="checkbox"
                                      checked={st.completed}
                                      onChange={() => toggleSubtask(t.id, st.id)}
                                      className="w-3.5 h-3.5 rounded border border-emerald-500 text-emerald-600 focus:ring-emerald-500 bg-transparent cursor-pointer"
                                    />
                                    <span className={`truncate leading-none ${st.completed ? `line-through opacity-50` : (isLightMode ? 'text-stone-700 font-medium' : 'text-slate-200 font-medium')}`}>
                                      {st.title}
                                    </span>
                                  </label>
                                  <button
                                    onClick={() => deleteSubtask(t.id, st.id)}
                                    className={`text-slate-500 hover:text-red-500 opacity-0 group-hover/sub:opacity-100 transition-opacity p-0.5 shrink-0`}
                                    title="Delete subtask"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className={`text-[10px] italic py-2 text-center ${textMute}`}>No subtasks yet. Add one below to breakdown this item!</div>
                          )}

                          {/* Add subtask mini input */}
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (newSubtaskTitle.trim()) {
                                addSubtask(t.id, newSubtaskTitle);
                              }
                            }}
                            className={`flex gap-1.5 mt-2.5 pt-2.5 border-t ${isLightMode ? 'border-stone-150' : 'border-slate-800'}`}
                          >
                            <input
                              type="text"
                              placeholder="New subtask name..."
                              value={newSubtaskTitle}
                              onChange={(e) => setNewSubtaskTitle(e.target.value)}
                              className={`flex-1 text-[11px] p-1.5 px-2.5 rounded-md outline-none border focus:ring-1 transition-all ${
                                isLightMode 
                                  ? 'bg-stone-50 border-stone-200 text-stone-800 focus:border-stone-300 focus:ring-stone-300/20' 
                                  : 'bg-slate-900 border-slate-700 text-white focus:border-slate-600 focus:ring-slate-600/20'
                              }`}
                            />
                            <button
                              type="submit"
                              className={`text-[10px] font-bold px-3 py-1.5 rounded-md border text-xs cursor-pointer select-none transition-all ${
                                isLightMode 
                                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-250 text-emerald-700' 
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/25 text-emerald-400'
                              }`}
                            >
                              Add Subtask
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {taskViewMode === 'Active' && (
                <div className={`flex items-center p-3 rounded-xl border border-dashed justify-center text-xs italic ${isLightMode ? 'border-stone-300 text-stone-500 bg-stone-50' : 'border-slate-700 text-slate-500 bg-slate-800/20'}`}>
                  AI is prioritizing more tasks...
                </div>
              )}
            </div>
          </div>

        {/* Heatmap Box */}
        <div className={`${glassTheme} p-5 rounded-2xl flex flex-col`}>
          <div className="flex justify-between items-start mb-4">
            <h2 className={`text-sm font-bold uppercase tracking-wider ${isLightMode ? 'text-stone-800' : 'text-white'}`}>Productivity Heatmap</h2>
            <span className={`text-[10px] ${textMute}`}>LAST 30 DAYS</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-10 gap-2">
              {(() => {
                const now = new Date();
                return Array.from({ length: 30 }, (_, i) => {
                  const d = new Date();
                  d.setDate(now.getDate() - (29 - i));
                  const dStr = d.toDateString();
                  const countTasks = tasks.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === dStr).length;
                  const countMacro = macroGoals.filter(g => g.completedAt && new Date(g.completedAt).toDateString() === dStr).length;
                  const val = countTasks + countMacro;
                  
                  let bg = isLightMode ? 'bg-stone-200' : 'bg-slate-800';
                  if (val > 3) bg = isLightMode ? 'bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.4)]' : 'bg-emerald-400 neon-glow';
                  else if (val > 2) bg = isLightMode ? 'bg-emerald-500' : 'bg-emerald-500';
                  else if (val > 1) bg = isLightMode ? 'bg-emerald-300' : 'bg-emerald-700';
                  else if (val > 0) bg = isLightMode ? 'bg-emerald-200' : 'bg-emerald-900/60';
                  return <div key={i} title={`${val} tasks completed on ${d.toLocaleDateString()}`} className={`w-6 h-6 rounded-md hover:scale-110 transition-transform ${bg}`}></div>
                });
              })()}
            </div>
          </div>
          <div className={`mt-4 p-3 rounded-lg border ${isLightMode ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-500/5 border-emerald-500/10'}`}>
            <div className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${textHighlight}`}>AI Insight</div>
            <p className={`text-[11px] italic leading-relaxed ${isLightMode ? 'text-stone-600' : 'text-slate-300'}`}>"Peak performing between 09:00 - 11:00. Schedule critical deep work there."</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-[300px]">
        {/* Workspace Snippet */}
        <div className={`flex-[1.5] rounded-3xl p-6 relative flex flex-col justify-end overflow-hidden group cursor-pointer ${isLightMode ? 'bg-stone-100 border border-stone-200 hover:shadow-md' : 'glass bg-gradient-to-t from-slate-900 via-slate-950 to-transparent hover:border-emerald-500/30'}`} onClick={() => setActiveTab('habitat')}>
          <div className={`absolute top-6 left-6 text-xs uppercase tracking-[0.2em] font-bold ${textMute}`}>Gendut's Workspace</div>
          <div className="absolute top-6 right-6 flex gap-2">
          </div>
          
          <div className="cat-pulse flex flex-col items-center mb-6 z-10">
              <div className="relative">
                <GendutCat size="small" animation={activeCatAnimation} energy={energy} happiness={happiness} isLightMode={isLightMode} isSleeping={isSleeping} />
                {renderEquippedItems('small')}
              </div>
            <div className={`px-4 py-1.5 rounded-full mt-4 flex items-center gap-2 ${isLightMode ? 'bg-white border border-stone-200' : 'bg-slate-900 border border-slate-700'}`}>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className={`text-[10px] font-bold uppercase ${isLightMode ? 'text-stone-800' : 'text-white'}`}>STATUS: FOCUSING</span>
            </div>
          </div>

          <div className={`flex justify-between items-center p-4 rounded-2xl border backdrop-blur-sm z-10 ${isLightMode ? 'bg-white/60 border-stone-200' : 'bg-white/5 border-white/10'}`}>
            <div className="flex gap-6">
              <div className="flex flex-col">
                <span className={`text-[10px] uppercase font-semibold ${textMute}`}>Happiness</span>
                <span className={`text-sm font-bold ${isLightMode ? 'text-stone-800' : 'text-white'}`}>{happiness}%</span>
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] uppercase font-semibold ${textMute}`}>Affection</span>
                <span className={`text-sm font-bold flex items-center gap-1 ${isLightMode ? 'text-stone-800' : 'text-white'}`}><Heart size={12} className="text-pink-500 fill-pink-500" /> LV.{Math.min(10, Math.floor(affection / 15) + 1)}</span>
              </div>
            </div>
            <div className="text-right">
            </div>
          </div>
        </div>

        {/* Vault Snippet */}
        <div className={`flex-1 rounded-3xl p-5 flex flex-col ${glassTheme}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-xs font-bold uppercase tracking-widest ${isLightMode ? 'text-stone-800' : 'text-white'}`}>Vault Inventory</h3>
            <ChevronRight size={16} className={`cursor-pointer ${textMute}`} onClick={() => setActiveTab('gacha')} />
          </div>
          <div className="grid grid-cols-3 grid-rows-3 gap-3 flex-1">
            {inventory.slice(0, 9).map((item, i) => {
              let bc = isLightMode ? 'border-stone-200 bg-stone-50' : 'border-slate-700 bg-slate-800';
              if (item.rarity === 'rare') bc = isLightMode ? 'border-blue-300 bg-blue-50' : 'border-blue-500/50 bg-slate-800';
              if (item.rarity === 'epic') bc = isLightMode ? 'border-purple-300 bg-purple-50' : 'border-purple-500/50 bg-slate-800';
              if (item.rarity === 'legendary') bc = isLightMode ? 'border-amber-400 bg-amber-50 shadow-sm' : 'border-amber-500/80 bg-slate-800 shadow-[0_0_10px_rgba(251,191,36,0.2)]';
              if (item.rarity === 'mythic') bc = isLightMode ? 'border-cyan-400 bg-cyan-50 shadow-sm' : 'border-cyan-500 bg-slate-800 shadow-[0_0_15px_rgba(34,211,238,0.4)]';

              return (
                <div key={item.id} onClick={() => toggleEquip(item.id)} className={`rounded-xl border flex items-center justify-center text-2xl relative cursor-pointer hover:scale-105 transition-transform ${bc} ${!item.equipped && i % 2 !== 0 ? 'opacity-50' : ''} ${!item.equipped ? 'opacity-50 grayscale' : 'shadow-md'}`}>
                  {item.equipped && <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 border-2 border-slate-900 rounded-full"></div>}
                  {item.icon}
                </div>
              );
            })}
          </div>
          <button onClick={() => setActiveTab('gacha')} className="mt-4 w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs py-3 rounded-xl uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20">
            Open Vault
          </button>
        </div>
      </div>
    </section>
  );
};

  const renderAnalytics = () => {
    // calculate dynamic RADAR_DATA
    const RADAR_DATA = getDynamicRadarData();

    // calculate daily metrics from tasks
    const completedDaily = tasks.filter(t => t.completed).length;
    const totalDaily = tasks.length;
    const dailyFocus = totalDaily > 0 ? Math.round((completedDaily / totalDaily) * 10) : 0;
    const dailyEnergy = totalDaily > 0 ? Math.round(50 + (completedDaily / totalDaily) * 50) : 50;
    
    const currentDailyChartData = [...ANALYTICS_DATA];
    currentDailyChartData[6] = { day: 'Today', focus: dailyFocus, energy: dailyEnergy };

    // calculate monthly metrics from macro goals
    const allMonthlyTodos = macroGoals.flatMap(g => g.todos || []);
    const completedMonthly = allMonthlyTodos.filter(t => t.completed).length;
    const totalMonthly = allMonthlyTodos.length;
    const monthlyFocusRatio = totalMonthly > 0 ? (completedMonthly / totalMonthly) : 0;
    const monthlyFocus = Math.round(monthlyFocusRatio * 10);
    const monthlyEnergy = Math.round(50 + monthlyFocusRatio * 50);

    const getDynamicMonthlyData = (monthIndex: number) => {
      // Return 4 weeks for the selected month to show weekly aggregates
      return [
        { day: 'Week 1', focus: Math.floor(5 + Math.sin(monthIndex * 1.1) * 2), energy: Math.floor(70 + Math.cos(monthIndex * 1.5) * 12) },
        { day: 'Week 2', focus: Math.floor(7 + Math.cos(monthIndex * 1.3) * 1.5), energy: Math.floor(82 + Math.sin(monthIndex * 1.8) * 8) },
        { day: 'Week 3', focus: Math.floor(4 + Math.sin(monthIndex * 1.6) * 2), energy: Math.floor(65 + Math.cos(monthIndex * 1.1) * 10) },
        { day: 'Week 4', focus: Math.min(10, Math.max(2, Math.floor(monthlyFocus !== 0 ? monthlyFocus : 8))), energy: Math.min(100, Math.max(30, Math.floor(monthlyEnergy !== 50 ? monthlyEnergy : 85))) }
      ];
    }

    const chartData = analyticsPeriod === 'daily' ? currentDailyChartData : (analyticsMonth !== null ? getDynamicMonthlyData(analyticsMonth) : []);
    
    // Data for daily pie chart
    const dailyPieData = [
      { name: 'Completed', value: completedDaily, color: isLightMode ? '#059669' : '#10b981' },
      { name: 'Remaining', value: Math.max(0, totalDaily - completedDaily), color: isLightMode ? '#e7e5e4' : '#1e293b' }
    ];

    return (
    <section className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto animate-fade-in">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${isLightMode ? 'text-stone-900' : 'text-white'}`}>Deep Analytics Cockpit</h2>
          <p className={`text-sm ${textMute}`}>Real-time performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center p-1 rounded-xl border ${isLightMode ? 'bg-stone-50 border-stone-200' : 'bg-slate-800/40 border-slate-700'}`}>
            <button 
              onClick={() => { setAnalyticsPeriod('daily'); setAnalyticsMonth(null); }} 
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${analyticsPeriod === 'daily' ? (isLightMode ? 'bg-emerald-600 text-white shadow' : 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]') : (isLightMode ? 'text-stone-500 hover:text-stone-700' : 'text-slate-500 hover:text-slate-300')}`}
            >
              Daily
            </button>
            <button 
              onClick={() => { setAnalyticsPeriod('monthly'); setAnalyticsMonth(null); }} 
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${analyticsPeriod === 'monthly' ? (isLightMode ? 'bg-cyan-600 text-white shadow' : 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]') : (isLightMode ? 'text-stone-500 hover:text-stone-700' : 'text-slate-500 hover:text-slate-300')}`}
            >
              Monthly
            </button>
          </div>
          <div className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border ${isLightMode ? 'bg-amber-100/50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
             {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      {analyticsPeriod === 'daily' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div className={`p-6 rounded-[2rem] flex flex-col items-center justify-center gap-4 ${glassTheme}`}>
            <div className="relative w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dailyPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {dailyPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className={`text-2xl font-black ${isLightMode ? 'text-stone-900' : 'text-white'}`}>
                  {totalDaily > 0 ? Math.round((completedDaily / totalDaily) * 100) : 0}%
                </span>
                <span className={`text-[8px] uppercase font-bold tracking-widest ${textMute}`}>Done</span>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-[2rem] col-span-2 flex flex-col justify-center ${glassTheme}`}>
            <h4 className={`text-xs font-bold uppercase tracking-widest mb-4 ${textMute}`}>Daily Summary</h4>
            <div className="grid grid-cols-1 gap-4 translate-x-4 translate-y-4">
               <div className={`mt-[6px] mb-[6px] ml-[5px] mr-[5px] p-4 rounded-2xl border ${isLightMode ? 'bg-amber-50 border-amber-100' : 'bg-amber-500/5 border-amber-500/10'}`}>
                 <span className={`text-[10px] font-bold uppercase tracking-widest text-amber-500`}>Coins Earned Today</span>
                 <p className={`text-xl font-black ${isLightMode ? 'text-stone-900' : 'text-white'}`}>
                   🪙 {completedDaily * 50}
                 </p>
               </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-6 min-h-[300px]">
        <div className={`col-span-2 p-5 rounded-2xl flex flex-col ${glassTheme}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xs font-bold uppercase tracking-widest ${isLightMode ? 'text-stone-800' : 'text-slate-300'}`}>
              {analyticsPeriod === 'daily' ? 'Weekly Energy vs Focus' : (analyticsMonth !== null ? `${MONTHS[analyticsMonth]} Energy vs Focus` : 'Select Month')}
            </h3>
            {analyticsPeriod === 'monthly' && analyticsMonth !== null && (
              <button 
                onClick={() => setAnalyticsMonth(null)}
                className={`text-[10px] px-3 py-1 rounded-full border transition-colors ${isLightMode ? 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
              >
                Change Month
              </button>
            )}
          </div>
          <div className="flex-1 w-full h-full min-h-[220px]">
             {analyticsPeriod === 'monthly' && analyticsMonth === null ? (
               <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in">
                  <p className={`text-sm italic ${textMute}`}>Select a month to view insights</p>
                  <div className="grid grid-cols-4 gap-3 w-full max-w-md">
                    {MONTHS.map((m, i) => (
                      <button 
                        key={m} 
                        onClick={() => setAnalyticsMonth(i)} 
                        className={`py-3 px-2 rounded-xl text-xs font-bold border transition-transform hover:scale-105 active:scale-95 ${isLightMode ? 'bg-white border-cyan-200 text-cyan-700 hover:shadow-md' : 'bg-slate-800/80 border-cyan-500/30 text-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.2)]'}`}
                      >
                        {m.substring(0, 3).toUpperCase()}
                      </button>
                    ))}
                  </div>
               </div>
             ) : (
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke={isLightMode ? '#a8a29e' : '#475569'} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={isLightMode ? '#a8a29e' : '#475569'} fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: isLightMode ? '#fff' : '#0f172a', borderColor: isLightMode ? '#e7e5e4' : '#1e293b' }} />
                <Area type="monotone" dataKey="energy" stroke="#22d3ee" fillOpacity={1} fill="url(#colorEnergy)" />
                <Area type="monotone" dataKey="focus" stroke="#10b981" fillOpacity={1} fill="url(#colorFocus)" />
              </AreaChart>
             </ResponsiveContainer>
             )}
          </div>
        </div>
        <div className={`p-5 rounded-2xl flex flex-col items-center justify-center ${glassTheme}`}>
           <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 self-start w-full ${isLightMode ? 'text-stone-800' : 'text-slate-300'}`}>Skill Profile</h3>
           <div className="w-full h-full min-h-[220px]">
             <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_DATA}>
                  <PolarGrid stroke={isLightMode ? '#e7e5e4' : '#334155'} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: isLightMode ? '#57534e' : '#94a3b8', fontSize: 10 }} />
                  <Radar name="Vibe" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                </RadarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {analyticsPeriod === 'monthly' && analyticsMonth !== null && (
        <div className={`p-6 rounded-2xl border transition-all animate-fade-in ${glassTheme} ${borderTheme}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">📊</span>
            <div>
              <h3 className={`text-base font-bold uppercase tracking-wider ${isLightMode ? 'text-stone-800' : 'text-white'}`}>
                Rekap Bulanan: {MONTHS[analyticsMonth]}
              </h3>
              <p className={`text-xs ${textMute}`}>Ringkasan performa harian Gendut yang dikelompokkan per minggu</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(wIndex => {
              const weekData = getDynamicMonthlyData(analyticsMonth)[wIndex - 1];
              return (
                <div key={wIndex} className={`p-4 rounded-xl border flex flex-col gap-2 ${isLightMode ? 'bg-stone-100/50 border-stone-200' : 'bg-slate-800/35 border-slate-800'}`}>
                  <span className={`text-xs font-bold uppercase tracking-wider ${textHighlight}`}>Minggu ke-{wIndex}</span>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className={textMute}>Fokus Harian:</span>
                    <span className="font-bold flex items-center gap-1 text-emerald-500">🎯 {weekData.focus}/10</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className={textMute}>Rata-rata Energi:</span>
                    <span className="font-bold flex items-center gap-1 text-cyan-400">⚡ {weekData.energy}%</span>
                  </div>
                  <div className="mt-2 text-[10px] uppercase font-bold tracking-widest text-center py-1 rounded bg-emerald-500/10 text-emerald-500">
                    Selesai & Stabil
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
    );
  };

  const renderMonthlyMacro = () => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const completionCounts = Array.from({ length: daysInMonth }, (_, i) => {
      const dayDate = new Date(now.getFullYear(), now.getMonth(), i + 1);
      const dayStr = dayDate.toDateString();
      const countTasks = tasks.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === dayStr).length;
      const countMacro = macroGoals.filter(g => g.completedAt && new Date(g.completedAt).toDateString() === dayStr).length;
      return countTasks + countMacro;
    });

    const filteredMacroGoals = macroGoals.filter(goal => 
      macroCategoryFilter === 'All' || goal.category === macroCategoryFilter
    );

    const selectedMacro = macroGoals.find(g => g.id === selectedMacroId);

    return (
    <section className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto animate-fade-in">
      <div className={`p-8 rounded-3xl relative overflow-hidden flex justify-between items-center ${isLightMode ? 'bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-100' : 'glass bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border-emerald-500/30'}`}>
        <div>
          <h2 className={`text-3xl font-bold tracking-tight mb-2 ${isLightMode ? 'text-stone-900' : 'text-white'}`}>Komitmen Makro</h2>
          <p className={`text-sm ${textMute}`}>Visualisasi progres dan pelacakan target jangka panjang.</p>
        </div>
        <button onClick={() => setShowMacroInput(true)} className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest border shadow-lg transition-transform hover:scale-105 active:scale-95 ${isLightMode ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/20' : 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/20'}`}>
          + Tambah Target
        </button>
      </div>

      {/* Category Selection Filter */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className={textMute} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${textMute}`}>Kategori:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['All', ...Array.from(new Set(macroGoals.map(g => g.category || 'Uncategorized')))] as string[]).map((cat: string) => (
            <div key={cat} className="relative group">
              <button
                onClick={() => {
                  setMacroCategoryFilter(cat);
                  setSelectedMacroId(null); // Reset selection when filter changes
                }}
                className={`text-[10px] px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${macroCategoryFilter === cat ? (isLightMode ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]') : (isLightMode ? 'bg-white text-stone-500 border-stone-200' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750')}`}
              >
                {cat === 'All' ? 'Semua' : cat}
              </button>
              {cat !== 'All' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteMacroCategory(cat); }}
                  className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10`}
                  title={`Hapus Kategori ${cat}`}
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Macro Buttons (Switcher) */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className={textHighlight} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isLightMode ? 'text-stone-700' : 'text-slate-300'}`}>Pilih Target</span>
          </div>
          <div className="flex lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0 lg:overflow-visible no-scrollbar">
            {filteredMacroGoals.map(goal => (
              <div key={goal.id} className="relative group/goal">
                <button 
                  onClick={() => setSelectedMacroId(goal.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all relative ${selectedMacroId === goal.id 
                    ? (isLightMode ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/10 shadow-md' : 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]') 
                    : (isLightMode ? 'bg-stone-50 border-stone-200 hover:border-stone-300' : 'bg-slate-800/40 border-slate-700 hover:border-slate-600 text-slate-400')}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-1.5 flex-wrap">
                      <span className={`text-[8px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded border ${selectedMacroId === goal.id ? 'border-emerald-500/30 text-emerald-500' : textMute}`}>{goal.category}</span>
                      {goal.progress === 100 && (
                        <span className="text-[8px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">SELESAI</span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold ${goal.progress === 100 ? 'text-emerald-500' : 'text-emerald-500/70'}`}>{goal.progress}%</span>
                  </div>
                  <h3 className={`text-sm font-bold truncate pr-6 ${selectedMacroId === goal.id ? (isLightMode ? 'text-stone-900' : 'text-white') : (goal.progress === 100 ? 'text-emerald-500/60' : textMute)}`}>{goal.title}</h3>
                  {selectedMacroId === goal.id && (
                    <div className="absolute right-3 bottom-3">
                       <ChevronRight size={14} className="text-emerald-500" />
                    </div>
                  )}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteMacroGoal(goal.id); }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover/goal:opacity-100 transition-opacity hover:bg-red-500 hover:text-white z-10"
                  title="Hapus Target"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {filteredMacroGoals.length === 0 && (
              <div className={`p-4 rounded-2xl border border-dashed text-center ${textMute} text-[10px]`}>
                Tidak ada target aktif dalam kategori ini.
              </div>
            )}
          </div>
        </div>

        {/* Selected Macro Details & Milestones */}
        <div className="lg:col-span-2">
           {selectedMacro ? (
             <div className={`p-6 rounded-3xl border animate-fade-in ${glassTheme} ${borderTheme} shadow-xl`}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className={`text-xl font-bold mb-1 ${isLightMode ? 'text-stone-900' : 'text-white'}`}>{selectedMacro.title}</h3>
                    <p className={`text-xs ${textMute}`}>Batas Waktu: <span className="font-bold text-emerald-500">{selectedMacro.deadline}</span></p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full ${isLightMode ? 'bg-stone-100 text-stone-500' : 'bg-slate-800 text-slate-400'}`}>{selectedMacro.category}</span>
                    <button 
                      onClick={() => deleteMacroGoal(selectedMacro.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${isLightMode ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                    >
                      <Trash2 size={10} />
                      Hapus Target
                    </button>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-end">
                    <span className={`text-xs font-bold uppercase tracking-widest ${textMute}`}>Progress Keseluruhan</span>
                    <span className={`text-lg font-mono font-bold ${textHighlight}`}>{selectedMacro.progress}%</span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden ${isLightMode ? 'bg-stone-200' : 'bg-slate-800'}`}>
                    <div className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-700" style={{ width: `${selectedMacro.progress}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 border-b pb-2 border-dashed border-slate-700/30">
                  <Activity size={16} className="text-emerald-500" />
                  <h4 className={`text-xs font-bold uppercase tracking-widest ${isLightMode ? 'text-stone-700' : 'text-slate-300'}`}>Milestones & Subtasks</h4>
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                  {(selectedMacro.todos || []).map(todo => (
                    <div 
                      key={todo.id} 
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${todo.completed 
                        ? (isLightMode ? 'bg-emerald-50/30 border-emerald-100' : 'bg-emerald-500/5 border-emerald-500/20') 
                        : (isLightMode ? 'bg-stone-50 border-stone-200 hover:border-emerald-300' : 'bg-slate-800/40 border-slate-700 hover:border-emerald-500/40')}`}
                    >
                      <div 
                        className="flex-1 flex items-center gap-4"
                        onClick={() => toggleMacroTodo(selectedMacro.id, todo.id)}
                      >
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${todo.completed 
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                          : (isLightMode ? 'border-stone-300 group-hover:border-emerald-500' : 'border-slate-600 group-hover:border-emerald-500')}`}
                        >
                          {todo.completed && <CheckCircle2 size={14} className="stroke-[3]" />}
                        </div>
                        <span className={`text-sm font-medium transition-all ${todo.completed ? (isLightMode ? 'text-stone-400 line-through' : 'text-slate-500 line-through') : (isLightMode ? 'text-stone-800 font-bold' : 'text-white')}`}>
                          {todo.title}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteMacroTodo(selectedMacro.id, todo.id); }}
                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 text-red-500"
                        title="Hapus Milestone"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {activeMacroAdding === selectedMacro.id ? (
                    <form onSubmit={(e) => handleAddMacroTodo(e, selectedMacro.id)} className="flex items-center gap-2 mt-4 animate-fade-in">
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="Apa misi selanjutnya?" 
                        value={macroTodoInput}
                        onChange={(e) => setMacroTodoInput(e.target.value)}
                        className={`flex-1 text-sm p-3 rounded-2xl outline-none border transition-all ${isLightMode ? 'bg-white border-emerald-300 text-stone-800 focus:ring-2 ring-emerald-500/10' : 'bg-slate-900 border-emerald-500/40 text-white focus:shadow-[0_0_15px_rgba(16,185,129,0.1)]'}`}
                      />
                      <button type="submit" className={`p-3 rounded-2xl bg-emerald-500 text-slate-900 font-bold`}><Plus size={20} /></button>
                      <X size={20} className={`cursor-pointer ${isLightMode ? 'text-stone-400' : 'text-slate-500'} hover:text-red-500`} onClick={() => {setActiveMacroAdding(null); setMacroTodoInput('');}} />
                    </form>
                  ) : (
                    <button 
                      onClick={() => setActiveMacroAdding(selectedMacro.id)} 
                      className={`flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed transition-all mt-4 ${isLightMode ? 'border-stone-300 text-stone-500 hover:bg-stone-50' : 'border-slate-700 text-slate-500 hover:bg-slate-800/40 hover:text-emerald-400 hover:border-emerald-500/30'}`}
                    >
                      <Plus size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">Tambah Milestone Baru</span>
                    </button>
                  )}
                </div>
             </div>
           ) : (
             <div className={`p-12 rounded-3xl border border-dashed text-center flex flex-col items-center justify-center gap-4 ${isLightMode ? 'bg-stone-50 border-stone-200' : 'bg-slate-900/50 border-slate-700'}`}>
                <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center text-3xl mb-2">🔍</div>
                <h3 className={`text-lg font-bold ${isLightMode ? 'text-stone-700' : 'text-slate-300'}`}>Pilih target makro untuk melihat detail progres hari ini.</h3>
                <p className={`text-sm max-w-xs ${textMute}`}>Gendut butuh panduanmu untuk memecah target besar ini menjadi tugas-tugas kecil yang menyenangkan!</p>
             </div>
           )}
        </div>

        {/* Legend / Stats Box */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className={`${glassTheme} p-6 rounded-3xl border ${borderTheme} flex flex-col gap-4 shadow-xl`}>
             <div className="flex items-center gap-2 mb-2">
                <BarChart2 size={16} className="text-cyan-400" />
                <h4 className={`text-xs font-bold uppercase tracking-widest ${isLightMode ? 'text-stone-800' : 'text-white'}`}>Statistik Bulanan</h4>
             </div>
             <div className="grid grid-cols-1 gap-4">
                <div className={`p-4 rounded-2xl ${isLightMode ? 'bg-stone-100' : 'bg-slate-800/40'} border ${borderTheme}`}>
                   <span className={`text-[10px] font-bold uppercase tracking-widest ${textMute}`}>Task Selesai</span>
                   <div className="flex items-end gap-2 mt-1">
                      <span className={`text-2xl font-bold ${isLightMode ? 'text-stone-900' : 'text-white'}`}>{macroGoals.flatMap(g => g.todos || []).filter(t => t.completed).length}</span>
                      <span className={`text-xs mb-1 font-bold text-emerald-500`}>Total</span>
                   </div>
                </div>
                <div className={`p-4 rounded-2xl ${isLightMode ? 'bg-stone-100' : 'bg-slate-800/40'} border ${borderTheme}`}>
                   <span className={`text-[10px] font-bold uppercase tracking-widest ${textMute}`}>Koin Terkumpul</span>
                   <div className="flex items-end gap-2 mt-1">
                      <span className={`text-2xl font-bold text-amber-500`}>+1.2k</span>
                      <span className="text-[10px] mb-1 font-bold text-amber-500/60 uppercase tracking-tighter">ESTIMASI</span>
                   </div>
                </div>
             </div>
          </div>

          <div className={`${glassTheme} p-6 rounded-3xl border border-emerald-500/20 flex flex-col gap-3 shadow-[0_0_30px_rgba(16,185,129,0.05)]`}>
             <div className={`text-[10px] font-bold uppercase tracking-[0.2em] ${textHighlight}`}>Companion Perk</div>
             <p className={`text-xs leading-relaxed ${isLightMode ? 'text-stone-600' : 'text-slate-300'}`}>"Fokus pada target Makro akan mempercepat pertumbuhan <span className="font-bold text-white">Gendut</span> dan membuka item langka di Toko!"</p>
             <div className="flex justify-center py-2">
                <div className="text-4xl animate-bounce">🧧</div>
             </div>
          </div>
        </div>
      </div>

      {/* Completion Heatmap */}
      <div className={`p-6 rounded-3xl border ${glassTheme} ${borderTheme}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" />
            <h3 className={`text-sm font-bold uppercase tracking-widest ${isLightMode ? 'text-stone-800' : 'text-white'}`}>Heatmap Aktivitas</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-slate-500">
            <span>Sedikit</span>
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-slate-800"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-900/40"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-700/60"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]"></div>
            </div>
            <span>Banyak</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {completionCounts.map((val, i) => {
            let bg = isLightMode ? 'bg-stone-100' : 'bg-slate-800';
            if (val === 1) bg = 'bg-emerald-900/40';
            if (val === 2) bg = 'bg-emerald-700/60';
            if (val === 3) bg = 'bg-emerald-500';
            if (val > 3) bg = 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]';
            
            return (
              <div 
                key={i} 
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all hover:scale-110 cursor-help ${bg} ${isLightMode ? 'border-stone-200 text-stone-500' : 'border-slate-700/50 text-white/50'}`}
                title={`${val} tugas diselesaikan pada Hari ke-${i + 1}`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      </div>

      {showMacroInput && (
        <form onSubmit={handleMacroSubmit} className={`fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in`}>
          <div className={`w-full max-w-xl p-6 rounded-3xl flex flex-col gap-4 border shadow-2xl ${isLightMode ? 'bg-white border-emerald-300' : 'bg-slate-900 border-emerald-500/40 neon-glow'}`}>
            <div className="flex items-center justify-between">
               <h3 className={`text-lg font-bold uppercase tracking-widest ${isLightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>Buat Komitmen Baru</h3>
               <X size={20} className={`cursor-pointer ${textMute} hover:text-red-500`} onClick={() => setShowMacroInput(false)} />
            </div>
            <div className="flex flex-col gap-4">
               <div>
                  <label className={`text-[10px] font-bold uppercase tracking-widest block mb-2 ${textMute}`}>Nama Target</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Contoh: Belajar React Native App" 
                    value={macroInputTitle}
                    onChange={(e) => setMacroInputTitle(e.target.value)}
                    className={`w-full text-sm p-4 rounded-2xl border outline-none ${isLightMode ? 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400 focus:border-emerald-500' : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500/50'}`}
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-widest block mb-2 ${textMute}`}>Kategori</label>
                    <select 
                      value={macroInputCategory}
                      onChange={(e) => setMacroInputCategory(e.target.value)}
                      className={`w-full text-sm p-4 rounded-2xl border outline-none ${isLightMode ? 'bg-stone-50 border-stone-200 text-stone-800 focus:border-emerald-500' : 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500/50'}`}
                    >
                      <option value="" disabled>Pilih Kategori</option>
                      <option value="Kerja">Pekerjaan</option>
                      <option value="Pribadi">Pribadi</option>
                      <option value="Kesehatan">Kesehatan</option>
                      <option value="Belajar">Belajar</option>
                    </select>
                  </div>
                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-widest block mb-2 ${textMute}`}>Batas Waktu</label>
                    <input 
                      type="date" 
                      value={macroInputDeadline}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setMacroInputDeadline(e.target.value)}
                      className={`w-full text-sm p-4 rounded-2xl border outline-none ${isLightMode ? 'bg-stone-50 border-stone-200 text-stone-800 focus:border-emerald-500' : 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500/50'}`}
                    />
                  </div>
               </div>
            </div>
            <div className="flex justify-end mt-4">
               <button type="submit" className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest border transition-colors ${isLightMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 border-emerald-400'}`}>
                 Simpan Komitmen
               </button>
            </div>
          </div>
        </form>
      )}

      {macroGoals.filter(goal => (goal.progress || 0) < 100).length === 0 && (
        <div className={`p-10 rounded-2xl border text-center flex flex-col items-center justify-center gap-4 ${glassTheme} ${borderTheme}`}>
          <div className="text-5xl animate-bounce">🏆</div>
          <div>
            <h3 className={`text-lg font-bold ${isLightMode ? 'text-stone-800' : 'text-white'}`}>Semua Target Bulanan Selesai!</h3>
            <p className={`text-xs mt-1 ${textMute}`}>Hebat! Semua komitmen bulanan Anda telah lengkap 100%. Gendut sangat bangga padamu! 🐾</p>
          </div>
          <button onClick={() => setShowMacroInput(true)} className={`mt-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-colors ${isLightMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 border-emerald-400'}`}>
            Buat Komitmen Baru
          </button>
        </div>
      )}
    </section>
    );
  };

  const renderStore = () => (
    <section className="flex-1 flex flex-col p-6 items-center flex-start animate-fade-in relative z-0 overflow-y-auto">
      <div className="text-center z-10 mb-8 mt-4">
        <h2 className={`text-4xl font-black uppercase tracking-widest mb-4 ${isLightMode ? 'text-stone-900' : 'text-white'}`}>Coin Store</h2>
        <p className={`text-lg font-medium ${isLightMode ? 'text-stone-600' : 'text-slate-300'}`}>Exchange your hard-earned coins for Gendut's accessories.</p>
        <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow ${isLightMode ? 'bg-amber-100 text-amber-700' : 'bg-slate-800 text-amber-400 border border-slate-700'}`}>
          🪙 {coins.toLocaleString()} Coins Available
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl z-10">
        {STORE_ITEMS.map((item) => {
          const isOwned = inventory.some(inv => inv.id === item.id);
          const canAfford = coins >= item.price;
          
          let cardBg = isLightMode ? 'bg-white border-stone-200 shadow-sm' : 'bg-slate-800/80 border-slate-700';
          if (item.rarity === 'rare') cardBg = isLightMode ? 'bg-blue-50 border-blue-200' : 'bg-slate-800/80 border-blue-500/30';
          if (item.rarity === 'epic') cardBg = isLightMode ? 'bg-purple-50 border-purple-200' : 'bg-slate-800/80 border-purple-500/30';
          if (item.rarity === 'legendary') cardBg = isLightMode ? 'bg-amber-50 border-amber-300' : 'bg-slate-800/80 border-amber-500/50 shadow-[0_0_15px_rgba(251,191,36,0.1)]';
          if (item.rarity === 'mythic') cardBg = isLightMode ? 'bg-cyan-50 border-cyan-300' : 'bg-slate-800/80 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.1)]';

          return (
            <div key={item.id} className={`p-6 rounded-3xl border flex flex-col items-center text-center transition-transform hover:scale-105 ${cardBg} ${isOwned ? 'opacity-60' : ''}`}>
              <div className="text-6xl mb-4 drop-shadow-md">{item.icon}</div>
              <h3 className={`text-lg font-bold mb-1 ${isLightMode ? 'text-stone-800' : 'text-white'}`}>{item.name}</h3>
              <p className={`text-xs uppercase tracking-widest font-bold mb-4 ${isLightMode ? 'text-stone-500' : 'text-slate-400'}`}>{item.rarity}</p>
              
              <button 
                onClick={() => buyItem(item.id)}
                disabled={isOwned || !canAfford}
                className={`w-full py-3 rounded-xl font-bold transition-colors ${isOwned ? (isLightMode ? 'bg-stone-200 text-stone-500' : 'bg-slate-700 text-slate-500') : (canAfford ? (isLightMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-[0_0_10px_rgba(16,185,129,0.2)]') : (isLightMode ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'))}`}
              >
                {isOwned ? 'Owned' : `Buy - 🪙 ${item.price.toLocaleString()}`}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );

  const renderInventory = () => {
    const categories = [
      { id: 'all', label: 'All Items' },
      { id: 'head', label: 'Head 🧢' },
      { id: 'face', label: 'Face 👓' },
      { id: 'neck', label: 'Neck 🧣' },
      { id: 'topRight', label: 'Extras ✨' },
      { id: 'bottomLeft', label: 'Aura 🔮' },
    ];

    const filteredItems = inventory.filter(item => {
      if (item.type === 'consumable') return false; // Food is consumed directly
      if (inventoryFilter === 'all') return true;
      return item.type === inventoryFilter;
    });

    return (
      <section className="flex-1 flex flex-col md:flex-row overflow-hidden animate-fade-in divide-y md:divide-y-0 md:divide-x divide-stone-200 dark:divide-slate-800">
        {/* Left mirror/garderobe preview */}
        <div className="md:w-1/3 p-6 flex flex-col items-center justify-center relative">
          <div className={`w-full max-w-sm rounded-3xl p-6 flex flex-col items-center justify-between h-full border ${glassTheme}`}>
            <div className="text-center w-full">
              <span className={`text-[10px] uppercase font-bold tracking-widest ${textMute}`}>Gendut's Dressing Mirror</span>
              <h2 className={`text-2xl font-black uppercase tracking-wider mt-1 ${isLightMode ? 'text-stone-800' : 'text-white'}`}> Closet Preview</h2>
            </div>

            {/* Avatar Stage */}
            <div className="my-8 relative group cursor-pointer transform scale-110">
              <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-125 animate-pulse"></div>
              <div className="relative">
                <GendutCat size="medium" animation={activeCatAnimation} energy={energy} happiness={happiness} isLightMode={isLightMode} isSleeping={isSleeping} />
                {renderEquippedItems('small')}
              </div>
            </div>

            <div className="w-full space-y-2 mt-auto">
              <span className={`text-[10px] uppercase font-bold tracking-widest ${textMute} block text-center mb-1`}>Active Visual Styles</span>
              <div className="flex flex-wrap gap-1.5 justify-center max-h-24 overflow-y-auto">
                {inventory.filter(i => i.equipped).length === 0 ? (
                  <span className={`text-xs italic ${textMute}`}>No items currently equipped</span>
                ) : (
                  inventory.filter(i => i.equipped).map(item => (
                    <div key={item.id} className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${isLightMode ? 'bg-stone-100 border-stone-200 text-stone-700' : 'bg-slate-800 border-slate-700 text-white'}`}>
                      <span>{item.icon}</span>
                      <span className="capitalize text-[10px]">{item.type}</span>
                    </div>
                  ))
                )}
              </div>
              <button onClick={() => setActiveTab('habitat')} className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider mt-4 flex items-center justify-center gap-2 shadow border ${isLightMode ? 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'}`}>
                <Home size={14} /> Back To Habitat
              </button>
            </div>
          </div>
        </div>

        {/* Right drawer contents */}
        <div className="flex-1 p-6 flex flex-col overflow-hidden">
          {/* Filters category */}
          <div className="flex gap-2 pb-4 overflow-x-auto no-scrollbar scroll-smooth">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setInventoryFilter(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${inventoryFilter === cat.id ? (isLightMode ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)]') : (isLightMode ? 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50' : 'bg-slate-800/50 text-slate-400 border-slate-800 hover:bg-slate-800')}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Catalog grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className={`h-full flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-3xl ${isLightMode ? 'border-stone-300 bg-stone-50/50' : 'border-slate-800 bg-slate-900/20'}`}>
                <Package className={`w-12 h-12 mb-3 text-stone-400`} />
                <h3 className={`text-lg font-bold mb-1 ${isLightMode ? 'text-stone-700' : 'text-slate-300'}`}>Closet is Empty</h3>
                <p className={`text-xs max-w-sm ${textMute}`}>No accessories found in this category. Head over to the Gacha Machine or the Coin Store to get some fresh styles!</p>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setActiveTab('gacha')} className={`px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow`}>
                    🎰 Go Gacha
                  </button>
                  <button onClick={() => setActiveTab('store')} className={`px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow`}>
                    🛒 Go Store
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                {filteredItems.map(item => {
                  let bc = isLightMode ? 'border-stone-200 bg-white shadow-sm' : 'border-slate-800 bg-slate-900/50';
                  let rarityLabelColor = 'text-stone-400';
                  
                  if (item.rarity === 'rare') {
                    bc = isLightMode ? 'border-blue-200 bg-blue-50/30' : 'border-blue-500/20 bg-blue-950/10';
                    rarityLabelColor = 'text-blue-500';
                  } else if (item.rarity === 'epic') {
                    bc = isLightMode ? 'border-purple-200 bg-purple-50/30' : 'border-purple-500/20 bg-purple-950/10';
                    rarityLabelColor = 'text-purple-400 font-bold';
                  } else if (item.rarity === 'legendary') {
                    bc = isLightMode ? 'border-amber-300 bg-amber-50/30 shadow-[0_0_12px_rgba(251,191,36,0.05)]' : 'border-amber-500/30 bg-amber-950/10 shadow-[0_0_15px_rgba(251,191,36,0.1)]';
                    rarityLabelColor = 'text-amber-500 font-black';
                  } else if (item.rarity === 'mythic') {
                    bc = isLightMode ? 'border-cyan-300 bg-cyan-100/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'border-cyan-500/30 bg-cyan-950/10 shadow-[0_0_20px_rgba(34,211,238,0.15)]';
                    rarityLabelColor = 'text-cyan-400 font-black';
                  }

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleEquip(item.id)}
                      className={`p-4 rounded-2xl border flex flex-col items-center justify-between text-center relative cursor-pointer hover:scale-[1.03] transition-all ${bc} ${item.equipped ? 'ring-2 ring-emerald-500' : ''}`}
                    >
                      {item.equipped && (
                        <div className="absolute top-2.5 right-2.5 flex items-center justify-center px-1.5 py-0.5 rounded-full bg-emerald-500 text-[8px] font-black uppercase text-slate-950 shadow">
                          Equipped
                        </div>
                      )}

                      <div className="text-4xl my-4 drop-shadow-md group-hover:scale-110 transition-transform">{item.icon}</div>
                      <div>
                        <h4 className={`text-xs font-bold ${isLightMode ? 'text-stone-800' : 'text-white'}`}>{item.name || `Cosmetic #${item.id}`}</h4>
                        <p className={`text-[8px] font-bold tracking-widest uppercase mt-0.5 ${rarityLabelColor}`}>
                          {item.rarity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderGacha = () => (
    <section className="flex-1 flex flex-col p-6 items-center justify-center animate-fade-in relative z-0">
      <div className="text-center z-10 mb-8">
        <h2 className={`text-4xl font-black uppercase tracking-widest mb-4 ${isLightMode ? 'text-stone-900' : 'text-white'}`}>Gacha Machine</h2>
        <p className={`text-sm font-medium ${isLightMode ? 'text-stone-600' : 'text-slate-300'}`}>Unlock higher-dimensional items and particles for Gendut using Tickets or Coins.</p>
        <div className="flex gap-4 justify-center mt-3 text-xs font-mono">
          <span className={`px-2.5 py-1.5 rounded-full border ${isLightMode ? 'bg-stone-100 border-stone-200' : 'bg-slate-800 border-slate-700'}`}>🎫 Tickets: <span className="font-bold text-emerald-500">{tickets}</span></span>
          <span className={`px-2.5 py-1.5 rounded-full border ${isLightMode ? 'bg-stone-100 border-stone-200' : 'bg-slate-800 border-slate-700'}`}>🪙 Coins: <span className="font-bold text-amber-500">{coins.toLocaleString()}</span></span>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 z-10">
        {/* Silver Machine */}
        <div className={`w-72 p-6 rounded-3xl flex flex-col items-center text-center cursor-pointer relative overflow-hidden border ${isLightMode ? 'bg-white border-slate-200 shadow-xl' : 'bg-slate-800/80 border-slate-700 glass'}`}>
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-slate-500 text-[8px] font-bold uppercase text-white">Tier I</div>
          
          <div className="w-24 h-24 my-4 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 border-4 border-slate-200 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(148,163,184,0.3)]">💎</div>
          <h3 className={`text-xl font-black uppercase mb-1 ${isLightMode ? 'text-stone-800' : 'text-white'}`}>Silver Capsule</h3>
          <p className="text-[10px] text-stone-500 dark:text-slate-400 mb-6 font-medium">Contains Common (60%), Rare (30%), or Epic (10%) styles.</p>
          
          <div className="w-full space-y-2 mt-auto">
            <button
              onClick={() => spinGachaNew('silver', 'ticket')}
              disabled={isGachaRolling}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-slate-300 to-slate-400 hover:from-slate-200 hover:to-slate-300 active:scale-95 text-slate-900 font-bold text-xs transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              Spin with 🎫 1 Ticket
            </button>
            <button
              onClick={() => spinGachaNew('silver', 'coin')}
              disabled={isGachaRolling}
              className="w-full py-2.5 rounded-xl border border-stone-300 dark:border-slate-700 bg-transparent hover:bg-stone-55 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-300 font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              Spin with 🪙 200 Coins
            </button>
          </div>
        </div>

        {/* Gold Machine */}
        <div className={`w-72 p-6 rounded-3xl flex flex-col items-center text-center cursor-pointer relative overflow-hidden border ${isLightMode ? 'bg-gradient-to-b from-white to-amber-50 border-amber-300 shadow-xl' : 'bg-gradient-to-b from-slate-900 to-amber-950/40 border-amber-500/50 glass shadow-2xl'}`}>
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[8px] font-bold uppercase text-slate-950">Tier II</div>
          
          <div className="w-24 h-24 my-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border-4 border-yellow-200 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(251,191,36,0.4)]">👑</div>
          <h3 className={`text-xl font-black uppercase mb-1 ${isLightMode ? 'text-amber-800' : 'text-amber-400'}`}>Gold Capsule</h3>
          <p className="text-[10px] text-stone-500 dark:text-slate-400 mb-6 font-medium">Contains Epic (50%), Legendary (35%), or Mythic (15%) custom elements.</p>
          
          <div className="w-full space-y-2 mt-auto">
            <button
              onClick={() => spinGachaNew('gold', 'ticket')}
              disabled={isGachaRolling}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-amber-950 font-black text-xs transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              Spin with 🎫 3 Tickets
            </button>
            <button
              onClick={() => spinGachaNew('gold', 'coin')}
              disabled={isGachaRolling}
              className="w-full py-2.5 rounded-xl border border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              Spin with 🪙 500 Coins
            </button>
          </div>
        </div>
      </div>

      {/* Probability weights info footer */}
      <div className={`mt-8 max-w-md p-4 rounded-2xl border text-[10px] text-center ${isLightMode ? 'bg-stone-50 border-stone-200 text-stone-500' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
        🎁 <span className="font-bold">Dekompresi Quantum:</span> Semua item yang didapat dari Gacha Machine bersifat permanen dan langsung masuk ke <span className={`underline font-bold text-emerald-500 cursor-pointer`} onClick={() => setActiveTab('inventory')}>Inventory Vault</span>. Duplikat akan otomatis dikonversi menjadi <span className="font-bold text-amber-500">🪙 150 Koin kompensasi</span>!
      </div>

      {isGachaRolling && (
         <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
              <div className="absolute text-3xl animate-bounce">🎰</div>
            </div>
            <p className="text-sm font-bold text-emerald-400 animate-pulse tracking-widest uppercase font-mono">Quantum Decrypting Cosmetic Loot ...</p>
         </div>
      )}

      {/* Gacha Reward Reveal Modal */}
      {gachaReward && (() => {
        let titleColor = 'text-white';
        let bgGlow = 'bg-slate-800';
        let boxBord = 'border-slate-750';
        
        if (gachaReward.rarity === 'rare') {
          titleColor = 'text-blue-400';
          bgGlow = 'bg-blue-950/90 shadow-[0_0_40px_rgba(59,130,246,0.3)]';
          boxBord = 'border-blue-500/50';
        } else if (gachaReward.rarity === 'epic') {
          titleColor = 'text-purple-400';
          bgGlow = 'bg-purple-950/90 shadow-[0_0_50px_rgba(168,85,247,0.4)]';
          boxBord = 'border-purple-500/50';
        } else if (gachaReward.rarity === 'legendary') {
          titleColor = 'text-amber-400';
          bgGlow = 'bg-amber-950/90 shadow-[0_0_60px_rgba(245,158,11,0.5)]';
          boxBord = 'border-amber-500/50';
        } else if (gachaReward.rarity === 'mythic') {
          titleColor = 'text-cyan-400';
          bgGlow = 'bg-cyan-950/95 shadow-[0_0_70px_rgba(6,182,212,0.6)]';
          boxBord = 'border-cyan-500/50';
        }

        return (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-[2.5rem] p-8 border text-center ${bgGlow} ${boxBord} animate-scale-up`}>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400 mb-2 block">Casing Unlocked</span>
              <h3 className={`text-3xl font-black uppercase tracking-wider mb-6 ${titleColor}`}>🎉 Winner Recieved!</h3>
              
              <div className="w-36 h-36 mx-auto rounded-full bg-slate-950/50 border border-white/5 flex items-center justify-center text-7xl mb-6 relative animate-bounce shadow-inner">
                {gachaReward.icon}
              </div>
              
              <h4 className="text-xl font-black text-white mb-1">{gachaReward.name}</h4>
              <p className={`text-xs font-bold uppercase tracking-widest ${titleColor} mb-8`}>{gachaReward.rarity} {gachaReward.type} slot</p>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    toggleEquip(gachaReward.id);
                    setGachaReward(null);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-sm tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95"
                >
                  Equip Style Immediately
                </button>
                <button
                  onClick={() => setGachaReward(null)}
                  className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-colors"
                >
                  Send To Vault & Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );

  const renderHabitat = () => (
    <section className="flex-1 flex flex-col overflow-hidden animate-fade-in relative p-4 lg:p-8">
      <div className="flex-1 flex flex-col p-4 lg:p-8 relative items-center justify-center">
        {/* Live Cyber-Loft Stats HUD */}
        <div className={`absolute top-4 left-4 p-4 rounded-xl border z-10 w-full max-w-[200px] sm:max-w-xs ${glassTheme} ${borderTheme}`}>
          <h2 className={`text-sm lg:text-base font-black uppercase tracking-wider mb-2 ${isLightMode ? 'text-stone-900' : 'text-white'}`}>Gendut's Cyber-Loft</h2>
          <div className="space-y-3">
             <div>
               <div className="flex justify-between text-[10px] uppercase font-bold text-pink-500 mb-1">
                 <span>Affection</span>
                 <span>LV. {Math.min(10, Math.floor(affection / 15) + 1)}</span>
               </div>
               <div className={`h-1.5 rounded-full overflow-hidden ${isLightMode ? 'bg-stone-200' : 'bg-slate-800'}`}>
                 <div className="h-full bg-pink-500 transition-all duration-500" style={{ width: `${affection}%` }}></div>
               </div>
             </div>
             <div>
               <div className="flex justify-between text-[10px] uppercase font-bold text-amber-500 mb-1">
                 <span>Happiness</span>
                 <span>{happiness}%</span>
               </div>
               <div className={`h-1.5 rounded-full overflow-hidden ${isLightMode ? 'bg-stone-200' : 'bg-slate-800'}`}>
                 <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${happiness}%` }}></div>
               </div>
             </div>
             <div>
               <div className="flex justify-between text-[10px] uppercase font-bold text-emerald-500 mb-1">
                 <span>Environment</span>
                 <span>Cozy Stage</span>
               </div>
               <div className={`h-1.5 rounded-full overflow-hidden ${isLightMode ? 'bg-stone-200' : 'bg-slate-800'}`}>
                 <div className="h-full bg-emerald-500 w-[85%]"></div>
               </div>
             </div>
          </div>
        </div>

        {/* 3D Moving Avatar Stage */}
        <div className="cat-pulse relative group cursor-pointer m-auto transform scale-110 sm:scale-125 lg:scale-150 transition-transform duration-500 hover:scale-[1.6]">
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <div className="relative">
            <GendutCat size="large" animation={activeCatAnimation} energy={energy} happiness={happiness} isLightMode={isLightMode} isSleeping={isSleeping} />
            {renderEquippedItems('large')}
          </div>
        </div>

        {/* Interactive 3D Motion Controls */}
        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 p-3 rounded-2xl border backdrop-blur-md flex flex-wrap gap-2 justify-center z-10 ${glassTheme} ${borderTheme}`}>
          <div className={`text-[10px] uppercase font-black tracking-widest w-full text-center mb-1 ${textMute}`}>Select 3D Animation Style</div>
          {[
            { id: 'breathe', label: 'Breathe 🍃' },
            { id: 'spin', label: 'Super Spin 🌀' },
            { id: 'jump', label: 'High Jump 🐰' },
            { id: 'wiggle', label: 'Wiggle Walk 🐾' }
          ].map(anim => (
            <button
              key={anim.id}
              onClick={() => {
                setActiveCatAnimation(anim.id as any);
                // Patting Gendut increases happiness and affection slightly!
                setHappiness(h => Math.min(100, h + 2));
                setAffection(a => Math.min(100, a + 1));
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCatAnimation === anim.id
                  ? (isLightMode ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)]')
                  : (isLightMode ? 'bg-stone-100 hover:bg-stone-200 text-stone-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300')
              }`}
            >
              {anim.label}
            </button>
          ))}
          <button
            onClick={() => {
              setIsSleeping(s => !s);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              isSleeping
                ? (isLightMode ? 'bg-cyan-600 text-white shadow-md' : 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.4)]')
                : (isLightMode ? 'bg-stone-100 hover:bg-stone-200 text-stone-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300')
            }`}
          >
            {isSleeping ? '☀️ Wake Up' : '🛌 Rest / Sleep'}
          </button>
        </div>
      </div>
    </section>
  );

  return (
    <div className={`flex flex-col h-screen w-full font-sans overflow-hidden select-none transition-colors duration-500 ${bgMain}`}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      {renderNav()}
      <main className="flex-1 flex overflow-hidden relative">
         {renderSidebar()}
         {!isLightMode && (
           <>
             <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none"></div>
             <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none"></div>
           </>
         )}
         <div className="flex-1 z-10 relative flex flex-col">
            {activeAlert && (
              <div className={`py-2 px-4 flex items-center justify-between text-xs font-bold animate-fade-in ${isLightMode ? 'bg-amber-100 text-amber-900 border-b border-amber-200' : 'bg-amber-500/20 text-amber-400 border-b border-amber-500/30'}`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} />
                  <span>{activeAlert}</span>
                </div>
                <X size={14} className="cursor-pointer hover:opacity-70" onClick={() => setActiveAlert(null)} />
              </div>
            )}
           {activeTab === 'command_center' && renderCommandCenter()}
           {activeTab === 'analytics' && renderAnalytics()}
           {activeTab === 'monthly_macro' && renderMonthlyMacro()}
           {activeTab === 'gacha' && renderGacha()}
           {activeTab === 'inventory' && renderInventory()}
           {activeTab === 'store' && renderStore()}
           {activeTab === 'habitat' && renderHabitat()}
         </div>
      </main>

      {/* Feature Information Modal */}
      {renderInfoModal()}

      {/* 6:00 AM Task Reminder Overlay */}
      {renderMorningReminderModal()}

      {/* Weekly Summary Modal */}
      {showWeeklySummary && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-md rounded-[2.5rem] border p-8 text-center flex flex-col gap-6 shadow-[0_0_50px_rgba(16,185,129,0.2)] ${isLightMode ? 'bg-white border-emerald-100' : 'bg-slate-900 border-emerald-500/30'}`}>
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Gift size={40} className="text-emerald-500" />
            </div>
            <div>
              <h2 className={`text-2xl font-black uppercase tracking-tighter mb-1 ${isLightMode ? 'text-stone-900' : 'text-white'}`}>Weekly Achievement! 🏆</h2>
              <p className={`text-sm ${textMute}`}>Sunday Recap: You've had a productive 7 days.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-3xl border ${isLightMode ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <span className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${textMute}`}>XP Earned</span>
                <span className="text-2xl font-black text-emerald-500">+{weeklyStats.xp}</span>
              </div>
              <div className={`p-4 rounded-3xl border ${isLightMode ? 'bg-cyan-50 border-cyan-100' : 'bg-cyan-500/5 border-cyan-500/20'}`}>
                <span className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${textHighlight}`}>Goals Met</span>
                <span className="text-2xl font-black text-cyan-400">{weeklyStats.goals}</span>
              </div>
            </div>

            <div className={`p-5 rounded-3xl border bg-slate-950/20 text-left ${isLightMode ? 'text-stone-700' : 'text-slate-300'}`}>
               <p className="text-xs italic leading-relaxed">
                 "Your consistency is levels above the average user. Gendut is proud of your focus this week!"
               </p>
            </div>

            <button 
              onClick={() => setShowWeeklySummary(false)}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${isLightMode ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'}`}
            >
              Continue Journey
            </button>
          </div>
        </div>
      )}

      <footer className={`h-10 border-t flex items-center px-4 sm:px-6 text-[9px] sm:text-[10px] font-mono justify-between z-50 ${isLightMode ? 'border-stone-200 bg-stone-100/80 text-stone-500' : 'border-slate-800 bg-slate-900/80 text-slate-400'}`}>
        <div className="flex items-center gap-2 sm:gap-6">
          <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> SYSTEM STABLE</div>
          <div className="hidden sm:block">CONNECTED TO NEURAL_ENGINE: V1.0.4</div>
        </div>
        <div className="flex gap-4 italic opacity-80">
          <span className="hidden md:inline">"Yesterday's tasks are locked."</span>
          <span className={`cursor-pointer hover:underline flex items-center gap-1 ${isLightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>VIEW_REFLECTIONS.LOG <ChevronRight size={10} /></span>
        </div>
      </footer>
    </div>
  );
}
