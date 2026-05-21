import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Smile, MessageCircle } from "lucide-react";
import { CharacterUpgrade } from "../types";

interface SmartyCharacterProps {
  currentUpgrade: CharacterUpgrade;
  onVoiceInput?: (text: string) => void;
  smartySpeechText?: string;
}

export default function SmartyCharacter({
  currentUpgrade,
  onVoiceInput,
  smartySpeechText
}: SmartyCharacterProps) {
  const [mood, setMood] = useState<"neutral" | "talking" | "thinking" | "happy" | "warning">("happy");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [recognitionError, setRecognitionError] = useState("");
  
  const synthesisRef = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const recognitionRef = useRef<any>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsListening(true);
          setMood("thinking");
          setRecognitionError("");
        };

        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          if (onVoiceInput) {
            onVoiceInput(resultText);
          }
          setMood("happy");
        };

        rec.onerror = (e: any) => {
          console.error("Speech Recognition Error:", e);
          if (e.error === "not-allowed") {
            setRecognitionError("Permission blocked. Open settings to allow mic.");
          } else {
            setRecognitionError("Couldn't hear clearly. Try again!");
          }
          setIsListening(false);
          setMood("neutral");
        };

        rec.onend = () => {
          setIsListening(false);
          if (mood === "thinking") {
            setMood("neutral");
          }
        };

        recognitionRef.current = rec;
      }
    }

    return () => {
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, [onVoiceInput]);

  // Trigger speech when smartySpeechText changes (TTS)
  useEffect(() => {
    if (smartySpeechText && isAudioEnabled && synthesisRef.current) {
      synthesisRef.current.cancel(); // Stop current speech
      
      const utterance = new SpeechSynthesisUtterance(smartySpeechText);
      
      // Try to find a friendly warm English voice
      const voices = synthesisRef.current.getVoices();
      const preferredKeywords = ["google", "female", "en-us", "uk", "premium", "microsoft", "samantha", "daniel"];
      const sortedVoices = [...voices].sort((a, b) => {
        const score = (voice: typeof a) => {
          let s = 0;
          const nameLower = voice.name.toLowerCase();
          const langLower = voice.lang.toLowerCase();
          if (langLower.includes("en")) s += 10;
          if (langLower.includes("us") || langLower.includes("gb")) s += 5;
          if (nameLower.includes("female")) s += 8;
          if (nameLower.includes("google")) s += 4;
          if (nameLower.includes("samantha")) s += 15;
          return s;
        };
        return score(b) - score(a);
      });

      if (sortedVoices.length > 0) {
        utterance.voice = sortedVoices[0];
      }

      // Configure a warm, enthusiastic, high-spirited personality pitch
      utterance.rate = 1.05; // Slightly faster for high energy!
      utterance.pitch = 1.15; // Slightly higher pitch for extra warm vibe!

      utterance.onstart = () => {
        setIsSpeaking(true);
        setMood("talking");
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setMood("happy");
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setMood("neutral");
      };

      activeUtteranceRef.current = utterance;
      synthesisRef.current.speak(utterance);
    }
  }, [smartySpeechText, isAudioEnabled]);

  // Handle voices changing in background
  useEffect(() => {
    if (synthesisRef.current) {
      synthesisRef.current.onvoiceschanged = () => {
        // Force refresh voices list if needed
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
    } else {
      if (synthesisRef.current) synthesisRef.current.cancel(); // Mute playing speech
      setIsSpeaking(false);
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.error("Start failed:", err);
        }
      } else {
        alert("Audio recording isn't fully supported in your current browser, but you can type below!");
      }
    }
  };

  const toggleAudioHelp = () => {
    setIsAudioEnabled((prev) => {
      const next = !prev;
      if (!next && synthesisRef.current) {
        synthesisRef.current.cancel();
        setIsSpeaking(false);
        setMood("neutral");
      }
      return next;
    });
  };

  // Render Smarty base character with standard customized skin & background styles
  return (
    <div id="smarty-profile-block" className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 rounded-3xl text-white shadow-2xl relative overflow-hidden border border-violet-500/30">
      
      {/* Decorative cyber floating elements */}
      <div className="absolute top-2 left-4 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-md flex items-center gap-1 border border-white/20">
        <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
        Grade-A Friend
      </div>

      <div className="absolute top-2 right-4 flex items-center gap-2">
        <button
          onClick={toggleAudioHelp}
          id="toggle-audio-btn"
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-medium border border-white/15 cursor-pointer"
          title={isAudioEnabled ? "Silence Voice" : "Enable Voice Output"}
        >
          {isAudioEnabled ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4 text-red-300" />}
        </button>
      </div>

      {/* Styled Mascot Container */}
      <div className="w-44 h-44 relative mt-4 flex items-center justify-center">
        {/* Colorful glow circles based on state */}
        <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${
          mood === "talking" ? "bg-cyan-400/40 scale-110" :
          mood === "thinking" ? "bg-amber-400/45 scale-105" :
          mood === "warning" ? "bg-rose-500/40" : "bg-emerald-400/30"
        }`} />

        {/* Character Base Shape using customizable values from current upgrade */}
        <div id="smarty-character-icon" className={`w-36 h-36 rounded-full relative shadow-inner overflow-hidden transition-all duration-300 border-4 border-white/25 flex flex-col items-center justify-center`} style={{ backgroundColor: currentUpgrade.bgColor }}>
          
          {/* Eyes & expression and accessory */}
          <div className="flex flex-col items-center justify-center w-full h-full relative p-4">
            
            {/* Custom Accessory display bought in store */}
            {currentUpgrade.accessoryEmoji && (
              <span className="absolute top-3 text-3xl animate-bounce" style={{ animationDuration: "3s" }} role="img" aria-label="accessory">
                {currentUpgrade.accessoryEmoji}
              </span>
            )}

            {/* Glowing friendly eyes */}
            <div className="flex justify-between w-20 px-3 mt-4">
              <div className={`w-4 h-4 rounded-full bg-slate-900 relative transition-transform ${mood === "thinking" ? "animate-pulse" : ""}`}>
                <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-0.5 right-0.5" />
              </div>
              <div className={`w-4 h-4 rounded-full bg-slate-900 relative transition-transform ${mood === "thinking" ? "animate-pulse" : ""}`}>
                <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-0.5 right-0.5" />
              </div>
            </div>

            {/* Friendly, organic talking/smiling mouth */}
            <div className="mt-4 flex items-center justify-center h-8">
              {mood === "neutral" && (
                <div className="w-8 h-1 bg-slate-900 rounded-full" />
              )}
              {mood === "happy" && (
                <div className="w-10 h-5 border-b-4 border-slate-900 rounded-b-full bg-red-400/10" />
              )}
              {mood === "talking" && (
                <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-rose-300 animate-ping absolute scale-50 opacity-40" />
              )}
              {mood === "talking" && (
                <div className="w-7 h-5 rounded-full bg-slate-900 flex items-center justify-center text-[10px] text-white font-bold">o</div>
              )}
              {mood === "thinking" && (
                <div className="w-5 h-5 border-t-4 border-slate-900 rounded-t-full mt-2" />
              )}
              {mood === "warning" && (
                <div className="w-6 h-3 rounded-full bg-rose-950 border-t-2 border-rose-400" />
              )}
            </div>

            {/* Blushing cheeks */}
            <div className="flex justify-between w-24 absolute top-18 px-1">
              <div className="w-3 h-2 rounded-full bg-rose-400/50 blur-[1px]" />
              <div className="w-3 h-2 rounded-full bg-rose-400/50 blur-[1px]" />
            </div>

            {/* Skin details / Style Name indicator */}
            <div className="absolute bottom-1 px-2 py-0.5 bg-black/35 rounded-full text-[10px] uppercase tracking-wider font-mono">
              {currentUpgrade.name}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic speak bubble / status message */}
      <div className="text-center mt-3 z-10 w-full min-h-[30px] px-2">
        {isSpeaking ? (
          <div className="flex justify-center items-center gap-1.5 text-cyan-200 text-sm italic font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-100" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-200" />
            Speaking as a friend...
          </div>
        ) : isListening ? (
          <div className="flex justify-center items-center gap-1.5 text-amber-300 text-sm animate-pulse font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            Listening closely... speak now!
          </div>
        ) : smartySpeechText ? (
          <p className="text-xs text-violet-100 line-clamp-2 max-w-xs mx-auto italic">
            "{smartySpeechText}"
          </p>
        ) : (
          <p className="text-xs text-violet-200 font-medium">
            "We are study partners! Ready to crush today's plan?"
          </p>
        )}
      </div>

      {/* Action buttons (Microphone interaction) */}
      <div className="flex items-center gap-3 mt-4 z-10">
        <button
          onClick={toggleListening}
          id="mic-speak-btn"
          className={`px-5 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-lg transition-all transform active:scale-95 cursor-pointer ${
            isListening 
              ? "bg-amber-500 hover:bg-amber-600 text-slate-900 border border-amber-300 animate-pulse" 
              : "bg-emerald-400 hover:bg-emerald-500 text-emerald-950 hover:shadow-emerald-400/20"
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5" />
              <span>Stop Hearing</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>Talk to Me</span>
            </>
          )}
        </button>
      </div>

      {/* Error state if any */}
      {recognitionError && (
        <span className="text-rose-100 text-[10px] mt-2 font-mono bg-rose-500/25 px-2 py-0.5 rounded border border-rose-400/20 text-center">
          {recognitionError}
        </span>
      )}
    </div>
  );
}
