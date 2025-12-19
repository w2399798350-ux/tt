
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
  "正在执行音节对齐算法...",
  "正在构建结构化词库...",
  "即将完成..."
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

    if (!process.env.API_KEY) {
      setError("API Key 未配置，请检查环境变量。");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `你是一名资深的英语教育专家。用户希望学习关于 "${prompt}" 的词汇。
        由于单次输出限制，请先生成该主题下【最核心、最高频】的 50 个单词。
        
        要求：
        1. 单词拼写必须精准。
        2. wordParts：将单词拼写按音节发音划分为数组（如: "international" -> ["in", "ter", "na", "tion", "al"]）。
        3. ipa：音标需带音节分割点（如: /ˌɪn.təˈnæʃ.nəl/）。
        4. meaning：中文释义，直接给出中文（不带 n. v. 等词性前缀）。
        5. 确保返回 50 个单词。`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              libraryName: { type: Type.STRING, description: "词库标题" },
              words: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    wordParts: { type: Type.ARRAY, items: { type: Type.STRING } },
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
        id: `ai-${Date.now()}-${idx}`,
        category: data.libraryName || prompt
      }));

      onSuccess(data.libraryName || prompt, formattedWords);
      setPrompt('');
      onClose();
    } catch (err) {
      console.error("AI Error:", err);
      setError("生成失败。请尝试缩短关键词，或检查网络连接。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">AI 智能词书</h2>
              <p className="text-slate-400 text-sm font-medium italic">单次生成 50 词，后续可无限扩充至千词</p>
            </div>
            <button onClick={onClose} className="p-3 text-slate-300 hover:text-slate-600 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-6">
            <input
              autoFocus
              disabled={isLoading}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-6 outline-none focus:border-indigo-400 text-xl font-bold transition-all"
              placeholder="如：雅思核心、托福高频..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            
            {error && <div className="text-rose-500 text-sm font-bold px-2">{error}</div>}

            <button
              disabled={isLoading || !prompt.trim()}
              onClick={handleGenerate}
              className={`w-full py-6 rounded-3xl font-black text-xl text-white shadow-2xl transition-all ${isLoading ? 'bg-indigo-300' : 'bg-indigo-600 hover:scale-[1.02]'}`}
            >
              {isLoading ? LOADING_MESSAGES[loadingMsgIdx] : "生成首批 50 词"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISearchModal;
