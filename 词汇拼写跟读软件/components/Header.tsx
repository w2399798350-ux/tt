
import React, { useState, useRef, useEffect } from 'react';
import { LibraryType, Word, CustomLibrary } from '../types';

interface HeaderProps {
  currentLibraryId: string;
  currentIndex: number;
  totalCount: number;
  customLibraries: CustomLibrary[];
  repetitionCount: number;
  isPaused: boolean;
  onPauseToggle: () => void;
  onLibraryChange: (libId: string) => void;
  onDeleteLibrary: (libId: string) => void;
  onEditLibrary: (libId: string) => void;
  onSetRepetition: (count: number) => void;
  onSpeak: () => void;
  onSkip: () => void;
  prevWord: Word | null;
  onPrevClick: () => void;
  onOpenAIModal: () => void;
  onCreateEmptyLibrary: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentLibraryId, 
  currentIndex, 
  totalCount, 
  customLibraries,
  repetitionCount,
  isPaused,
  onPauseToggle,
  onLibraryChange,
  onDeleteLibrary,
  onEditLibrary,
  onSetRepetition,
  onSpeak,
  onSkip,
  prevWord,
  onPrevClick,
  onOpenAIModal,
  onCreateEmptyLibrary
}) => {
  const [isLibraryDropdownOpen, setIsLibraryDropdownOpen] = useState(false);
  const [isRepDropdownOpen, setIsRepDropdownOpen] = useState(false);
  const [customRepValue, setCustomRepValue] = useState(repetitionCount.toString());
  const libraryDropdownRef = useRef<HTMLDivElement>(null);
  const repDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (libraryDropdownRef.current && !libraryDropdownRef.current.contains(event.target as Node)) {
        setIsLibraryDropdownOpen(false);
      }
      if (repDropdownRef.current && !repDropdownRef.current.contains(event.target as Node)) {
        setIsRepDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLibrary = [...Object.values(LibraryType), ...customLibraries].find(
    lib => typeof lib === 'string' ? lib === currentLibraryId : lib.id === currentLibraryId
  );

  const displayName = typeof activeLibrary === 'string' ? activeLibrary : activeLibrary?.name || '选择词库';
  const isCustomLibraryActive = typeof activeLibrary !== 'string' && activeLibrary !== undefined;

  const handleCustomRepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomRepValue(val);
    const num = parseInt(val);
    if (!isNaN(num) && num > 0) {
      onSetRepetition(num);
    }
  };

  return (
    <header className="w-full max-w-7xl flex justify-between items-center mb-10 px-6 gap-6 relative z-50">
      <div className="flex-1 min-w-0">
        {prevWord ? (
          <button 
            onClick={onPrevClick}
            className="group flex flex-col p-4 bg-white/80 backdrop-blur-md rounded-[2rem] border border-white shadow-xl shadow-indigo-100/50 hover:shadow-indigo-200/50 hover:border-indigo-200 transition-all duration-300 text-left max-w-[280px] animate-in fade-in slide-in-from-left-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">回顾上词</span>
            </div>
            <div className="flex items-baseline gap-2 overflow-hidden mb-1">
              <span className="text-2xl font-black text-slate-700 font-textbook truncate">{prevWord.word}</span>
              <span className="text-[14px] text-indigo-400/70 font-bold font-textbook truncate italic">{prevWord.ipa}</span>
            </div>
            <div className="text-[13px] text-slate-400 font-medium truncate w-full">{prevWord.meaning}</div>
          </button>
        ) : (
          <div className="flex flex-col opacity-5 select-none pl-2 group">
             <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1 group-hover:opacity-100 transition-opacity">首个单词</span>
             <span className="text-7xl font-black text-slate-300 italic uppercase tracking-tighter group-hover:text-indigo-100 transition-colors">STARTING</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl p-2 rounded-[3rem] shadow-2xl shadow-indigo-200/20 border border-white">
        <div className="flex items-center gap-2 pl-2 relative" ref={libraryDropdownRef}>
          <button 
            onClick={() => setIsLibraryDropdownOpen(!isLibraryDropdownOpen)}
            className="flex items-center justify-between bg-white text-slate-600 text-[13px] font-black pl-5 pr-4 py-3.5 rounded-[2rem] hover:text-indigo-600 transition-all border border-slate-100 shadow-sm min-w-[180px] max-w-[220px] group"
          >
            <span className="truncate mr-2">{displayName}</span>
            <svg className={`w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-transform duration-300 ${isLibraryDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isCustomLibraryActive && (
            <button 
              onClick={() => onEditLibrary(currentLibraryId)}
              className="p-3.5 bg-white hover:bg-slate-50 text-indigo-500 rounded-full shadow-sm border border-slate-100 transition-all hover:scale-110 active:scale-95 ml-1"
              title="编辑当前词库"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}

          {isLibraryDropdownOpen && (
            <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(79,70,229,0.3)] border border-slate-50 py-4 z-[60] animate-in fade-in zoom-in-95 duration-200 max-h-[500px] overflow-y-auto overflow-x-hidden scrollbar-hide">
              <div className="px-5 pb-2 mb-2 border-b border-slate-50 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">内置经典词库</span>
              </div>
              {Object.values(LibraryType).filter(l => l !== LibraryType.CUSTOM).map(lib => (
                <button
                  key={lib}
                  onClick={() => { onLibraryChange(lib); setIsLibraryDropdownOpen(false); }}
                  className={`w-full flex items-center px-5 py-3.5 text-sm font-bold transition-colors text-left hover:bg-slate-50 ${currentLibraryId === lib ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
                >
                  {lib}
                </button>
              ))}
              
              <div className="px-5 pt-4 pb-2 mb-2 border-b border-slate-50 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">我的个性词库</span>
                <button 
                  onClick={() => { onCreateEmptyLibrary(); setIsLibraryDropdownOpen(false); }}
                  className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase"
                >
                  + 新建
                </button>
              </div>
              
              {customLibraries.length > 0 ? (
                customLibraries.map(cl => (
                  <div key={cl.id} className="group/item flex items-center px-2 pr-4">
                    <button
                      onClick={() => { onLibraryChange(cl.id); setIsLibraryDropdownOpen(false); }}
                      className={`flex-1 flex items-center px-4 py-3 text-sm font-bold transition-colors text-left rounded-2xl ${currentLibraryId === cl.id ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <span className="truncate">{cl.name}</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); onEditLibrary(cl.id); }} className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all" title="编辑词库内容">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteLibrary(cl.id); }} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="删除词库">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-4 text-[10px] text-slate-300 font-bold uppercase text-center italic">
                  暂无自定义词库
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5 ml-2">
            <button onClick={onOpenAIModal} className="p-3.5 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-[1.5rem] shadow-lg shadow-indigo-100 transition-all active:scale-90 flex items-center gap-2 group" title="AI 搜索导入">
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[11px] font-black pr-1 hidden lg:inline">AI 搜寻</span>
            </button>
          </div>
        </div>
        
        <div className="w-px h-10 bg-indigo-100/50" />
        
        <div className="flex items-center gap-3 pr-2">
          <div className="relative" ref={repDropdownRef}>
            <button onClick={() => setIsRepDropdownOpen(!isRepDropdownOpen)} className="flex items-center gap-2 bg-slate-50 text-slate-600 text-[11px] font-black px-4 py-3 rounded-2xl hover:bg-white hover:text-indigo-600 transition-all border border-slate-100 shadow-inner group">
              <span className="opacity-60">重复:</span>
              <span>{repetitionCount}x</span>
              <svg className={`w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-transform ${isRepDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isRepDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-50 py-3 z-[60] animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 pb-2 mb-2 border-b border-slate-50">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">设置次数</span>
                </div>
                {[1, 2, 3].map(opt => (
                  <button key={opt} onClick={() => { onSetRepetition(opt); setCustomRepValue(opt.toString()); setIsRepDropdownOpen(false); }} className={`w-full py-2 px-4 text-[11px] font-black transition-all hover:bg-indigo-50 text-left flex justify-between items-center ${repetitionCount === opt ? 'text-indigo-600 bg-indigo-50/30' : 'text-slate-400'}`}>
                    {opt}x
                    {repetitionCount === opt && <div className="w-1 h-1 rounded-full bg-indigo-600" />}
                  </button>
                ))}
                <div className="mt-3 px-4 pt-3 border-t border-slate-50">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">自定义</span>
                    <div className="relative">
                      <input 
                        type="number" 
                        min="1" 
                        max="99"
                        value={customRepValue}
                        onChange={handleCustomRepChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[11px] font-black text-indigo-600 focus:bg-white focus:border-indigo-400 focus:outline-none transition-all"
                        placeholder="输入次数"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 pointer-events-none">次</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={onSpeak} className="p-4 bg-white hover:bg-slate-50 rounded-[1.5rem] shadow-sm transition-all text-slate-400 hover:text-indigo-500 active:scale-90 border border-slate-100" title="发音 (Enter)">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
            <button onClick={onSkip} className="px-4 py-4 bg-slate-50 hover:bg-slate-100 rounded-[1.5rem] shadow-sm transition-all text-slate-400 hover:text-rose-500 active:scale-90 border border-slate-100 flex items-center gap-2 group" title="跳过此词 (Tab)">
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              <span className="text-[10px] font-black pr-1 hidden sm:inline">跳过</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-end">
        <button 
          onClick={onPauseToggle}
          className={`group relative overflow-hidden px-10 py-4 rounded-[2rem] text-xs font-black shadow-2xl transition-all duration-300 active:scale-95 ${isPaused ? 'bg-indigo-400 shadow-indigo-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
        >
          <span className="relative z-10 flex items-center gap-3 tracking-[0.1em] text-white">
            {isPaused ? 'RESUME' : 'PAUSE'}
            <div className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-slate-300' : 'bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]'}`} />
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
