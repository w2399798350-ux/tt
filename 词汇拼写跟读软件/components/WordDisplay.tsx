
import React, { useMemo } from 'react';
import { Word } from '../types';

interface WordDisplayProps {
  word: Word;
  userInput: string;
  isError: boolean;
  repetitionCount: number;
  currentRep: number;
}

const WordDisplay: React.FC<WordDisplayProps> = ({ word, userInput, isError, repetitionCount, currentRep }) => {
  // 音标处理：通过点号拆分
  const cleanIpa = word.ipa.replace(/^\/|\/$/g, '');
  const ipaSyllables = useMemo(() => cleanIpa.split('.'), [cleanIpa]);

  // 拼写块处理：优先使用 wordParts，若无则视为一个整体
  const wordParts = useMemo(() => {
    if (word.wordParts && word.wordParts.length > 0) return word.wordParts;
    return [word.word];
  }, [word.word, word.wordParts]);

  // 关键修复：计算当前输入进度对应的拼写块索引
  const activePartIndex = useMemo(() => {
    let charCountAccumulator = 0;
    for (let i = 0; i < wordParts.length; i++) {
      charCountAccumulator += wordParts[i].length;
      if (userInput.length < charCountAccumulator) {
        return i;
      }
    }
    return wordParts.length - 1;
  }, [userInput.length, wordParts]);

  // 关键修复：将拼写块索引映射到音标块索引
  const activeIpaIndex = useMemo(() => {
    // 如果拼写块和音标块数量一致，直接对应
    if (ipaSyllables.length === wordParts.length) {
      return activePartIndex;
    }
    // 不一致时，按照进度百分比映射
    const progress = activePartIndex / (wordParts.length || 1);
    return Math.min(Math.floor(progress * ipaSyllables.length), ipaSyllables.length - 1);
  }, [activePartIndex, wordParts.length, ipaSyllables.length]);

  // 清理释义：移除词性标识
  const displayMeaning = useMemo(() => {
    if (!word.meaning) return '';
    return word.meaning.replace(/\b(n|v|adj|adv|prep|conj|pron|art|num|int|vt|vi)\.\s*/gi, '');
  }, [word.meaning]);

  return (
    <div className="text-center flex flex-col items-center">
      {/* Repetition Indicator */}
      {repetitionCount > 1 && (
        <div className="mb-6 px-5 py-2 bg-indigo-600 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-lg shadow-indigo-200 animate-in fade-in slide-in-from-top-2">
          复读进度: {currentRep + 1} / {repetitionCount}
        </div>
      )}

      {/* Target Word Display */}
      <div className={`mb-12 flex gap-1 justify-center h-28 items-center ${isError ? 'shake' : ''}`}>
        {(() => {
          let globalCharIndex = 0;
          return wordParts.map((part, pIdx) => {
            const isActivePart = pIdx === activePartIndex;
            const partStart = globalCharIndex;
            globalCharIndex += part.length;

            return (
              <div key={pIdx} className={`flex items-center ${isActivePart ? 'px-2' : 'px-1'}`}>
                {part.split('').map((char, cIdx) => {
                  const absoluteIndex = partStart + cIdx;
                  let status = '';
                  let animationClass = '';
                  
                  if (absoluteIndex < userInput.length) {
                    status = 'text-blue-600 font-black';
                    if (absoluteIndex === userInput.length - 1) {
                      animationClass = 'animate-correct';
                    }
                  } else if (absoluteIndex === userInput.length) {
                    if (isError) {
                      status = 'text-rose-500 font-black border-b-[6px] border-rose-400 scale-110';
                    } else {
                      status = 'text-blue-600 font-black border-b-[6px] border-blue-500';
                    }
                  } else {
                    // 非激活块的未输入字符颜色更淡
                    status = isActivePart ? 'text-slate-300 font-bold' : 'text-slate-100 font-bold';
                  }
                  
                  return (
                    <span 
                      key={cIdx} 
                      className={`text-7xl md:text-8xl font-textbook transition-all duration-200 px-0.5 inline-block ${status} ${animationClass}`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            );
          });
        })()}
      </div>

      {/* IPA with Syllables */}
      <div className="mb-10 flex items-center justify-center">
        <div className="px-10 py-6 bg-white/60 backdrop-blur-md rounded-[3rem] border border-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] flex items-center">
          <span className="text-indigo-200 text-3xl font-light mr-4">/</span>
          <span className="text-5xl md:text-6xl font-black tracking-wide flex items-center font-textbook">
            {ipaSyllables.map((s, i) => {
              const isActive = i === activeIpaIndex;
              const isPast = i < activeIpaIndex;
              
              return (
                <React.Fragment key={i}>
                  <span className={`transition-all duration-300 transform ${
                    isActive 
                      ? 'text-indigo-600 scale-110 drop-shadow-[0_4px_12px_rgba(79,70,229,0.3)]' 
                      : isPast 
                        ? 'text-slate-400' 
                        : 'text-slate-200'
                  }`}>
                    {s}
                  </span>
                  {i < ipaSyllables.length - 1 && (
                    <span className={`mx-4 text-3xl font-black transition-colors duration-300 ${
                      isPast ? 'text-indigo-100' : 'text-slate-50'
                    }`}>·</span>
                  )}
                </React.Fragment>
              );
            })}
          </span>
          <span className="text-indigo-200 text-3xl font-light ml-4">/</span>
        </div>
      </div>

      {/* Meaning */}
      <div className="bg-white/60 backdrop-blur-sm px-12 py-6 rounded-[3rem] border border-white shadow-sm max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <p className="text-3xl md:text-4xl text-slate-800 font-black tracking-tight leading-snug">
          {displayMeaning}
        </p>
      </div>
    </div>
  );
};

export default WordDisplay;
