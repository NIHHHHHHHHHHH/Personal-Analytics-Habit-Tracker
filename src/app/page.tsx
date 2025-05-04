
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart,Bar,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer,ReferenceLine,} from 'recharts';
import {Settings, CheckCircle2,AlertTriangle, Award,  Zap, Moon, Droplets, Monitor, Activity,  Coffee, Check} from 'lucide-react';

// ============ TYPES AND INTERFACES ============

interface HabitData {
  id: string;
  name: string;
  icon: React.ReactNode;
  unit: string;
  color: string;
  goal: number;
  current: number;
  data: DataPoint[];
}

interface DataPoint {
  day: string;
  value: number;
}

interface SliderProps {
  habit: HabitData;
  onChange: (id: string, value: number) => void;
}

interface StreakTrackerProps {
  streak: number;
  lastCheckin: Date | null;
  onCheckIn: () => void;
}

interface HabitChartProps {
  habit: HabitData;
  chartType?: 'line' | 'bar';
}


interface GoalCardProps {
  habit: HabitData;
  onUpdate: (id: string, goal: number) => void;
}

interface DataPoint {
  day: string;
  value: number;
}


// Define an interface for the dynamic combined data
interface CombinedDayData {
  day: string;
  [habitId: string]: string | number; // Index signature for dynamic habit IDs
}

// Component props interface
interface WeeklyActivityProps {
  habits: HabitData[];
}
// ============ MAIN PAGE COMPONENT ============

