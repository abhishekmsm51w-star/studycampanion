import React, { useState, useEffect, useRef } from 'react';
import { Task, PomodoroSettings } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings2, 
  Volume2, 
  VolumeX, 
  Coffee, 
  Brain, 
  CheckCircle,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PomodoroTimerProps {
  activeFocusTask: Task | null;
  onIncrementPomodoro: (taskId: string) => void;
  onAddSessionStats: () => void;
}

export default function PomodoroTimer({
  activeFocusTask,
  onIncrementPomodoro,
  onAddSessionStats,
}: PomodoroTimerProps) {
  // Timer States
  const [settings, setSettings] = useState<PomodoroSettings>({
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
  });

  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [secondsLeft, setSecondsLeft] = useState(settings.workTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync settings changes to seconds left when not running
  useEffect(() => {
    if (!isRunning) {
      if (mode === 'work') {
        setSecondsLeft(settings.workTime * 60);
      } else if (mode === 'shortBreak') {
        setSecondsLeft(settings.shortBreak * 60);
      } else if (mode === 'longBreak') {
        setSecondsLeft(settings.longBreak * 60);
      }
    }
  }, [settings, mode]);

  // Audio synthesiser using Web Audio API
  const playChime = (isBreakStart: boolean) => {
    if (muted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (isBreakStart) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1); // A5
        osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.2); // D6
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.65);
      }
    } catch (e) {
      console.warn('Web Audio Context blocked/unsupported:', e);
    }
  };

  // Main Timer Tick Logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, secondsLeft]);

  const handleTimerComplete = () => {
    if (mode === 'work') {
      playChime(true);
      setCompletedSessions((prev) => prev + 1);
      onAddSessionStats();

      // If active task is pinned, increment its Pomodoro counter
      if (activeFocusTask) {
        onIncrementPomodoro(activeFocusTask.id);
      }

      // Check next mode: short break or long break
      const isLongBreakTime = (completedSessions + 1) % settings.longBreakInterval === 0;
      if (isLongBreakTime) {
        setMode('longBreak');
        setSecondsLeft(settings.longBreak * 60);
      } else {
        setMode('shortBreak');
        setSecondsLeft(settings.shortBreak * 60);
      }
    } else {
      playChime(false);
      setMode('work');
      setSecondsLeft(settings.workTime * 60);
    }
  };

  const toggleStart = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'work') {
      setSecondsLeft(settings.workTime * 60);
    } else if (mode === 'shortBreak') {
      setSecondsLeft(settings.shortBreak * 60);
    } else {
      setSecondsLeft(settings.longBreak * 60);
    }
  };

  const setManualMode = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'work') setSecondsLeft(settings.workTime * 60);
    if (newMode === 'shortBreak') setSecondsLeft(settings.shortBreak * 60);
    if (newMode === 'longBreak') setSecondsLeft(settings.longBreak * 60);
  };

  // Circular progress math
  const totalSeconds = mode === 'work' 
    ? settings.workTime * 60 
    : mode === 'shortBreak' 
    ? settings.shortBreak * 60 
    : settings.longBreak * 60;
  const progressPercentage = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const strokeDashoffset = 502 - (502 * progressPercentage) / 100;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-[32px] border border-[#E5E0D8] p-6 shadow-sm flex flex-col h-full justify-between">
      {/* Modes & Settings button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#F0EDE8] pb-4">
        <div className="flex bg-[#F5F2ED] p-0.5 rounded-full text-[10px]">
          <button
            onClick={() => setManualMode('work')}
            className={`px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1 cursor-pointer transition ${
              mode === 'work' ? 'bg-[#5A5A40] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Brain className="w-3 h-3" />
            Study
          </button>
          <button
            onClick={() => setManualMode('shortBreak')}
            className={`px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1 cursor-pointer transition ${
              mode === 'shortBreak' ? 'bg-[#5A5A40] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Coffee className="w-3 h-3" />
            Short
          </button>
          <button
            onClick={() => setManualMode('longBreak')}
            className={`px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1 cursor-pointer transition ${
              mode === 'longBreak' ? 'bg-[#5A5A40] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Coffee className="w-3 h-3" />
            Long
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setMuted(!muted)}
            className="p-1.5 hover:bg-[#FBF9F6] text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer transition"
            title={muted ? "Unmute sounds" : "Mute sounds"}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg cursor-pointer transition ${showSettings ? 'text-[#889681] bg-[#FAF3E0]' : 'text-gray-400 hover:text-gray-700 hover:bg-[#FBF9F6]'}`}
            title="Configure intervals"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center py-6">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
            {/* Background static circle */}
            <circle
              cx="90"
              cy="90"
              r="80"
              className="stroke-[#F5F2ED] fill-transparent stroke-[6]"
            />
            {/* Dynamic circle */}
            <motion.circle
              cx="90"
              cy="90"
              r="80"
              className={`fill-transparent stroke-[6] transition-all duration-300 ${
                mode === 'work' ? 'stroke-[#889681]' : 'stroke-[#8B734B]'
              }`}
              strokeLinecap="round"
              strokeDasharray="502"
              strokeDashoffset={strokeDashoffset}
            />
          </svg>

          {/* Time digits & Mode Status */}
          <div className="absolute text-center">
            <span className="block font-mono text-3xl font-bold tracking-tight text-[#5A5A40]">
              {formatTime(secondsLeft)}
            </span>
            <span className={`text-[9px] uppercase font-bold tracking-wider mt-0.5 block ${
              mode === 'work' ? 'text-[#889681]' : 'text-[#8B734B]'
            }`}>
              {mode === 'work' ? 'Deep Study' : 'Rest Break'}
            </span>
          </div>
        </div>

        {/* Selected Focus Task Banner */}
        <div className="mt-4 w-full max-w-sm text-center px-2">
          {activeFocusTask ? (
            <div className="inline-flex items-center gap-1.5 py-1 px-3.5 bg-[#FBF9F6] border border-[#E5E0D8] rounded-full text-[11px] text-[#5A5A40]">
              <CheckCircle className="w-3.5 h-3.5 text-[#889681] animate-pulse" />
              <span className="font-semibold truncate max-w-[180px]">
                Focusing: {activeFocusTask.title}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-gray-400 font-medium italic">
              No active task set. Use Planner to lock focus.
            </span>
          )}
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center justify-center gap-3 border-t border-[#F0EDE8] pt-4">
        <button
          onClick={handleReset}
          className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-[#FBF9F6] border border-[#E5E0D8] rounded-full cursor-pointer transition"
          title="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleStart}
          className={`flex items-center justify-center gap-1.5 px-6 py-2 rounded-full font-bold text-xs cursor-pointer text-white shadow-xs transition duration-200 ${
            isRunning 
              ? 'bg-rose-500 hover:bg-rose-600' 
              : 'bg-[#889681] hover:bg-[#778570]'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
        </button>
      </div>

      {/* Settings Panel Drawdown */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 p-3.5 border border-[#E5E0D8] bg-[#FBF9F6] rounded-2xl text-[11px] space-y-3.5"
          >
            <div className="flex items-center justify-between border-b border-[#F0EDE8] pb-1.5">
              <span className="font-bold text-[#5A5A40] flex items-center gap-1">
                <Timer className="w-3.5 h-3.5" /> Timer Customization
              </span>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer text-[10px]"
              >
                Close
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">
                  Study Duration: <span className="font-mono text-[#889681]">{settings.workTime}m</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={settings.workTime}
                  onChange={(e) => setSettings({ ...settings, workTime: parseInt(e.target.value) })}
                  className="w-full h-1 bg-[#F5F2ED] rounded-lg appearance-none cursor-pointer accent-[#889681]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">
                  Short Break: <span className="font-mono text-[#889681]">{settings.shortBreak}m</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={settings.shortBreak}
                  onChange={(e) => setSettings({ ...settings, shortBreak: parseInt(e.target.value) })}
                  className="w-full h-1 bg-[#F5F2ED] rounded-lg appearance-none cursor-pointer accent-[#889681]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">
                  Long Break: <span className="font-mono text-[#889681]">{settings.longBreak}m</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="5"
                  value={settings.longBreak}
                  onChange={(e) => setSettings({ ...settings, longBreak: parseInt(e.target.value) })}
                  className="w-full h-1 bg-[#F5F2ED] rounded-lg appearance-none cursor-pointer accent-[#889681]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
