
import React, { useState, useMemo } from 'react';
import { Word, CustomLibrary } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface LibraryEditModalProps {
  library: CustomLibrary;
  onClose: () => void;
  onSave: (name: string, words: Word[]) => void;
}

const LibraryEditModal: React.FC<LibraryEditModalProps> = ({ library, onClose, onSave }) => {
  const [libName, setLibName] = useState(library.name);
  const [words, setWords] = useState<Word[]>([...library.words]);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<number | null>(null);

  const handleWordChange = (index: number, field: keyof Word, value: any) => {
    const newWords = [...words];
    newWords[index] = { ...newWords[index], [field]: value };
    setWords(newWords);
  };

  const handleAIExpand = async () => {
    if (isExpanding) return;
    if (!process.env.API_KEY) return;

    setIsExpanding(true);
    // 仅提取最后 30 个词作为上下文，防止 prompt 过长，同时保证新生成的词不重复
    const recentWords = words.slice(-30).map(w => w.word).join(', ');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `你正在为一个名为 "${libName}" 的词库扩充内容。
        该词库已有部分单词（如：${recentWords}）。
        
        请再扩充 50 个【该主题相关、且不重复】的高频新单词。
        
        要求：
        1. 必须包含 wordParts（拼写音节块数组）。
        2. 必须包含 ipa（带点的音标）。
        3. 必须包含 meaning（纯中文释义）。
        4. 单词必须与 "${libName}" 高度相关。`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
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
            required: ["words"]
          }
        }
      });

      const data = JSON.parse(response.text);
      const newBatch: Word[] = data.words.map((w: any, idx: number) => ({
        ...w,
        id: `expand-${Date.now()}-${idx}`,
        category: libName
      }));

      setWords(prev => [...prev, ...newBatch]);
    } catch (err) {
      console.error(err);
      alert("扩充失败，请稍后重试。");
    } finally {
      setIsExpanding(false);
    }
  };

  const handleGenerateImage = async (index: number, wordText: string) => {
    if (isGeneratingImage !== null || !process.env.API_KEY) return;
    setIsGeneratingImage(index);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `A clear, simple 3D illustration of "${wordText}", white background, minimalist style.` }] },
      });
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          handleWordChange(index, 'imageUrl', `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (e) { console.error(e); } finally { setIsGeneratingImage(null); }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-[40px] shadow-2xl flex flex-col border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex-1">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">正在编辑词库</h3>
            <input 
              className="text-3xl font-black text-slate-800 bg-transparent border-b-2 border-transparent focus:border-indigo-400 outline-none w-full max-w-md transition-all"
              value={libName}
              onChange={(e) => setLibName(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors">放弃</button>
            <button 
              onClick={() => onSave(libName, words)} 
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
            >
              保存并学习 ({words.length} 词)
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-3 scrollbar-hide bg-slate-50/30">
          <div className="grid grid-cols-12 gap-4 px-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">
            <div className="col-span-3">单词</div>
            <div className="col-span-3">音标 (IPA)</div>
            <div className="col-span-4">中文释义</div>
            <div className="col-span-2 text-right">操作</div>
          </div>
          
          {words.map((w, idx) => (
            <div key={w.id} className="grid grid-cols-12 gap-4 items-center bg-white p-4 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-100/20 transition-all group">
              <div className="col-span-3 font-black text-slate-700 mono">{w.word}</div>
              <div className="col-span-3 font-bold text-indigo-400 mono text-sm">{w.ipa}</div>
              <div className="col-span-4 font-bold text-slate-500 truncate">{w.meaning}</div>
              <div className="col-span-2 flex justify-end gap-2">
                <button 
                  onClick={() => handleGenerateImage(idx, w.word)}
                  disabled={isGeneratingImage !== null}
                  className="p-2 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 rounded-xl transition-all"
                  title="生成图片"
                >
                  <svg className={`w-5 h-5 ${isGeneratingImage === idx ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </button>
                <button 
                  onClick={() => setWords(words.filter((_, i) => i !== idx))}
                  className="p-2 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer actions */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center items-center gap-6">
          <button 
            disabled={isExpanding}
            onClick={handleAIExpand}
            className={`group relative overflow-hidden px-12 py-5 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all ${isExpanding ? 'opacity-70' : ''}`}
          >
            <span className="flex items-center gap-3">
              {isExpanding ? (
                <>
                  <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  正在扩充词库...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  AI 智能扩充 (+50 词)
                </>
              )}
            </span>
          </button>
          
          <button 
            onClick={() => setWords([...words, { id: `m-${Date.now()}`, word: 'example', wordParts: ['ex', 'am', 'ple'], ipa: '/ɪɡ.ˈzɑːm.pəl/', meaning: '例子', category: libName }])}
            className="px-8 py-5 bg-white border-2 border-slate-200 rounded-[2rem] text-slate-600 font-black hover:border-indigo-400 hover:text-indigo-600 transition-all"
          >
            手动添加
          </button>
        </div>
      </div>
    </div>
  );
};

export default LibraryEditModal;
