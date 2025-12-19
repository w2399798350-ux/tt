
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Word, LibraryType, UserStats, AppState, CustomLibrary } from './types';
import { WORD_LIBRARIES } from './data/words';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import WordDisplay from './components/WordDisplay';
import AISearchModal from './components/AISearchModal';
import LibraryEditModal from './components/LibraryEditModal';

const STORAGE_KEY = 'vocab_master_v3_fixed';

let audioCtx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          currentLibraryId: parsed.currentLibraryId || LibraryType.NEW_CONCEPT_1,
          currentIndex: parsed.currentIndex || 0,
          completedIds: parsed.completedIds || [],
          customLibraries: parsed.customLibraries || [],
          repetitionCount: parsed.repetitionCount || 1
        };
      } catch (e) {
        console.error("Local storage error:", e);
      }
    }
    return {
      currentLibraryId: LibraryType.NEW_CONCEPT_1,
      currentIndex: 0,
      completedIds: [],
      customLibraries: [],
      repetitionCount: 1
    };
  });

  const [userInput, setUserInput] = useState<string>('');
  const [currentRep, setCurrentRep] = useState<number>(0);
  const [isError, setIsError] = useState<boolean>(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [editingLibraryId, setEditingLibraryId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const errorTimeoutRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const [activeSeconds, setActiveSeconds] = useState(0);

  const [stats, setStats] = useState<UserStats>({
    correctCount: 0,
    totalKeys: 0,
    wpm: 0,
    accuracy: 100,
    startTime: null
  });

  const initAudio = useCallback(() => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }, []);

  const playTypingSound = useCallback((isErrorSound = false) => {
    initAudio();
    if (!audioCtx) return;

    if (!noiseBuffer) {
      const bufferSize = audioCtx.sampleRate * 0.1; 
      noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }

    const now = audioCtx.currentTime;

    if (isErrorSound) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else {
      const noiseSource = audioCtx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.05, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      noiseSource.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noiseSource.start(now);
    }
  }, [initAudio]);

  const currentWords = useMemo(() => {
    const libId = appState.currentLibraryId;
    if (Object.values(LibraryType).includes(libId as LibraryType)) {
      return WORD_LIBRARIES[libId as LibraryType] || WORD_LIBRARIES[LibraryType.NEW_CONCEPT_1];
    }
    const custom = appState.customLibraries.find(cl => cl.id === libId);
    return custom?.words || [];
  }, [appState.currentLibraryId, appState.customLibraries]);

  const currentWord = useMemo(() => {
    if (!currentWords.length) return null;
    return currentWords[appState.currentIndex] || currentWords[0];
  }, [currentWords, appState.currentIndex]);

  const prevWord = appState.currentIndex > 0 ? currentWords[appState.currentIndex - 1] : null;
  const nextWord = appState.currentIndex < currentWords.length - 1 ? currentWords[appState.currentIndex + 1] : null;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState]);

  const speak = useCallback((text: string) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    if (currentWord && !isPaused && !isAIModalOpen && !editingLibraryId) {
      speak(currentWord.word);
    }
    setUserInput('');
    setCurrentRep(0);
    setIsError(false);
    setIsTransitioning(false);
  }, [appState.currentIndex, appState.currentLibraryId, currentWord, isPaused, isAIModalOpen, editingLibraryId]);

  useEffect(() => {
    const tick = () => {
      if (!isPaused && stats.startTime && !isAIModalOpen && !editingLibraryId) {
        setActiveSeconds(prev => prev + 1);
      }
    };
    timerRef.current = window.setInterval(tick, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, !!stats.startTime, isAIModalOpen, editingLibraryId]);

  useEffect(() => {
    if (activeSeconds > 0) {
      const elapsedMinutes = activeSeconds / 60;
      const currentWpm = Math.round((stats.correctCount / 5) / elapsedMinutes);
      const currentAcc = stats.totalKeys > 0 ? Math.round((stats.correctCount / stats.totalKeys) * 100) : 100;
      setStats(prev => ({ ...prev, wpm: currentWpm, accuracy: currentAcc }));
    }
  }, [activeSeconds, stats.correctCount, stats.totalKeys]);

  const handleSkip = useCallback(() => {
    if (appState.currentIndex < currentWords.length - 1) {
      setAppState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
    }
  }, [appState.currentIndex, currentWords.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isTransitioning || isAIModalOpen || editingLibraryId || !currentWord) return;
    
    if (isPaused) {
      if (e.key === 'Enter') setIsPaused(false);
      return;
    }
    
    if (!stats.startTime) {
      setStats(prev => ({ ...prev, startTime: Date.now() }));
    }
    
    const key = e.key;
    if (key === 'Tab') {
      e.preventDefault();
      handleSkip();
      return;
    }
    if (key === 'Enter') {
      speak(currentWord.word);
      return;
    }
    if (key.length > 1) return;

    setStats(prev => ({ ...prev, totalKeys: prev.totalKeys + 1 }));
    const targetChar = currentWord.word[userInput.length];
    
    if (key.toLowerCase() === targetChar.toLowerCase()) {
      const newInput = userInput + targetChar;
      setUserInput(newInput);
      setIsError(false);
      playTypingSound(false);
      setStats(prev => ({ ...prev, correctCount: prev.correctCount + 1 }));

      if (newInput.length === currentWord.word.length) {
        setIsTransitioning(true);
        speak(currentWord.word);
        
        if (currentRep + 1 < appState.repetitionCount) {
          setTimeout(() => {
            setCurrentRep(prev => prev + 1);
            setUserInput('');
            setIsTransitioning(false);
          }, 600);
        } else {
          setTimeout(() => {
            setAppState(prev => ({
              ...prev,
              currentIndex: Math.min(prev.currentIndex + 1, currentWords.length - 1),
            }));
          }, 800);
        }
      }
    } else {
      setIsError(true);
      playTypingSound(true);
      if (errorTimeoutRef.current) window.clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = window.setTimeout(() => setIsError(false), 400);
    }
  }, [userInput, currentWord, stats.startTime, currentWords.length, speak, isAIModalOpen, editingLibraryId, currentRep, appState.repetitionCount, playTypingSound, isPaused, handleSkip, isTransitioning]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const changeLibrary = (libId: string) => {
    setAppState(prev => ({ ...prev, currentLibraryId: libId, currentIndex: 0 }));
    setStats({ correctCount: 0, totalKeys: 0, wpm: 0, accuracy: 100, startTime: null });
    setActiveSeconds(0);
    setUserInput('');
  };

  const deleteLibrary = (libId: string) => {
    if (confirm("确定要删除这个词库吗？")) {
      setAppState(prev => {
        const newCustomLibs = prev.customLibraries.filter(l => l.id !== libId);
        const nextLibId = prev.currentLibraryId === libId ? LibraryType.NEW_CONCEPT_1 : prev.currentLibraryId;
        return {
          ...prev,
          customLibraries: newCustomLibs,
          currentLibraryId: nextLibId,
          currentIndex: prev.currentLibraryId === libId ? 0 : prev.currentIndex
        };
      });
    }
  };

  const handleUpdateLibrary = (libId: string, name: string, words: Word[]) => {
    setAppState(prev => {
      const newCustomLibs = prev.customLibraries.map(cl => cl.id === libId ? { ...cl, name, words } : cl);
      return { ...prev, customLibraries: newCustomLibs };
    });
  };

  const togglePause = () => {
    initAudio();
    setIsPaused(!isPaused);
  };

  const editingLibrary = appState.customLibraries.find(cl => cl.id === editingLibraryId) || null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-10 px-6 select-none bg-[#f8fafc] overflow-hidden">
      <Header 
        currentLibraryId={appState.currentLibraryId} 
        currentIndex={appState.currentIndex}
        totalCount={currentWords.length}
        customLibraries={appState.customLibraries}
        repetitionCount={appState.repetitionCount}
        isPaused={isPaused}
        onPauseToggle={togglePause}
        onLibraryChange={changeLibrary}
        onDeleteLibrary={deleteLibrary}
        onEditLibrary={(id) => setEditingLibraryId(id)}
        onSetRepetition={(count) => setAppState(p => ({ ...p, repetitionCount: count }))}
        onSpeak={() => speak(currentWord?.word || '')}
        onSkip={handleSkip}
        prevWord={prevWord}
        onPrevClick={() => setAppState(p => ({ ...p, currentIndex: Math.max(0, p.currentIndex - 1) }))}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onCreateEmptyLibrary={() => {
           const newLib: CustomLibrary = { id: `lib-${Date.now()}`, name: '新建词库', words: [] };
           setAppState(p => ({ ...p, customLibraries: [...p.customLibraries, newLib] }));
           setEditingLibraryId(newLib.id);
        }}
      />

      <main className={`w-full max-w-[1700px] flex items-center justify-center relative flex-1 transition-all duration-500 ${isPaused ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
        <div className="flex-1 flex flex-col items-center justify-center px-10 animate-in fade-in zoom-in-95 duration-500">
          {currentWord ? (
            <WordDisplay 
              word={currentWord} 
              userInput={userInput} 
              isError={isError} 
              repetitionCount={appState.repetitionCount}
              currentRep={currentRep}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400 font-bold">词库为空，请点击 AI 搜寻添加单词</p>
            </div>
          )}
        </div>
      </main>

      {isPaused && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-50/20 backdrop-blur-sm">
          <div onClick={togglePause} className="bg-white px-16 py-10 rounded-[4rem] shadow-2xl border border-white flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
            <span className="text-4xl font-black text-slate-800 mb-2">已暂停</span>
            <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">点击继续</span>
          </div>
        </div>
      )}

      <div className="mt-10 w-full flex justify-center pb-4">
        <StatsBar 
          stats={stats} 
          currentIndex={appState.currentIndex} 
          totalCount={currentWords.length} 
          activeSeconds={activeSeconds}
        />
      </div>

      <AISearchModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} onSuccess={(name, words) => {
        const newLib: CustomLibrary = { id: `lib-${Date.now()}`, name, words };
        setAppState(prev => ({ ...prev, customLibraries: [...prev.customLibraries, newLib], currentLibraryId: newLib.id, currentIndex: 0 }));
      }} />
      
      {editingLibrary && (
        <LibraryEditModal 
          library={editingLibrary} 
          onClose={() => setEditingLibraryId(null)} 
          onSave={(name, words) => { handleUpdateLibrary(editingLibrary.id, name, words); setEditingLibraryId(null); }} 
        />
      )}
    </div>
  );
};

export default App;
