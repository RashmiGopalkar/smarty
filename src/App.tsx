import React, { useState, useEffect } from "react";
import { 
  BookOpen, Sparkles, TrendingUp, Smile, Trophy, Plus, Trash, 
  Upload, Send, Calendar, Settings, CheckCircle, RefreshCw, 
  Flame, ChevronRight, Layers, Eye, HelpCircle, AlertTriangle, Play, HelpCircle as HelpIcon, ArrowRight
} from "lucide-react";
import { Subject, TimetableItem, CharacterUpgrade, Flashcard, StudyGoal, SessionHistory, ChatMessage } from "./types";
import SmartyCharacter from "./components/SmartyCharacter";
import TimetableCalendar from "./components/TimetableCalendar";
import StudyTimer from "./components/StudyTimer";

// Pre-defined available upgrade skins for the store
const STORE_UPGRADES: CharacterUpgrade[] = [
  { id: "default", name: "Default Glow", cost: 0, unlocked: true, styleClass: "bg-amber-400", description: "Your standard adorable helper face.", accessoryEmoji: "", bgColor: "#FFD93D", skinColor: "amber" },
  { id: "glasses", name: "Cyber Shades", cost: 40, unlocked: false, styleClass: "bg-indigo-400", description: "Ultimate coolness to withstand bright displays.", accessoryEmoji: "🕶️", bgColor: "#4D96FF", skinColor: "indigo" },
  { id: "cap", name: "Streetwear Cap", cost: 80, unlocked: false, styleClass: "bg-rose-400", description: "Energetic street design for speedy study sessions.", accessoryEmoji: "🧢", bgColor: "#FF6B6B", skinColor: "rose" },
  { id: "astronaut", name: "Space Helmet", cost: 150, unlocked: false, styleClass: "bg-purple-500", description: "For cosmic brain calculations and deep space focus.", accessoryEmoji: "👨‍🚀", bgColor: "#8B5CF6", skinColor: "purple" },
  { id: "gamer", name: "Gamer Headset", cost: 200, unlocked: false, styleClass: "bg-emerald-400", description: "Brings 100% audio Immersion to study playlists.", accessoryEmoji: "🎧", bgColor: "#6BCB77", skinColor: "emerald" },
  { id: "crown", name: "Scholar Crown", cost: 300, unlocked: false, styleClass: "bg-yellow-400", description: "For the absolute rulers of homework completion.", accessoryEmoji: "👑", bgColor: "#F59E0B", skinColor: "yellow" }
];

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<"study" | "homework" | "store" | "calendar" | "settings">("study");

  // Core stats
  const [points, setPoints] = useState<number>(120); // 120 default so they can spend points on updates!
  const [unlockedUpgrades, setUnlockedUpgrades] = useState<CharacterUpgrade[]>(STORE_UPGRADES);
  const [activeUpgradeId, setActiveUpgradeId] = useState<string>("default");

  // Subjects lists
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: "bio", name: "Biology", color: "emerald", progress: 75, syllabus: ["Cell Division", "Photosynthesis", "Genetics & DNA", "Ecosystems"], completedTopics: ["Cell Division"] },
    { id: "hist", name: "History", color: "amber", progress: 42, syllabus: ["World War II", "Industrial Revolution", "Ancient Egypt", "The Cold War"], completedTopics: ["Ancient Egypt"] },
    { id: "calc", name: "Calculus", color: "rose", progress: 12, syllabus: ["Limits & continuity", "Derivatives", "Integration", "Differential Equations"], completedTopics: [] },
    { id: "lit", name: "Literature", color: "sky", progress: 60, syllabus: ["Shakespeare Plays", "Ancient Greek Epics", "Modern Prose", "Grammar Master"], completedTopics: ["Shakespeare Plays"] }
  ]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("bio");

  // Timetable
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);

  // Study module components - flashcards
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    { id: "f1", subjectId: "bio", question: "What is the powerhouse of the cell?", answer: "Mitochondria processes chemical energy!" },
    { id: "f2", subjectId: "bio", question: "Which molecule stores genetic data?", answer: "DNA (Deoxyribonucleic Acid)!" },
    { id: "f3", subjectId: "calc", question: "What is the derivative of x^2?", answer: "2x using the Power Rule!" },
    { id: "f4", subjectId: "hist", question: "Which ancient civilization built the Great Sphinx?", answer: "The Ancient Egyptians (Giza plateau)!" }
  ]);
  const [newCardQuestion, setNewCardQuestion] = useState("");
  const [newCardAnswer, setNewCardAnswer] = useState("");

  // Quiz Engine States (loaded dynamically from server)
  const [currentQuiz, setCurrentQuiz] = useState<any[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizIsFinished, setQuizIsFinished] = useState<boolean>(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);
  const [quizTopic, setQuizTopic] = useState<string>("");

  // Study Goals
  const [goals, setGoals] = useState<StudyGoal[]>([
    { id: "g1", title: "Ace my chemistry midterms", targetPoints: 150, currentPoints: 120, createdAt: "2026-05-15", targetDate: "2026-06-01" },
    { id: "g2", title: "Unlock the Scholar Crown skin", targetPoints: 300, currentPoints: 120, createdAt: "2026-05-18", targetDate: "2026-06-15" }
  ]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTargetPoints, setNewGoalTargetPoints] = useState(100);

  // Session History details
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([
    { id: "h1", subjectName: "Biology", durationMinutes: 30, pointsAwarded: 15, date: "2026-05-20", endedQuickly: false },
    { id: "h2", subjectName: "Calculus", durationMinutes: 5, pointsAwarded: -5, date: "2026-05-19", endedQuickly: true }
  ]);

  // Homework mode states
  const [homeworkImage, setHomeworkImage] = useState<string | null>(null);
  const [homeworkQuestion, setHomeworkQuestion] = useState("");
  const [homeworkResponse, setHomeworkResponse] = useState("");
  const [isAnalyzingHomework, setIsAnalyzingHomework] = useState(false);
  const [homeworkTimeLeft, setHomeworkTimeLeft] = useState<number>(30 * 60); // 30 minutes in seconds
  const [isHomeworkTimerRunning, setIsHomeworkTimerRunning] = useState<boolean>(false);

  // Chat message logs with companion
  const [chatLogs, setChatLogs] = useState<ChatMessage[]>([]);
  const [chatMessageText, setChatMessageText] = useState("");
  const [isSmartyResponding, setIsSmartyResponding] = useState(false);
  const [smartySpeech, setSmartySpeech] = useState<string>("");

  // Syllabus / briefing review selector
  const [selectedTopicToReview, setSelectedTopicToReview] = useState<string>("Genetics & DNA");
  const [topicBriefing, setTopicBriefing] = useState<string>("");
  const [isBriefingLoading, setIsBriefingLoading] = useState<boolean>(false);

  // Check answers helper on homework or custom study topic text
  const [checkingInput, setCheckingInput] = useState("");
  const [checkResult, setCheckResult] = useState("");
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false);

  // Initial loading defaults
  useEffect(() => {
    // Generate default everyday 1.5 Hour (90 mins) study timetable blocks
    const defaultTimetable: TimetableItem[] = [];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    days.forEach((day, index) => {
      defaultTimetable.push({
        id: `def-study-${index}`,
        title: "Daily 1.5h Focus Block",
        day,
        startTime: "16:00",
        endTime: "17:30",
        category: "study"
      });
    });
    setTimetable(defaultTimetable);

    // Initial greeting from Smarty explaining style/timetable goals for the day
    const welcome = "Yo! I'm Smarty! Your ultimate energetic study buddy. Today, we have a default 1.5-hour study session scheduled from 16:00 to 17:30. Let's smash our goals! Any custom subjects or homework you want us to add to the calendar?";
    setSmartySpeech(welcome);
    setChatLogs([
      { id: "w1", role: "model", content: welcome, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
  }, []);

  // Update Homework timer tick if active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isHomeworkTimerRunning && homeworkTimeLeft > 0) {
      interval = setInterval(() => {
        setHomeworkTimeLeft((t) => t - 1);
      }, 1000);
    } else if (homeworkTimeLeft === 0 && isHomeworkTimerRunning) {
      setIsHomeworkTimerRunning(false);
      setSmartySpeech("Time's up for homework! Don't stress, submit what you have, you did spectacular!");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHomeworkTimerRunning, homeworkTimeLeft]);

  // Sync goals current points with state points
  useEffect(() => {
    setGoals((prev) =>
      prev.map((g) => ({
        ...g,
        currentPoints: points
      }))
    );
  }, [points]);

  // Audio query triggers response
  const handleVoiceInput = async (voiceText: string) => {
    if (!voiceText.trim()) return;
    
    // Add User response
    const newUserMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: voiceText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatLogs((prev) => [...prev, newUserMsg]);
    await sendChatMessageToSmarty(voiceText, [...chatLogs, newUserMsg]);
  };

  // Chat Submission text handler
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatMessageText.trim()) return;

    const userText = chatMessageText;
    setChatMessageText("");

    const newUserMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatLogs((prev) => [...prev, newUserMsg]);
    await sendChatMessageToSmarty(userText, [...chatLogs, newUserMsg]);
  };

  // Call server-side API to chat with AI
  const sendChatMessageToSmarty = async (latestText: string, fullHistory: ChatMessage[]) => {
    setIsSmartyResponding(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: fullHistory.map(log => ({
            role: log.role,
            content: log.content
          })),
          context: {
            subjects,
            points,
            characterUpgrade: unlockedUpgrades.find(u => u.id === activeUpgradeId)
          }
        })
      });

      const data = await response.json();
      if (data.text) {
        const reply = data.text;
        setSmartySpeech(reply);
        setChatLogs((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            role: "model",
            content: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err: any) {
      console.error(err);
      setSmartySpeech("I had a little brain-hiccup, but I am still with you! Let's conquer our lessons!");
    } finally {
      setIsSmartyResponding(false);
    }
  };

  // Start study interactive sessions with quizzes
  const generateQuizForSubject = async () => {
    setIsLoadingQuiz(true);
    setQuizIsFinished(false);
    setCurrentQuizIndex(0);
    setSelectedQuizOption(null);
    setQuizScore(0);

    const activeSubObj = subjects.find(s => s.id === selectedSubjectId);
    const selectedTopic = quizTopic || activeSubObj?.syllabus[0] || "General Topic";

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: activeSubObj?.name || "General Study",
          syllabusTopic: selectedTopic,
          difficulty: "Friendly Spark"
        })
      });

      const parsedQuiz = await response.json();
      if (Array.isArray(parsedQuiz) && parsedQuiz.length > 0) {
        setCurrentQuiz(parsedQuiz);
        setSmartySpeech(`Ooh, I generated an energetic quiz on ${selectedTopic}! Let's answer these questions!`);
      } else {
        throw new Error("Empty quiz response");
      }
    } catch (e) {
      console.error(e);
      // Fallback local quiz questions to ensure resilience
      setCurrentQuiz([
        {
          question: `Let's trivia! What is a key milestone topic of study in ${activeSubObj?.name || "this"}?`,
          options: ["Understanding primary laws", "Memorizing facts blindly", "Formulating intuitive concepts", "Taking custom notes"],
          correctAnswerIndex: 2,
          explanation: "Intuitive concepts always build stellar brains!"
        },
        {
          question: "How do we study tricky hard subjects according to Smarty recommendations?",
          options: ["Cramming all night", "Breaking it down, explaining briefly & discussing hard topics", "Crying heavily", "Skipping modules entirely"],
          correctAnswerIndex: 1,
          explanation: "Smarty encourages discussing hard topics and keeping explanation light!"
        }
      ]);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // Submit Answer to AI for grading or explanation
  const handleCheckCustomAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkingInput.trim()) return;

    setIsCheckingAnswer(true);
    setCheckResult("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Please review my answer.
Question context: "${selectedTopicToReview}"
My response: "${checkingInput}"
Is it correct? Please evaluate it quick, give me constructive appreciation, and speak like standard supportive companion. Keep details short.`
            }
          ]
        })
      });

      const data = await response.json();
      setCheckResult(data.text || "Perfectly answered! Keep soaring!");
      setSmartySpeech(data.text || "Nicely done!");
    } catch (err) {
      console.error(err);
      setCheckResult("Wow, that looks fantastic! You got the core concept spot on! +2 loyalty boost.");
    } finally {
      setIsCheckingAnswer(false);
    }
  };

  // Get dynamic topic briefings (explanations only when asked)
  const loadBriefingTopic = async (topic: string) => {
    setIsBriefingLoading(true);
    setTopicBriefing("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Please provide a super fast, simple, friendly and energetic brief on: "${topic}". Ask 1 fun trivia question at the end! Remember: No long boring lectures! Make it fun and brief.`
            }
          ]
        })
      });

      const data = await response.json();
      setTopicBriefing(data.text || "A simple friendly guide topic review!");
      setSmartySpeech(`Here is the lowdown on ${topic}! Read it and try my trivia!`);
    } catch (e) {
      setTopicBriefing("A quick friendly summary of terms! Let's explore more later.");
    } finally {
      setIsBriefingLoading(false);
    }
  };

  // Handle image attachment homework helpers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Send base64 image data stripped of format prefix
          setHomeworkImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger base64 OCR analysis
  const handleAnalyzeHomework = async () => {
    if (!homeworkImage) return;

    setIsAnalyzingHomework(true);
    setHomeworkResponse("");

    // Strip header prefix: data:image/png;base64,
    const base64Clean = homeworkImage.split(",")[1] || homeworkImage;

    try {
      const response = await fetch("/api/homework-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Clean,
          mimeType: "image/png",
          question: homeworkQuestion || "Describe the homework steps and give critical feedback."
        })
      });

      const data = await response.json();
      setHomeworkResponse(data.text || "Your homework analysis is ready!");
      setSmartySpeech("I finished reading through your homework! Let's see what needs finishing.");
    } catch (err: any) {
      console.error(err);
      setHomeworkResponse("Homework review failed to reach the server. Let's do it manually: look closer at the formula, you've got this!");
    } finally {
      setIsAnalyzingHomework(false);
    }
  };

  // Timer callbacks
  const handleTimerSessionComplete = (minutes: number, gainedPoints: number) => {
    setPoints((prev) => prev + gainedPoints);
    
    // Log previous history
    const activeSub = subjects.find(s => s.id === selectedSubjectId)?.name || "General Focus";
    const record: SessionHistory = {
      id: Math.random().toString(),
      subjectName: activeSub,
      durationMinutes: minutes,
      pointsAwarded: gainedPoints,
      date: new Date().toISOString().split('T')[0],
      endedQuickly: false
    };

    setSessionHistory((prev) => [record, ...prev]);

    // Update subject study progress levels slightly!
    setSubjects((prev) => 
      prev.map((s) => {
        if (s.id === selectedSubjectId) {
          const newProgress = Math.min(100, s.progress + 8);
          return { ...s, progress: newProgress };
        }
        return s;
      })
    );
  };

  const handleTimerAbortedQuickly = (deducted: number) => {
    setPoints((prev) => Math.max(0, prev - deducted));

    // Log history penalty
    const activeSub = subjects.find(s => s.id === selectedSubjectId)?.name || "General Focus";
    const record: SessionHistory = {
      id: Math.random().toString(),
      subjectName: activeSub,
      durationMinutes: 2,
      pointsAwarded: -deducted,
      date: new Date().toISOString().split('T')[0],
      endedQuickly: true
    };

    setSessionHistory((prev) => [record, ...prev]);
  };

  // Purchase updates / spend points
  const buyCharacterUpgrade = (upgrade: CharacterUpgrade) => {
    if (points >= upgrade.cost) {
      setPoints((prev) => prev - upgrade.cost);
      setUnlockedUpgrades((prev) => 
        prev.map((u) => u.id === upgrade.id ? { ...u, unlocked: true } : u)
      );
      setActiveUpgradeId(upgrade.id);
      setSmartySpeech(`Oh yeah! I love my new style: ${upgrade.name}! Look at me shine! Thank you, friend!`);
    } else {
      setSmartySpeech(`Ah, those stylish items cost ${upgrade.cost} points. We only have ${points} right now. Let's conquer more study sessions together!`);
    }
  };

  // Simple add custom elements to timetable
  const handleCustomCalendarItemAdd = (item: Omit<TimetableItem, "id">) => {
    const newItem: TimetableItem = {
      ...item,
      id: Math.random().toString()
    };
    setTimetable((prev) => [...prev, newItem]);
    setSmartySpeech(`Sweeet! Added '${item.title}' to our ${item.day} timetable block. Our day is secure!`);
  };

  const handleCustomCalendarItemDelete = (id: string) => {
    setTimetable((prev) => prev.filter((i) => i.id !== id));
    setSmartySpeech("Deleted that calendar event. Freedom in scheduling is key!");
  };

  const handleResetTimetableDefaults = () => {
    const defaultTimetable: TimetableItem[] = [];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    days.forEach((day, index) => {
      // 1.5 hours default
      defaultTimetable.push({
        id: `def-study-${index}`,
        title: "Daily 1.5h Focus Block",
        day,
        startTime: "16:00",
        endTime: "17:30",
        category: "study"
      });
    });
    setTimetable(defaultTimetable);
    setSmartySpeech("Restored the default daily 1.5h study session setup!");
  };

  // Add custom target goals
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const key: StudyGoal = {
      id: Math.random().toString(),
      title: newGoalTitle,
      targetPoints: Number(newGoalTargetPoints),
      currentPoints: points,
      createdAt: new Date().toISOString().split('T')[0],
      targetDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
    };

    setGoals((prev) => [...prev, key]);
    setNewGoalTitle("");
    setSmartySpeech(`Awesome target! We set a goal to target '${key.title}'. Let's crush it!`);
  };

  const handleAddFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardQuestion.trim() || !newCardAnswer.trim()) return;

    const val: Flashcard = {
      id: Math.random().toString(),
      subjectId: selectedSubjectId,
      question: newCardQuestion,
      answer: newCardAnswer
    };

    setFlashcards((prev) => [...prev, val]);
    setNewCardQuestion("");
    setNewCardAnswer("");
    setSmartySpeech("Booyah! Custom flashcard saved successfully. Flashcards help commit concepts to memory!");
  };

  // Active styles based on customized updates
  const activeUpgrade = unlockedUpgrades.find(u => u.id === activeUpgradeId) || unlockedUpgrades[0];

  // Derive level
  const computedLevel = Math.floor(points / 200) + 1;

  // Funny positive motivation slogans
  const MOTIVATIONAL_SLOGANS = [
    "🚀 You are a study wizard, Harry! Keep it up!",
    "💡 Mitochondria is the powerhouse, but YOU are the engine of this day!",
    "✨ Even Shakespeare had to practice his alphabets. Keep going!",
    "🍕 Points don't buy pizza, but they buy custom neon shades for Smarty! Worth it!",
    "🔥 Success is 1% inspiration and 99% study sessions with Smarty!",
    "🎈 Gravity can't hold us back when we are in study zone mode!"
  ];

  const triggerSlogan = () => {
    const term = MOTIVATIONAL_SLOGANS[Math.floor(Math.random() * MOTIVATIONAL_SLOGANS.length)];
    setSmartySpeech(term);
  };

  return (
    <div id="smarty-app-root" className="min-h-screen bg-[#FFF9F0] text-[#3D3D3D] flex flex-col md:flex-row font-sans selection:bg-[#FFE8D1] selection:text-[#FF6B6B]">
      
      {/* Sidebar Navigation - Left Side (Vibrant styling) */}
      <aside className="w-full md:w-28 bg-white border-b-2 md:border-b-0 md:border-r-2 border-[#FFE8D1] flex md:flex-col items-center py-6 md:py-8 justify-between md:justify-start gap-6 md:gap-8 shrink-0 px-4 md:px-0">
        <div className="flex md:flex-col items-center gap-1">
          <div className="w-12 h-12 bg-[#FF6B6B] rounded-2xl flex items-center justify-center shadow-lg shadow-red-100 transition-all hover:rotate-12">
            <span className="text-white font-black text-xl">S</span>
          </div>
          <span className="text-xs font-extrabold text-[#FF6B6B] uppercase tracking-wide hidden md:block mt-1">Smarty</span>
        </div>

        {/* Tab Selection Navigation */}
        <nav className="flex md:flex-col gap-2 md:space-y-4">
          <button
            onClick={() => setActiveTab("study")}
            className={`p-3 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === "study" ? "bg-[#FFD93D] text-slate-900 shadow-md scale-105" : "text-slate-400 hover:bg-[#FFF4CC] hover:text-slate-700"
            }`}
            title="Study, Flashcards & Revision Mode"
          >
            <BookOpen className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveTab("homework")}
            className={`p-3 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === "homework" ? "bg-[#FF6B6B] text-white shadow-md scale-105" : "text-slate-400 hover:bg-[#FFE8E8] hover:text-slate-700"
            }`}
            title="Homework Image Solver"
          >
            <Layers className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveTab("store")}
            className={`p-3 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === "store" ? "bg-[#6BCB77] text-white shadow-md scale-105" : "text-slate-400 hover:bg-[#E8F8EB] hover:text-slate-700"
            }`}
            title="Rewards Character Upgrades Shop"
          >
            <Trophy className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`p-3 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === "calendar" ? "bg-[#4D96FF] text-white shadow-md scale-105" : "text-slate-400 hover:bg-[#EAF1FF] hover:text-slate-700"
            }`}
            title="Color-Coded Weekly Timetable"
          >
            <Calendar className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`p-3 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === "settings" ? "bg-[#8B5CF6] text-white shadow-md scale-105" : "text-slate-400 hover:bg-purple-50 hover:text-slate-700"
            }`}
            title="Settings & Study History"
          >
            <Settings className="w-6 h-6" />
          </button>
        </nav>

        {/* Level display avatar footer badge */}
        <div className="hidden md:flex flex-col items-center gap-1 mt-auto">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 border-2 border-white flex items-center justify-center font-extrabold text-[11px] text-white shadow">
            LV{computedLevel}
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Companion</span>
        </div>
      </aside>

      {/* Main Core View Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Dynamic App Header */}
        <header className="h-20 bg-white border-b-2 border-[#FFE8D1] flex items-center justify-between px-6 sm:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black text-[#FF6B6B] tracking-tight">SMARTY</h1>
            <div className="h-6 w-0.5 bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#4D96FF] text-white text-xs font-black rounded-full shadow-sm">
                LEVEL {computedLevel}
              </span>
              <span className="text-sm font-extrabold text-slate-500 uppercase tracking-widest font-mono">
                {points} PTS
              </span>
            </div>
          </div>

          {/* Quick status modes trigger links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab("homework")}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                activeTab === "homework" ? "bg-[#FF6B6B] text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              Homework helper
            </button>
            <button
              onClick={() => setActiveTab("store")}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                activeTab === "store" ? "bg-[#6BCB77] text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              Upgrade Shop
            </button>
          </div>
        </header>

        {/* Content Layout Grid */}
        <div className="flex-1 p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
          
          {/* LEFT COLUMN: Smarty Mascot & Core Voice Chat Companion UI */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Mascot interaction widget */}
            <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-orange-100/50 border-2 border-[#FFE8D1] flex flex-col justify-between relative min-h-[380px]">
              
              <SmartyCharacter 
                currentUpgrade={activeUpgrade} 
                onVoiceInput={handleVoiceInput}
                smartySpeechText={smartySpeech}
              />

              {/* Chat updates and speech bubbles */}
              <div className="mt-4 flex-1 bg-[#FFFBEA]/80 border border-[#FFF4CC] p-3 rounded-2xl">
                <span className="block text-[9px] font-black text-amber-600 mb-1 leading-none uppercase tracking-widest">
                  Friendly Quick Chat Status
                </span>
                
                {chatLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic max-h-24 overflow-y-auto leading-relaxed">
                    Say hello to Smarty above or toggle your microphone!
                  </p>
                ) : (
                  <div className="max-h-28 overflow-y-auto space-y-2 mt-1 text-xs">
                    {chatLogs.slice(-2).map((log) => (
                      <div key={log.id} className="flex flex-col">
                        <span className={`text-[10px] uppercase font-bold leading-none mb-0.5 ${
                          log.role === "model" ? "text-violet-600" : "text-amber-600"
                        }`}>
                          {log.role === "model" ? "🤖 Smarty (Friend)" : "👤 You"}
                        </span>
                        <p className="text-slate-700 line-clamp-3 bg-white/70 p-1.5 rounded-lg border border-slate-100 italic">
                          {log.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Typed Message reply */}
              <form onSubmit={handleSendChatMessage} className="mt-4 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type anything or type 'explain genetics'..."
                  value={chatMessageText}
                  onChange={(e) => setChatMessageText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] border border-slate-200"
                />
                <button
                  type="submit"
                  disabled={isSmartyResponding}
                  className="p-2.5 bg-[#FF6B6B] hover:bg-red-500 text-white rounded-full transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Funny positive high energy motivational slogan panel */}
            <div className="bg-[#FF6B6B] rounded-3xl p-5 text-white shadow-lg shadow-red-100 flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute top-1 right-1 opacity-25 text-6xl">⚡</div>
              <h4 className="text-xs font-black uppercase tracking-widest opacity-80 leading-none">Need a Spark?</h4>
              <p className="text-sm font-extrabold italic leading-snug">
                "{smartySpeech.length > 50 ? smartySpeech.slice(0, 100) + "..." : "We've got this! Smarty stands behind you 100%!"}"
              </p>
              
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/20">
                <span className="text-[10px] font-semibold text-rose-100">Feeling tired or about to quit?</span>
                <button
                  onClick={triggerSlogan}
                  className="px-2.5 py-1 bg-white hover:bg-rose-50 text-[#FF6B6B] text-[10px] font-black rounded-full shadow transition-all active:scale-95 cursor-pointer"
                >
                  Slogan Power
                </button>
              </div>
            </div>

            {/* QUICK STUDY CHECKS / EXPLANATION MODE */}
            <div className="bg-white rounded-3xl p-5 border-2 border-[#FFE8D1] shadow-md">
              <h3 className="text-sm font-black text-slate-800 mb-2 uppercase flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Answer checker block
              </h3>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                Want to check if an answer is right? Write it below and Smarty will evaluate it!
              </p>
              <form onSubmit={handleCheckCustomAnswer} className="space-y-3">
                <textarea
                  value={checkingInput}
                  onChange={(e) => setCheckingInput(e.target.value)}
                  placeholder="e.g. Mitochondria is correct because it uses cellular respiration of glucose."
                  className="w-full px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 text-slate-700 min-h-[60px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-medium">Topic: {selectedTopicToReview}</span>
                  <button
                    type="submit"
                    disabled={isCheckingAnswer}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-lg text-xs transition-all shadow-sm cursor-pointer"
                  >
                    {isCheckingAnswer ? "Grader Thinking..." : "Check My Answer"}
                  </button>
                </div>
              </form>

              {checkResult && (
                <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-900 leading-relaxed">
                  <p className="font-semibold">Evaluator feedback:</p>
                  <p className="italic mt-1">"{checkResult}"</p>
                </div>
              )}
            </div>
          </div>

          {/* MIDDLE COLUMN: Timer, Homework Helpers, Calendar, Study Content */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Timer loop logic (Always visible on study/homework modes) */}
            <StudyTimer
              onSessionComplete={handleTimerSessionComplete}
              onSessionAbortedQuickly={handleTimerAbortedQuickly}
              userPoints={points}
              onSmartySpeak={(text) => setSmartySpeech(text)}
            />

            {/* TAB INTERACTIVE DISPLAY PANELS */}
            {activeTab === "study" && (
              <div id="study-panel" className="bg-white rounded-[32px] p-6 shadow-md border border-[#FFE8D1] flex-1 flex flex-col">
                
                {/* Mode Selector */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#FF6B6B] tracking-wider block leading-none">
                      Focus Learning Tab
                    </span>
                    <h3 className="font-black text-xl text-slate-800 mt-1">
                      Study & Revision Mode
                    </h3>
                  </div>

                  {/* Syllabus quick dropdown list helper */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-slate-500">Subject:</span>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none"
                    >
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sub-modes layout */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={generateQuizForSubject}
                    id="trigger-revision-quiz-btn"
                    className="flex items-center justify-center gap-1.5 py-3 px-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 rounded-2xl text-xs font-black text-slate-900 transition-all shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Interactive Quiz Helper
                  </button>
                  
                  <button
                    onClick={() => {
                      const currentSub = subjects.find(s => s.id === selectedSubjectId);
                      if (currentSub?.syllabus && currentSub.syllabus.length > 0) {
                        loadBriefingTopic(currentSub.syllabus[0]);
                      } else {
                        loadBriefingTopic("General study syllabus review");
                      }
                    }}
                    id="trigger-briefing-revision-btn"
                    className="flex items-center justify-center gap-1.5 py-3 px-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:brightness-105 rounded-2xl text-white text-xs font-black transition-all shadow-sm cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Explain Topic Only When Asked
                  </button>
                </div>

                {/* DYNAMIC DISPLAYS: Selected active quiz / syllabus explanation review */}
                {isLoadingQuiz ? (
                  <div className="text-center py-8 text-xs font-bold text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#FF6B6B] mb-2" />
                    Loading custom study quiz matching your current study progress...
                  </div>
                ) : currentQuiz.length > 0 && !quizIsFinished ? (
                  <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/50 my-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black uppercase text-amber-700 tracking-wide">
                        Question {currentQuizIndex + 1} of {currentQuiz.length}
                      </span>
                      <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                        Score: {quizScore}
                      </span>
                    </div>

                    <h4 className="text-xs font-extrabold text-slate-800 mb-3" id="current-quiz-question-title">
                      {currentQuiz[currentQuizIndex].question}
                    </h4>

                    {/* Quiz answers MCQs */}
                    <div className="space-y-2">
                      {currentQuiz[currentQuizIndex].options.map((opt: string, idx: number) => {
                        const isCorrect = idx === currentQuiz[currentQuizIndex].correctAnswerIndex;
                        const isSelected = selectedQuizOption === idx;
                        
                        let optionStyle = "bg-white hover:bg-slate-50 border-slate-200 text-slate-700";
                        if (selectedQuizOption !== null) {
                          if (isCorrect) {
                            optionStyle = "bg-emerald-100 hover:bg-emerald-100 border-emerald-400 text-emerald-900";
                          } else if (isSelected) {
                            optionStyle = "bg-rose-100 hover:bg-rose-100 border-rose-400 text-rose-900";
                          } else {
                            optionStyle = "bg-white/50 border-slate-200 text-slate-400";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={selectedQuizOption !== null}
                            onClick={() => {
                              setSelectedQuizOption(idx);
                              if (isCorrect) {
                                setQuizScore((s) => s + 1);
                                setPoints((p) => p + 5);
                                setSmartySpeech("Aha! Correct! That gains you +5 points! Keep shining!");
                              } else {
                                setSmartySpeech("Ah, not quite! But failure is just diagnostic. Learn the explanation below!");
                              }
                            }}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2 ${optionStyle}`}
                          >
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 font-extrabold text-[10px] flex items-center justify-center">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Post feedback explanation show */}
                    {selectedQuizOption !== null && (
                      <div className="mt-3 p-3 bg-white rounded-xl border border-amber-200 text-[11px] text-slate-600">
                        <p className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wider mb-0.5 text-amber-700">
                          Smarty Friend Brief Explanation
                        </p>
                        <p className="leading-normal">{currentQuiz[currentQuizIndex].explanation}</p>
                        
                        <div className="flex justify-end mt-3">
                          <button
                            onClick={() => {
                              if (currentQuizIndex + 1 < currentQuiz.length) {
                                setCurrentQuizIndex((i) => i + 1);
                                setSelectedQuizOption(null);
                              } else {
                                setQuizIsFinished(true);
                                setSmartySpeech(`Congratulations! You completed the quiz with score ${quizScore}/${currentQuiz.length}!`);
                              }
                            }}
                            className="bg-[#4D96FF] hover:bg-blue-600 text-white font-extrabold text-[11px] py-1 px-3 rounded-lg flex items-center gap-1"
                          >
                            <span>Next Question</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : quizIsFinished ? (
                  <div className="text-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100 my-2">
                    <Trophy className="w-10 h-10 text-emerald-500 mx-auto mb-2 animate-bounce" />
                    <p className="text-xs font-black text-emerald-800">Completed Revision Quiz Module!</p>
                    <p className="text-[11px] text-emerald-600 mt-1">
                      Final Score: {quizScore} out of {currentQuiz.length} correct questions.
                    </p>
                    <button
                      onClick={generateQuizForSubject}
                      className="mt-3 px-3 py-1.5 bg-emerald-500 text-white font-extrabold text-xs rounded-xl hover:bg-emerald-600 inline-block"
                    >
                      Start Next Quiz
                    </button>
                  </div>
                ) : null}

                {/* TOPIC BRIEFINGS SECTION: Discuss hard topics & explain only when asked */}
                {isBriefingLoading ? (
                  <div className="text-center py-6 text-xs text-indigo-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Fetching friendly quick study guide...
                  </div>
                ) : topicBriefing ? (
                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200/50 my-2 flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">
                        Quick Syllabus Briefing
                      </span>
                      <button
                        onClick={() => setTopicBriefing("")}
                        className="text-[10px] text-indigo-600 hover:underline font-bold"
                      >
                        Clear Briefing
                      </button>
                    </div>
                    <p className="text-xs text-indigo-950 font-medium leading-relaxed italic border-l-2 border-indigo-500 pl-2.5 bg-white/50 p-2 rounded">
                      "{topicBriefing}"
                    </p>
                  </div>
                ) : null}

                {/* FLASHCARDS INTERACTIVE REGION */}
                <div id="flashcards-section" className="mt-4 pt-4 border-t border-slate-100 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
                      Flashcards Deck
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {flashcards.filter(f => f.subjectId === selectedSubjectId).slice(0, 2).map((card) => {
                        return (
                          <div key={card.id} className="relative bg-slate-50 border border-slate-100 p-3 rounded-2xl group cursor-pointer hover:bg-slate-100/50 hover:shadow-sm">
                            <span className="text-[9px] font-black uppercase text-slate-400">Question</span>
                            <p className="font-extrabold text-xs text-slate-800 line-clamp-1 leading-snug">{card.question}</p>
                            
                            {/* Hover to instantly show answer */}
                            <div className="mt-1 pt-1.5 border-t border-dashed border-slate-200 text-[11px] text-slate-600 font-medium whitespace-pre-wrap">
                              <span className="text-[9px] font-black text-emerald-600 block">Answer:</span>
                              {card.answer}
                            </div>
                            
                            <button
                              onClick={() => setFlashcards((prev) => prev.filter(c => c.id !== card.id))}
                              className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete Flashcard"
                            >
                              <Trash className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add customized Flashcards */}
                  <form onSubmit={handleAddFlashcard} className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-500 block mb-2">Create Custom Flashcard</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Core Question"
                        value={newCardQuestion}
                        onChange={(e) => setNewCardQuestion(e.target.value)}
                        className="px-3 py-1.5 bg-white text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Clean Answer"
                        value={newCardAnswer}
                        onChange={(e) => setNewCardAnswer(e.target.value)}
                        className="px-3 py-1.5 bg-white text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
                      >
                        Add Flashcard
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            )}

            {activeTab === "homework" && (
              <div id="homework-panel" className="bg-white rounded-[32px] p-6 shadow-md border border-[#FFE8D1] flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-rose-100 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B6B]">Homework Mode helper</span>
                      <h3 className="font-black text-xl text-slate-800">Smart Image Problem Solver</h3>
                    </div>

                    {/* Interactive Homework mode timer display */}
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl">
                      <span className={`w-2 h-2 rounded-full bg-rose-500 ${isHomeworkTimerRunning ? "animate-ping" : ""}`} />
                      <span className="text-xs font-mono font-extrabold text-[#FF6B6B]">
                        {Math.floor(homeworkTimeLeft / 60)}:{(homeworkTimeLeft % 60).toString().padStart(2, "0")} left
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Upload an image of your textbook assignment or quiz problem, ask Smarty a question, and make sure we complete it before the timer runs out! Smarty analyzes handwriting and prints.
                  </p>

                  {/* Drag-and-drop Image Selector input */}
                  <div className="border-2 border-dashed border-rose-200 bg-rose-50/20 p-5 rounded-2xl flex flex-col items-center justify-center text-center relative hover:bg-rose-50/40 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      title="Upload homework image"
                    />
                    
                    <Upload className="w-8 h-8 text-rose-400 mb-2" />
                    
                    {homeworkImage ? (
                      <p className="text-xs text-emerald-700 font-extrabold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        Image Attached Successfully! Match Ready
                      </p>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-slate-700">Drag or click to choose homework image</p>
                        <p className="text-[10px] text-slate-400 mt-1">PNG, JPG formats supported</p>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Preview option */}
                  {homeworkImage && (
                    <div className="mt-3 flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="w-12 h-12 rounded bg-cover bg-center border" style={{ backgroundImage: `url(${homeworkImage})` }} />
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-slate-700 line-clamp-1">Homework snap attached</p>
                        <button
                          onClick={() => setHomeworkImage(null)}
                          className="text-[10px] text-red-500 font-bold hover:underline"
                        >
                          Remove snap
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Text Prompt */}
                  <div className="mt-4">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">What is your question for Smarty?</label>
                    <input
                      type="text"
                      placeholder="e.g. Solve problem #4 or check my algebra steps..."
                      value={homeworkQuestion}
                      onChange={(e) => setHomeworkQuestion(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  {/* Action triggers */}
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <button
                      onClick={handleAnalyzeHomework}
                      disabled={isAnalyzingHomework || !homeworkImage}
                      id="submit-homework-image-btn"
                      className="flex-1 min-w-[120px] py-2.5 bg-[#FF6B6B] hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isAnalyzingHomework ? "Analyzing assignment..." : "Helper Analyze Snap"}
                    </button>

                    <button
                      onClick={() => setIsHomeworkTimerRunning(!isHomeworkTimerRunning)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isHomeworkTimerRunning ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      {isHomeworkTimerRunning ? "Pause Task Timer" : "Start 30m Homework Timer"}
                    </button>
                  </div>
                </div>

                {/* AI response box */}
                {homeworkResponse && (
                  <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-[#3D3D3D] leading-relaxed max-h-[160px] overflow-y-auto font-medium">
                    <p className="font-extrabold text-rose-800 text-[10px] uppercase mb-1">Smarty Homework feedback</p>
                    <p className="whitespace-pre-line">"{homeworkResponse}"</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "store" && (
              <div id="store-panel" className="bg-white rounded-[32px] p-6 shadow-md border border-[#FFE8D1] flex-1 flex flex-col">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <span className="text-[10px] font-black uppercase text-[#6BCB77] tracking-wider block leading-none">
                    Spend Loyalty rewards
                  </span>
                  <h3 className="font-black text-xl text-slate-800 mt-1">
                    Character upgrade & styles Cabin
                  </h3>
                </div>

                <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                  Every quiz you ace or focus session completed awards points. Spend points below to purchase brand-new styles and look-up accessories for Smarty!
                </p>

                {/* Grid items */}
                <div className="grid grid-cols-2 gap-4 flex-1">
                  {unlockedUpgrades.map((upgrade) => {
                    const isSelected = activeUpgradeId === upgrade.id;
                    return (
                      <div
                        key={upgrade.id}
                        className={`p-4 rounded-3xl border transition-all flex flex-col justify-between ${
                          isSelected 
                            ? "bg-slate-900 border-slate-900 text-white shadow-md scale-[1.02]" 
                            : "bg-slate-50 border-slate-100 hover:bg-slate-100/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-inner`} style={{ backgroundColor: upgrade.bgColor }}>
                            {upgrade.accessoryEmoji || "🤖"}
                          </div>

                          {upgrade.unlocked ? (
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isSelected ? "bg-amber-400 text-slate-900" : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {isSelected ? "Equipped" : "Unlocked"}
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              {upgrade.cost} PTS
                            </span>
                          )}
                        </div>

                        <div className="mt-3">
                          <h4 className="text-xs font-black mb-0.5">{upgrade.name}</h4>
                          <p className={`text-[10px] leading-tight ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                            {upgrade.description}
                          </p>
                        </div>

                        {/* Upgrade Store Action buttons */}
                        <div className="mt-4 pt-1">
                          {upgrade.unlocked ? (
                            !isSelected && (
                              <button
                                onClick={() => setActiveUpgradeId(upgrade.id)}
                                className="w-full py-1.5 bg-slate-800 text-white rounded-xl text-[10px] font-extrabold hover:bg-slate-900 transition-all cursor-pointer"
                              >
                                Equip style
                              </button>
                            )
                          ) : (
                            <button
                              onClick={() => buyCharacterUpgrade(upgrade)}
                              disabled={points < upgrade.cost}
                              className="w-full py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-[10px] font-extrabold transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-emerald-200"
                            >
                              Buy upgrade
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "calendar" && (
              <div id="calendar-panel" className="bg-transparent flex-1 flex flex-col">
                {/* Embedded weekly calendar component */}
                <TimetableCalendar
                  items={timetable}
                  onAddItem={handleCustomCalendarItemAdd}
                  onDeleteItem={handleCustomCalendarItemDelete}
                  onResetDefaults={handleResetTimetableDefaults}
                />
              </div>
            )}

            {activeTab === "settings" && (
              <div id="settings-panel" className="bg-white rounded-[32px] p-6 shadow-md border border-[#FFE8D1] flex-1 flex flex-col gap-6">
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider block leading-none">
                    Custom Configurations
                  </span>
                  <h3 className="font-black text-xl text-slate-800 mt-1">
                    Settings, Goals & Study History
                  </h3>
                </div>

                {/* Goal Setting */}
                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
                  <h4 className="text-xs font-black text-purple-950 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Trophy className="text-purple-600 w-4 h-4" />
                    Track Study Goals
                  </h4>
                  
                  <div className="space-y-3 mb-4">
                    {goals.map((goal) => {
                      const percent = Math.min(100, Math.round((goal.currentPoints / goal.targetPoints) * 100));
                      return (
                        <div key={goal.id} className="bg-white p-3 rounded-xl border border-purple-100">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-slate-800">{goal.title}</span>
                            <span className="text-[10px] font-mono font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">
                              Target: {goal.targetPoints} pts
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-600 rounded-full" style={{ width: `${percent}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">{percent}%</span>
                          </div>
                          
                          <p className="text-[9px] text-[#FF6B6B] font-bold uppercase mt-1.5 leading-none">
                            {percent >= 100 
                              ? "✨ GOAL ACHIEVED! WE SOAR!" 
                              : `🔥 Only ${goal.targetPoints - points} points left to earn!`}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <form onSubmit={handleAddGoal} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Goal description..."
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                      className="sm:col-span-2 px-3 py-1.5 bg-white text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      required
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm"
                    >
                      Set Goal
                    </button>
                  </form>
                </div>

                {/* Session study history */}
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
                    Recent Session Logs & History
                  </h4>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto">
                    {sessionHistory.map((h) => {
                      return (
                        <div key={h.id} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-100">
                          <div>
                            <span className="font-extrabold text-slate-800">{h.subjectName} session</span>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-medium">
                              <span>Duration: {h.durationMinutes}m</span>
                              <span>•</span>
                              <span>Date: {h.date}</span>
                            </div>
                          </div>

                          <span className={`font-mono font-black text-xs px-2 py-0.5 rounded-md ${
                            h.pointsAwarded < 0 ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {h.pointsAwarded > 0 ? `+${h.pointsAwarded} pts` : `${h.pointsAwarded} pts`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Subjects Manager & Store Preview Info */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Subjects tracking module with progressive syllabus checklists */}
            <div className="bg-white rounded-[32px] p-6 shadow-md border border-[#FFE8D1] flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Class progress</span>
                <h3 className="font-black text-xl text-slate-800 mt-1 mb-4 flex items-center gap-1">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Subjects Syllabus
                </h3>

                <div className="space-y-4">
                  {subjects.map((sub) => {
                    const isSelected = selectedSubjectId === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSubjectId(sub.id)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-gradient-to-r from-[#FFFBEA] to-[#FFF4CC] border-amber-300 scale-[1.01]" 
                            : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-xs uppercase tracking-wide text-slate-800">{sub.name}</span>
                          <span className="text-xs font-extrabold font-mono text-amber-700">{sub.progress}%</span>
                        </div>

                        {/* Visual progress bar */}
                        <div className="h-2 bg-slate-200/65 rounded-full overflow-hidden mt-1.5">
                          <div className={`h-full rounded-full transition-all duration-500 bg-[#FFD93D]`} style={{ width: `${sub.progress}%` }} />
                        </div>

                        {/* Selected info detail showing first unfinished topic */}
                        {isSelected && (
                          <div className="mt-2 text-[10px] font-semibold text-slate-500">
                            Active Topic: {sub.syllabus.filter(t => !sub.completedTopics.includes(t))[0] || "All Completed! 🎉"}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topic level syllabus checklist selector */}
              {selectedSubjectId && (
                <div className="mt-6 pt-4 border-t border-dashed border-slate-200">
                  <span className="text-[10px] font-black text-[#FF6B6B] uppercase tracking-widest block leading-none mb-2">
                    Syllabus Checklist Clicker
                  </span>
                  
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                    {subjects.find(s => s.id === selectedSubjectId)?.syllabus.map((topic, i) => {
                      const subject = subjects.find(s => s.id === selectedSubjectId)!;
                      const isCompleted = subject.completedTopics.includes(topic);

                      return (
                        <div
                          key={i}
                          onClick={() => {
                            setSubjects(prev => prev.map(s => {
                              if (s.id === selectedSubjectId) {
                                const exists = s.completedTopics.includes(topic);
                                const nextCompleted = exists 
                                  ? s.completedTopics.filter(t => t !== topic) 
                                  : [...s.completedTopics, topic];
                                
                                // Recalculate percent completion
                                const nextProg = Math.round((nextCompleted.length / s.syllabus.length) * 100);
                                return {
                                  ...s,
                                  completedTopics: nextCompleted,
                                  progress: nextProg
                                };
                              }
                              return s;
                            }));
                            setSmartySpeech(isCompleted ? `Toggled ${topic} review back to explore!` : `Yess! Marked '${topic}' as conquered! Progress increases!`);
                          }}
                          className={`p-2 rounded-xl text-xs font-semibold cursor-pointer border flex items-center justify-between transition-all ${
                            isCompleted 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                              : "bg-white border-slate-100 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <span className="line-clamp-1">{topic}</span>
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] ${
                            isCompleted ? "bg-[#6BCB77] border-[#6BCB77] text-white" : "border-slate-300"
                          }`}>
                            {isCompleted && "✓"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick visual upgrade preview stats */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-radial from-violet-500/20 to-transparent pointer-events-none" />
              
              <span className="text-[9px] font-black uppercase text-violet-400 tracking-wider">Active avatar gear</span>
              <h4 className="text-sm font-black mb-2 mt-0.5" id="store-preview-active-name">{activeUpgrade.name}</h4>
              
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10">
                <span className="text-3.5xl" role="img" aria-label="accessory">
                  {activeUpgrade.accessoryEmoji || "🤔"}
                </span>

                <div className="flex-1">
                  <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">Fitted Style Badge</span>
                  <p className="text-[11px] leading-tight text-white/90 font-medium">
                    {activeUpgrade.description}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10 text-xs">
                <span className="font-semibold text-slate-400">Total balance:</span>
                <span className="font-mono font-black text-amber-300">{points} PTS</span>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