export default function Page() {
  // State hooks for the main app
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [streak, setStreak] = useState<number>(3);
  const [lastCheckin, setLastCheckin] = useState<Date | null>(new Date());
  const [todayComplete, setTodayComplete] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  

  // Generate dates for the past 7 days
  const getDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return dates;
  };

  const pastWeekDays = getDates();
  
  // Define initial habits data with mock data for the past week
  const [habits, setHabits] = useState<HabitData[]>([
    {
      id: 'sleep',
      name: 'Sleep',
      icon: <Moon className="h-5 w-5" />,
      unit: 'hours',
      color: '#4f46e5', // indigo
      goal: 8,
      current: 7,
      data: pastWeekDays.map((day, index) => ({
        day,
        value: [7.5, 6.5, 8, 7, 6, 8.5, 7.5][index]
      }))
    },
    {
      id: 'water',
      name: 'Water',
      icon: <Droplets className="h-5 w-5" />,
      unit: 'liters',
      color: '#0ea5e9', // sky blue
      goal: 3,
      current: 2.5,
      data: pastWeekDays.map((day, index) => ({
        day,
        value: [1.8, 2.5, 3.2, 2.7, 1.5, 2.2, 2.8][index]
      }))
    },
    {
      id: 'screen',
      name: 'Screen Time',
      icon: <Monitor className="h-5 w-5" />,
      unit: 'hours',
      color: '#ef4444', // red
      goal: 4,
      current: 4.5,
      data: pastWeekDays.map((day, index) => ({
        day,
        value: [5.5, 4.2, 6.1, 3.5, 7.2, 4.8, 3.9][index]
      }))
    },
    {
      id: 'exercise',
      name: 'Exercise',
      icon: <Activity className="h-5 w-5" />,
      unit: 'minutes',
      color: '#10b981', // green
      goal: 30,
      current: 25,
      data: pastWeekDays.map((day, index) => ({
        day,
        value: [45, 0, 30, 60, 20, 0, 25][index]
      }))
    },
    {
      id: 'meditation',
      name: 'Meditation',
      icon: <Zap className="h-5 w-5" />,
      unit: 'minutes',
      color: '#8b5cf6', // purple
      goal: 15,
      current: 10,
      data: pastWeekDays.map((day, index) => ({
        day,
        value: [10, 15, 5, 20, 10, 15, 10][index]
      }))
    },
    {
      id: 'coffee',
      name: 'Coffee',
      icon: <Coffee className="h-5 w-5" />,
      unit: 'cups',
      color: '#d97706', // amber
      goal: 2,
      current: 3,
      data: pastWeekDays.map((day, index) => ({
        day,
        value: [2, 3, 2, 4, 1, 3, 3][index]
      }))
    }
  ]);
  
  // Handle habit value change
  const handleHabitChange = useCallback((id: string, value: number) => {
    // Find the habit being modified
    const habitBeingModified = habits.find(h => h.id === id);
    
    if (habitBeingModified) {
      // Check if this specific change achieved a goal
      const goalMet = habitBeingModified.id === 'screen'
        ? value <= habitBeingModified.goal // For screen time, less is better
        : value >= habitBeingModified.goal;
        
      // Check if it was already achieved before this change
      const wasAlreadyAchieved = habitBeingModified.id === 'screen'
        ? habitBeingModified.current <= habitBeingModified.goal
        : habitBeingModified.current >= habitBeingModified.goal;
        
      // Show notification only if goal is newly achieved
      if (goalMet && !wasAlreadyAchieved) {
        setNotification(`🎉 Goal achieved for ${habitBeingModified.name}!`);
        setTimeout(() => setNotification(null), 3000);
      }
    }
  
    // Update state as before
    setHabits(prevHabits => 
      prevHabits.map(habit => 
        habit.id === id 
          ? { 
              ...habit, 
              current: value,
              data: [...habit.data.slice(0, -1), { day: habit.data[habit.data.length - 1].day, value }]
            } 
          : habit
      )
    );
  }, [habits]); // Note: Added habits dependency here
  // Update habit goal
  const updateHabitGoal = useCallback((id: string, goal: number) => {
    setHabits(prevHabits => 
      prevHabits.map(habit => 
        habit.id === id ? { ...habit, goal } : habit
      )
    );
    
    // Show notification
    setNotification(`Goal updated for ${habits.find(h => h.id === id)?.name}`);
    setTimeout(() => setNotification(null), 3000);
  }, [habits]);
  
  // Handle daily check-in
  const handleCheckIn = useCallback(() => {
    if (!todayComplete) {
      // Update last check-in date
      setLastCheckin(new Date());
      setTodayComplete(true);
      
      // Increment streak
      setStreak(prev => prev + 1);
      
      // Show notification
      setNotification('Daily check-in complete! Streak increased.');
      setTimeout(() => setNotification(null), 3000);
    }
  }, [todayComplete]);
  

  

  
  // Reset daily progress at midnight
  useEffect(() => {
    const checkNewDay = () => {
      const now = new Date();
      const lastCheckedDate = lastCheckin ? new Date(lastCheckin) : null;
      
      if (lastCheckedDate && 
          (now.getDate() !== lastCheckedDate.getDate() || 
           now.getMonth() !== lastCheckedDate.getMonth() || 
           now.getFullYear() !== lastCheckedDate.getFullYear())) {
        // It's a new day
        setTodayComplete(false);
        
        // If missed a day, reset streak
        if (now.getDate() - lastCheckedDate.getDate() > 1 || 
            now.getMonth() !== lastCheckedDate.getMonth() || 
            now.getFullYear() !== lastCheckedDate.getFullYear()) {
          setStreak(0);
          setNotification('You missed a day! Streak reset.');
          setTimeout(() => setNotification(null), 3000);
        }
      }
    };
    
    // Check on load and set interval
    checkNewDay();
    const interval = setInterval(checkNewDay, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [lastCheckin]);
  
  return (
    <div className="min-h-screen transition-all duration-300 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 rounded-lg w-10 h-10 flex items-center justify-center text-white">
                <Activity className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold dark:text-white">
                Personal Analytics & Habit Tracker
              </h1>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex mt-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('habits')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'habits'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              My Habits
            </button>
          </div>
        </header>
        
        {/* Notification System */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-xs"
            >
              {notification}
            </motion.div>
          )}
        </AnimatePresence>
        
        <main>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <StreakTracker 
                    streak={streak} 
                    lastCheckin={lastCheckin}
                    onCheckIn={handleCheckIn}
                  />
                </div>
                <div>
                  <OverallProgress habits={habits} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold dark:text-white">Today&apos;ss Check-in</h2>
                    <button
                      onClick={handleCheckIn}
                      disabled={todayComplete}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        todayComplete
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {todayComplete ? (
                        <div className="flex items-center space-x-1">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Completed</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <Check className="h-4 w-4" />
                          <span>Complete Day</span>
                        </div>
                      )}
                    </button>
                  </div>
                  
                  <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 gap-6">
                    {/* Left side - Habit sliders */}
                    <div className="space-y-6">
                      {habits.map(habit => (
                        <HabitSlider
                          key={habit.id}
                          habit={habit}
                          onChange={handleHabitChange}
                        />
                      ))}
                    </div>
                    
                    {/* Right side - Summary */}
                    <div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-3 dark:text-white">Today&apos;ss Summary</h3>
                        <div className="space-y-2">
                          {habits.map(habit => {
                            const goalMet = habit.id === 'screen' 
                              ? habit.current <= habit.goal // For screen time, less is better
                              : habit.current >= habit.goal;
                            return (
                              <div key={habit.id} className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  <span className="w-8 h-8 rounded-full flex items-center justify-center" 
                                    style={{ backgroundColor: `${habit.color}20` }}>
                                    <span style={{ color: habit.color }}>{habit.icon}</span>
                                  </span>
                                  <span className="text-sm font-medium dark:text-gray-200">{habit.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm dark:text-gray-300">
                                    {habit.current} / {habit.goal} {habit.unit}
                                  </span>
                                  {goalMet ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium dark:text-gray-300">Overall Progress</span>
                            <span className="text-sm font-bold dark:text-white">
                              {Math.round(
                                (habits.filter(h => 
                                  h.id === 'screen' 
                                    ? h.current <= h.goal 
                                    : h.current >= h.goal
                                ).length / habits.length) * 100
                              )}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full mt-2">
                            <div 
                              className="h-2 bg-green-500 rounded-full" 
                              style={{ 
                                width: `${Math.round(
                                  (habits.filter(h => 
                                    h.id === 'screen' 
                                      ? h.current <= h.goal 
                                      : h.current >= h.goal
                                  ).length / habits.length) * 100
                                )}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-2 dark:text-white">Mood Tracker</h3>
                        <div className="flex justify-center space-x-4">
                          {["😢", "😕", "😐", "🙂", "😄"].map((emoji, i) => (
                            <button 
                              key={i} 
                              className={`text-2xl p-2 rounded-full transition-transform hover:scale-125 ${
                                i === 4 ? 'bg-green-100 dark:bg-green-900 scale-110' : ''
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <HabitPanel habit={habits.find(h => h.id === 'sleep')!} />
                <HabitPanel habit={habits.find(h => h.id === 'water')!} />
                <HabitPanel habit={habits.find(h => h.id === 'screen')!} />
                <HabitPanel habit={habits.find(h => h.id === 'exercise')!} />
                <HabitPanel habit={habits.find(h => h.id === 'meditation')!} />
                <HabitPanel habit={habits.find(h => h.id === 'coffee')!} />
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Weekly Overview</h2>
                <div className="mt-4">
                  <WeeklyActivity habits={habits} />
                </div>
              </div>
            </div>
          )}
          
          {/* Habits Tab */}
          {activeTab === 'habits' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold dark:text-white">My Habits</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {habits.map(habit => (
                  <GoalCard 
                    key={habit.id} 
                    habit={habit} 
                    onUpdate={updateHabitGoal}
                  />
                ))}
              </div>
              
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// =================== COMPONENT DEFINITIONS ===================


// Habit Slider Component
const HabitSlider: React.FC<SliderProps> = ({ habit, onChange }) => {
  const isReversed = habit.id === 'screen'; // For screen time, lower is better
  const isOnTarget = isReversed 
    ? habit.current <= habit.goal 
    : habit.current >= habit.goal;
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-3 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full flex items-center justify-center" 
            style={{ backgroundColor: `${habit.color}20` }}>
            <span style={{ color: habit.color }}>{habit.icon}</span>
          </span>
          <label className="text-sm font-medium dark:text-white">
            {habit.name}
          </label>
        </div>
        <span className="text-sm font-semibold dark:text-white flex items-center">
          {habit.current} {habit.unit}
          {isOnTarget ? (
            <CheckCircle2 className="h-3 w-3 ml-1 text-green-500" />
          ) : (
            <AlertTriangle className="h-3 w-3 ml-1 text-yellow-500" />
          )}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={0}
          max={isReversed ? Math.max(habit.goal * 2, 10) : habit.goal * 2}
          step={habit.unit === 'hours' || habit.unit === 'liters' ? 0.1 : 1}
          value={habit.current}
          onChange={(e) => onChange(habit.id, parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${habit.color} 0%, ${habit.color} ${
              isReversed 
                ? 100 - (habit.current / (Math.max(habit.goal * 2, 10)) * 100)
                : (habit.current / (habit.goal * 2)) * 100
            }%, #e5e7eb ${
              isReversed 
                ? 100 - (habit.current / (Math.max(habit.goal * 2, 10)) * 100)
                : (habit.current / (habit.goal * 2)) * 100
            }%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 ">
  <span>0 {habit.unit}</span>

  <span className="flex flex-col items-center relative">
    <span className="w-0.5 h-3 bg-gray-400 mb-1"></span>
    <span>Goal: {habit.goal} {habit.unit}</span>
  </span>

  <span>{isReversed ? Math.max(habit.goal * 2, 10) : habit.goal * 2} {habit.unit}</span>
</div>
      </div>
    </div>
  );
};


// Streak Tracker Component
const StreakTracker: React.FC<StreakTrackerProps> = ({ 
  streak, 
  lastCheckin, 
  onCheckIn 
}) => {
  const lastLogin = lastCheckin 
    ? new Date(lastCheckin).toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      }) 
    : 'Never';
      
  // Variants for the counter animation
  const counterVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 10 
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 1.2, 
      y: -20, 
      transition: { 
        duration: 0.2 
      } 
    }
  };
  
  // Variants for the flame animation
  const flameVariants = {
    idle: { scale: 1, rotate: 0 },
    pulse: { 
      scale: [1, 1.2, 1], 
      rotate: [-5, 5, -5, 0],
      transition: { 
        times: [0, 0.5, 1], 
        duration: 0.7, 
        ease: "easeInOut",
        repeat: 1
      } 
    }
  };
  
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg p-4 shadow text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Daily Streak</h2>
        <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
          Last check-in: {lastLogin}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div 
            variants={flameVariants}
            initial="idle"
            animate="pulse"
            className="text-3xl md:text-4xl"
          >
            🔥
          </motion.div>
          <div className="relative h-12">
            <AnimatePresence mode="wait">
              <motion.div 
                key={streak}
                variants={counterVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className=" items-center"
              >
                <div className="font-bold text-3xl md:text-4xl">
                  {streak} Day{streak !== 1 ? 's' : ''}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        <button
          onClick={onCheckIn}
          className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
        >
          <CheckCircle2 className="h-5 w-5" />
          <span>Check In</span>
        </button>
      </div>
      
      <div className="mt-4">
        <div className="text-sm opacity-80 mb-1">Progress to next milestone</div>
        <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
          <motion.div 
            className="bg-white h-full rounded-full"
            initial={{ width: "0%" }}
            animate={{ 
              width: `${Math.min(100, (streak % 5) * 20)}%`, 
              transition: { duration: 0.5 } 
            }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1 opacity-80">
          <span>Current: {streak}</span>
          <span>Next: {Math.ceil(streak / 5) * 5}</span>
        </div>
      </div>
      
      {streak >= 5 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: 1, 
            height: "auto", 
            transition: { delay: 0.3 } 
          }}
          className="mt-3 bg-white/20 p-2 rounded-lg text-sm"
        >
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-300" />
            <div>
              {streak >= 30 ? (
                <span>Master Tracker: You&apos;sre in the top 1% of users! 🏆</span>
              ) : streak >= 15 ? (
                <span>Habit Pro: You&apos;sre building serious momentum! 🥇</span>
              ) : (
                <span>Streak Achiever: You&apos;sre building consistency! ⭐</span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};


// Overall Progress Component
const OverallProgress: React.FC<{ habits: HabitData[] }> = ({ habits }) => {
  const completedHabits = habits.filter(h => 
    h.id === 'screen' ? h.current <= h.goal : h.current >= h.goal
  ).length;
  
  const percentage = Math.round((completedHabits / habits.length) * 100);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-full flex flex-col justify-center">
      <div className="text-center mb-2">
        <span className="text-gray-500 dark:text-gray-400 text-sm">Today&apos;ss Progress</span>
        <div className="text-3xl font-bold mt-1 dark:text-white">{percentage}%</div>
      </div>
      
      <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-green-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${percentage}%`, transition: { duration: 0.5 } }}
        />
      </div>
      
      <div className="mt-3 text-center">
        <span className="text-sm dark:text-gray-300">
          {completedHabits} of {habits.length} habits completed
        </span>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-2">
        {habits.map(habit => {
          const isComplete = habit.id === 'screen' 
            ? habit.current <= habit.goal 
            : habit.current >= habit.goal;
          
          return (
            <div 
              key={habit.id} 
              className={`p-1 rounded-full flex items-center justify-center ${
                isComplete 
                  ? 'bg-green-100 dark:bg-green-900' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isComplete ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                }`} 
              >
                {habit.icon}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
// Habit Chart Component for Details
const HabitChartDetail: React.FC<HabitChartProps> = ({
  habit,
  chartType = 'line'
}) => {
  // Define proper type for the tooltip props
  type TooltipProps = {
    active?: boolean;
    payload?: Array<{
      value: number;
      name?: string;
      dataKey?: string;
      payload?: {
        day: string;
        value: number;
      };
    }>;
    label?: string;
  };
  
  // Custom tooltip for charts with proper type
  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 shadow-md rounded border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium">{label}</p>
          <p className="text-xs font-semibold" style={{ color: habit.color }}>
            {payload[0].value} {habit.unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartType === 'line' ? (
        <LineChart data={habit.data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            domain={[0, 'auto']}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={habit.goal} stroke="#8884d8" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="value"
            name={habit.name}
            stroke={habit.color}
            strokeWidth={2}
            dot={{ fill: habit.color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      ) : (
        <BarChart data={habit.data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            domain={[0, 'auto']}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={habit.goal} stroke="#8884d8" strokeDasharray="3 3" />
          <Bar
            dataKey="value"
            name={habit.name}
            fill={habit.color}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
};

// Habit Panel Component
// Main HabitPanel component with toggle functionality
const HabitPanel: React.FC<{ habit: HabitData }> = ({ habit }) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  
  // Calculate weekly statistics
  const weeklyAvg = habit.data.reduce((sum, point) => sum + point.value, 0) / habit.data.length;
  const weeklyTotal = habit.data.reduce((sum, point) => sum + point.value, 0);
  const weeklyHigh = Math.max(...habit.data.map(point => point.value));
  const weeklyLow = Math.min(...habit.data.map(point => point.value));
  
  // For daily view - show current (today's) progress
  const dailyGoalPercentage = (habit.current / habit.goal) * 100;
  
  // For weekly view - show average against goal
  const weeklyGoalPercentage = (weeklyAvg / habit.goal) * 100;
  
  // For screen time (or any reversed goal where lower is better)
  const isReversed = habit.id === 'screen';
  
  const getProgressPercentage = () => {
    if (viewMode === 'daily') {
      if (isReversed) {
        return habit.current <= habit.goal 
          ? 100 
          : Math.max(0, Math.min(100, 100 - ((habit.current - habit.goal) / habit.goal * 100)));
      } else {
        return Math.min(100, dailyGoalPercentage);
      }
    } else { // weekly
      if (isReversed) {
        return weeklyAvg <= habit.goal 
          ? 100 
          : Math.max(0, Math.min(100, 100 - ((weeklyAvg - habit.goal) / habit.goal * 100)));
      } else {
        return Math.min(100, weeklyGoalPercentage);
      }
    }
  };
  
  const getProgressText = () => {
    if (viewMode === 'daily') {
      if (isReversed) {
        return habit.current <= habit.goal 
          ? '100%' 
          : `${Math.round(100 - ((habit.current - habit.goal) / habit.goal * 100))}%`;
      } else {
        return habit.current >= habit.goal 
          ? '100%' 
          : `${Math.round(dailyGoalPercentage)}%`;
      }
    } else { // weekly
      if (isReversed) {
        return weeklyAvg <= habit.goal 
          ? '100%' 
          : `${Math.round(100 - ((weeklyAvg - habit.goal) / habit.goal * 100))}%`;
      } else {
        return weeklyAvg >= habit.goal 
          ? '100%' 
          : `${Math.round(weeklyGoalPercentage)}%`;
      }
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center" 
            style={{ backgroundColor: `${habit.color}20` }}
          >
            <span style={{ color: habit.color }}>{habit.icon}</span>
          </div>
          <h3 className="text-lg font-semibold dark:text-white">{habit.name}</h3>
        </div>
        <div className="flex space-x-2 text-sm">
           <button
             onClick={() => setViewMode('daily')}
             className={`px-2 py-1 rounded-full transition-colors ${
               viewMode === 'daily'
                 ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 font-medium'
                 : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
             }`}
           >
             Daily
           </button>
           <button
             onClick={() => setViewMode('weekly')}
             className={`px-2 py-1 rounded-full transition-colors ${
               viewMode === 'weekly'
                 ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 font-medium'
                 : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
             }`}
           >
             Weekly
           </button>
</div>

      </div>
      
      {viewMode === 'daily' ? (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-xl font-bold dark:text-white">{habit.current}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{habit.unit}</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Goal</p>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-xl font-bold dark:text-white">{habit.goal}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{habit.unit}</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Yesterday</p>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-xl font-bold dark:text-white">
                  {habit.data[habit.data.length - 2]?.value || 0}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{habit.unit}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg</p>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-xl font-bold dark:text-white">{weeklyAvg.toFixed(1)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{habit.unit}</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-xl font-bold dark:text-white">{weeklyTotal.toFixed(1)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{habit.unit}</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">High</p>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-xl font-bold dark:text-white">{weeklyHigh}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{habit.unit}</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Low</p>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-xl font-bold dark:text-white">{weeklyLow}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{habit.unit}</span>
              </div>
            </div>
          </div>
        </>
      )}
      
      <div className="h-36">
        <HabitChartDetail 
          habit={habit} 
          chartType={habit.id === 'sleep' ? 'line' : 'bar'} 
        />
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm dark:text-gray-300">
            {viewMode === 'daily' ? 'Progress towards daily goal' : 'Weekly average vs goal'}
          </span>
          <span className="text-sm font-medium dark:text-white">
            {getProgressText()}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full"
            style={{ 
              width: `${getProgressPercentage()}%`,
              backgroundColor: habit.color
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Goal Card Component
const GoalCard: React.FC<GoalCardProps> = ({ habit, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [goalValue, setGoalValue] = useState(habit.goal);
  
  const handleSave = () => {
    onUpdate(habit.id, goalValue);
    setIsEditing(false);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center" 
            style={{ backgroundColor: `${habit.color}20` }}
          >
            <span style={{ color: habit.color }}>{habit.icon}</span>
          </div>
          <h3 className="font-semibold dark:text-white">{habit.name}</h3>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
      
      {isEditing ? (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Daily Goal ({habit.unit})
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
              value={goalValue}
              min={0}
              step={habit.unit === 'hours' || habit.unit === 'liters' ? 0.1 : 1}
              onChange={(e) => setGoalValue(parseFloat(e.target.value) || 0)}
            />
            <button
              onClick={handleSave}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col space-y-2 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Current</span>
              <span className="font-semibold dark:text-white">
                {habit.current} {habit.unit}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Daily Goal</span>
              <span className="font-semibold dark:text-white">
                {habit.goal} {habit.unit}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Weekly Avg</span>
              <span className="font-semibold dark:text-white">
                {(habit.data.reduce((sum, point) => sum + point.value, 0) / habit.data.length).toFixed(1)} {habit.unit}
              </span>
            </div>
          </div>
          
         <div className="mt-4 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full" 
              style={{ 
                width: `${Math.min(100, (habit.current / habit.goal) * 100)}%`, 
                backgroundColor: habit.color 
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};



// WeeklyActivity Component
const WeeklyActivity: React.FC<WeeklyActivityProps> = ({ habits }) => {
  const days = habits[0]?.data.map(d => d.day) || [];
  
  const combinedData: CombinedDayData[] = days.map((day, i) => {
    const dayData: CombinedDayData = { day };
    habits.forEach(habit => {
      dayData[habit.id] = habit.data[i].value;
    });
    return dayData;
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={combinedData} margin={{ top: 5, right: 30, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
        <YAxis />
        <Tooltip />
        <Legend />
        {habits.map(habit => (
          <Bar key={habit.id} dataKey={habit.id} fill={habit.color} name={habit.name} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

