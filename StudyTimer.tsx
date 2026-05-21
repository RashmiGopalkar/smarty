import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, AlertTriangle, Coffee, Sparkles, HelpCircle, Trophy, Clock } from "lucide-react";

interface StudyTimerProps {
  onSessionComplete: (durationMinutes: number, points: number) => void;
  onSessionAbortedQuickly: (pointsDeducted: number) => void;
  userPoints: number;
  onSmartySpeak: (text: string) => void;
}

export default function StudyTimer({
  onSessionComplete,
  onSessionAbortedQuickly,
  userPoints,
  onSmartySpeak
}: StudyTimerProps) {
  // Configurable study/break states
  const [studyMinutes, setStudyMinutes] = useState(30);
  const [breakMinutes, setBreakMinutes] = useState(5);
  
  const [mode, setMode] = useState<"idle" | "study" | "break">("idle");
  const [isActive, setIsActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30 * 60);
  const [completedCycles, setCompletedCycles] = useState(0);
  
  // Early break AI analysis status
  const [isAnalyzingBreak, setIsAnalyzingBreak] = useState(false);
  const [aiBreakOpinion, setAiBreakOpinion] = useState("");

  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize timer values when idle
  useEffect(() => {
    if (mode === "idle") {
      setSecondsRemaining(studyMinutes * 60);
    }
  }, [studyMinutes, mode]);

  useEffect(() => {
    if (isActive && secondsRemaining > 0) {
      intervalIdRef.current = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      handlePhaseCompletion();
    }

    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    };
  }, [isActive, secondsRemaining]);

  const handlePhaseCompletion = () => {
    if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    setIsActive(false);

    if (mode === "study") {
      // Award points for completing study portion
      const pointsAwarded = 15;
      onSessionComplete(studyMinutes, pointsAwarded);
      
      const slogans = [
        `YESSS! You crushed those ${studyMinutes} minutes! That is +${pointsAwarded} points for you! Time for a friendly ${breakMinutes}-minute tea break!`,
        `Boom! Study session accomplished! +${pointsAwarded} points! You're making elite progress. Go stretch out!`,
        `Masterclass study block! You got +${pointsAwarded} points! Enjoy your break, buddy, you earned it!`
      ];
      const selected = slogans[Math.floor(Math.random() * slogans.length)];
      onSmartySpeak(selected);

      // Transistion to break
      setMode("break");
      setSecondsRemaining(breakMinutes * 60);
      setCompletedCycles((c) => c + 1);
    } else if (mode === "break") {
      onSmartySpeak("Break is over, champion! Our focus battery is 100% recharged. Let's start the next study cycle!");
      setMode("study");
      setSecondsRemaining(studyMinutes * 60);
    }
    
    setIsActive(true); // Auto-advancing loop
  };

  const handleStart = () => {
    if (mode === "idle") {
      setMode("study");
      setSecondsRemaining(studyMinutes * 60);
      onSmartySpeak(`Let's do this! Starting our ${studyMinutes} minutes of absolute focus! Remember, no distractions!`);
    } else {
      onSmartySpeak("Timer resumed! Let's get back in the flow!");
    }
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
    onSmartySpeak("Timer paused! Catch your breath, but don't wander off too far!");
  };

  const handleReset = () => {
    setIsActive(false);
    setMode("idle");
    setSecondsRemaining(studyMinutes * 60);
    onSmartySpeak("Timer has been reset. Ready to go whenever you are!");
  };

  // Point deduction warning logic if ending session early!
  const handleEndSessionQuickly = () => {
    const elapsedSeconds = (studyMinutes * 60) - secondsRemaining;
    const isVeryQuickExit = elapsedSeconds < (studyMinutes * 60 * 0.7); // less than 70% study time completed

    setIsActive(false);
    
    if (isVeryQuickExit && mode === "study") {
      const penalty = 5;
      onSessionAbortedQuickly(penalty);
      
      const angryButFriendlySlogans = [
        `Oh no, buddy! We gave up early! I had to deduction-zap ${penalty} points from your storage. But hey, failure is just a setup for a massive comeback! Let's smash our next block!`,
        `Ah, we quit too quick! -${penalty} points! But don't feel bad, even the greatest scholars take detours. Let's start fresh in a bit!`,
        `Focus block cut short! We lost ${penalty} points, but I'm still cheering for you! Reset and let's conquer the next block!`
      ];
      const selectedPhrase = angryButFriendlySlogans[Math.floor(Math.random() * angryButFriendlySlogans.length)];
      onSmartySpeak(selectedPhrase);
    } else {
      // Safely completed most or is on break
      if (mode === "study") {
        const points = 5;
        onSessionComplete(Math.floor(elapsedSeconds / 60), points);
        onSmartySpeak(`Nice job pushing through most of it! Here is a partial +${points} points for your hard work.`);
      } else {
        onSmartySpeak("Study session concluded happily!");
      }
    }

    setMode("idle");
    setSecondsRemaining(studyMinutes * 60);
  };

  // AI-powered early break analyzer
  const askSmartyForBreakAnalysis = async () => {
    setIsAnalyzingBreak(true);
    setAiBreakOpinion("");
    
    const studyElapsedSec = (studyMinutes * 60) - secondsRemaining;
    const studyElapsedMin = Math.round(studyElapsedSec / 60);
    const studyRemainingMin = Math.round(secondsRemaining / 60);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Hey Smarty! Can I take an early break? I am currently studying a ${studyMinutes} minutes block and have only done ${studyElapsedMin} minutes so far. We have completed ${completedCycles} full cycles today. Give me an energetic, funny, and realistic recommendation on whether to take an early breaks or wait.`
            }
          ],
          context: {
            session: {
              activeMode: mode,
              elapsedMins: studyElapsedMin,
              remainingMins: studyRemainingMin,
              cycleCount: completedCycles
            }
          }
        })
      });

      const data = await response.json();
      const text = data.text || "Mmm, study some more first!";
      setAiBreakOpinion(text);
      onSmartySpeak(text);
    } catch (e) {
      console.error(e);
      setAiBreakOpinion("Aha! You are doing great, but try to sit tight for another 5 minutes before splashing your eyes with water. Keep it up!");
    } finally {
      setIsAnalyzingBreak(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Color-coded statuses for timer rings
  const getTimerStyles = () => {
    if (mode === "study") return { border: "border-amber-500", text: "text-amber-600", bg: "bg-amber-50" };
    if (mode === "break") return { border: "border-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50" };
    return { border: "border-slate-300", text: "text-slate-600", bg: "bg-slate-50" };
  };

  const timerStyle = getTimerStyles();

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 flex flex-col md:flex-row items-center gap-8">
      
      {/* Visual Timer circle element */}
      <div className="flex flex-col items-center">
        <div id="dynamic-timer-wheel" className={`w-52 h-52 rounded-full border-8 border-dashed ${timerStyle.border} ${timerStyle.bg} flex flex-col items-center justify-center relative transition-colors duration-500`}>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold font-mono">
            {mode === "idle" ? "READY" : mode === "study" ? "STUDY BLOCK" : "BREAK CHILL"}
          </span>
          <span className="text-4xl font-extrabold text-slate-800 font-mono mt-2" id="timer-countdown-display">
            {formatTime(secondsRemaining)}
          </span>
          {completedCycles > 0 && (
            <span className="absolute bottom-6 flex items-center gap-1 text-[11px] font-bold text-violet-500/85">
              <Sparkles className="w-3.5 h-3.5 animate-bounce" />
              <span>Block #{completedCycles + 1}</span>
            </span>
          )}
        </div>

        {/* Dynamic points notification */}
        <div className="mt-4 flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-300/40 text-xs font-bold text-amber-700">
          <Trophy className="w-3.5 h-3.5" />
          <span>Completed Cycles: {completedCycles} ({completedCycles * 15} pts generated)</span>
        </div>
      </div>

      {/* Control panel for Timer */}
      <div className="flex-1 w-full">
        <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <Clock className="w-5.5 h-5.5 text-amber-500 animate-pulse" />
          Buddy study focus Loop
        </h3>
        
        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
          Default length is set to 30 min with 5 min breaks. Complete full focus periods to score points!
          Warning: points will be deducted if ended prematurely or aborted!
        </p>

        {/* Interactive Slider Setup - Accessible only when idle */}
        <div className="grid grid-cols-2 gap-4 my-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Study minutes ({studyMinutes}m)
            </label>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={studyMinutes}
              disabled={mode !== "idle"}
              onChange={(e) => setStudyMinutes(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Break minutes ({breakMinutes}m)
            </label>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={breakMinutes}
              disabled={mode !== "idle"}
              onChange={(e) => setBreakMinutes(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {!isActive ? (
            <button
              onClick={handleStart}
              id="study-timer-start-btn"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-md hover:shadow-violet-600/10 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{mode === "idle" ? "Start Study" : "Resume Flow"}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              id="study-timer-pause-btn"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-2xl text-sm transition-all shadow-md cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause Time</span>
            </button>
          )}

          {mode !== "idle" && (
            <>
              <button
                onClick={handleEndSessionQuickly}
                id="quit-session-btn"
                className="flex items-center gap-1 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold rounded-2xl text-xs transition-all cursor-pointer"
                title="End study session now"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Finish Early</span>
              </button>

              <button
                onClick={askSmartyForBreakAnalysis}
                disabled={isAnalyzingBreak}
                id="ai-break-opinion-btn"
                className="flex items-center gap-1 px-4 py-2.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 font-bold rounded-2xl text-xs transition-all cursor-pointer"
              >
                {isAnalyzingBreak ? "Smarty Thinking..." : "Ask Smarty for Early Break?"}
              </button>
            </>
          )}

          {mode === "idle" && (
            <button
              onClick={handleReset}
              className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              title="Reset configuration"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* AI Break decision popup info */}
        {aiBreakOpinion && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 text-xs text-violet-950 font-medium relative animate-fade-in line-clamp-4">
            <span className="absolute -top-2 left-4 px-2 py-0.5 bg-violet-600 text-[9px] text-white font-extrabold rounded-full">
              SMARTY OPINION
            </span>
            <p className="mt-1 leading-relaxed">"{aiBreakOpinion}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
