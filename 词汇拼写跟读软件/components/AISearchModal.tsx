
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Word } from '../types';

interface AISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (name: string, words: Word[]) => void;
}

const LOADING_MESSAGES = [
  "正在连接 AI 大脑...",
  "正在搜寻最地道的词汇...",
  "正在划分音节并对齐拼写...",
  "正在整理中文释义...",
  "即将完成同步..."
];

const AISearchModal: React.FC<AISearchModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      interval = window.setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `作为一个英语教学专家，请根据主题 "${prompt}" 生成 15-20 个极具代表性的英语单词。
        要求：
        1. 单词拼写准确。
        2. 音标（IPA）必须非常详细，并且使用 "." 符号严格划分好音节（例如: /ˌɪn.təˈnæʃ.nəl/）。
        3. 必须提供 wordParts 字段：这是一个字符串数组，将单词的拼写按照音节发音划分为对应的块。例如: "student" -> ["stu", "dent"], "excuse" -> ["ex", "cu", "se"]。这一步非常关键，请仔细对齐！
        4. 中文释义直接给出专业、地道的翻译，不需要包含词性前缀（例如：不要包含 n. v. adj. adv. 等词性标识）。
        5. 难度适中，贴合主题。`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              libraryName: { type: Type.STRING, description: "根据主题优化的词库标题" },
              words: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    wordParts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "拼写对应的音节块数组" },
                    ipa: { type: Type.STRING },
                    meaning: { type: Type.STRING }
                  },
                  required: ["word", "wordParts", "ipa", "meaning"]
                }
              }
            },
            required: ["libraryName", "words"]
          }
        }
      });

      const data = JSON.parse(response.text);
      const formattedWords: Word[] = data.words.map((w: any, idx: number) => ({
        ...w,
        id: `custom-${Date.now()}-${idx}`,
        category: "AI 自定义"
      }));

      onSuccess(data.libraryName || prompt, formattedWords);
      setPrompt('');
      onClose();
    } catch (err) {
      console.error(err);
      setError("AI 连接失败或生成格式错误，请尝试更换主题。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="p-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">AI 智能搜寻</h2>
              <p className="text-slate-400 text-sm font-medium">输入任何你感兴趣的主题，一键生成专属词书</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <input
                autoFocus
                disabled={isLoading}
                type="text"
                placeholder="例如: 硅谷科技词汇、星际穿越、雅思写作核心..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-6 outline-none focus:border-indigo-400 focus:ring-8 focus:ring-indigo-50/50 transition-all text-xl text-slate-700 font-bold placeholder:text-slate-300 group-hover:bg-white"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {!isLoading && (
                  <div className="px-3 py-1 bg-slate-200 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">ENTER</div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-500 animate-in slide-in-from-top-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <button
              disabled={isLoading || !prompt.trim()}
              onClick={handleGenerate}
              className={`w-full py-6 rounded-3xl font-black text-xl text-white shadow-2xl transition-all flex items-center justify-center gap-4 ${
                isLoading 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-gradient-to-br from-indigo-600 to-indigo-700 hover:scale-[1.02] active:scale-[0.98] hover:shadow-indigo-200/50'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="animate-pulse">{LOADING_MESSAGES[loadingMsgIdx]}</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  开启 AI 生成
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISearchModal;