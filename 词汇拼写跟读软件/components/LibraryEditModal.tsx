
import React, { useState } from 'react';
import { Word, CustomLibrary } from '../types';
import { GoogleGenAI } from "@google/genai";

interface LibraryEditModalProps {
  library: CustomLibrary;
  onClose: () => void;
  onSave: (name: string, words: Word[]) => void;
}

const LibraryEditModal: React.FC<LibraryEditModalProps> = ({ library, onClose, onSave }) => {
  const [libName, setLibName] = useState(library.name);
  const [words, setWords] = useState<Word[]>([...library.words]);
  const [isGeneratingImage, setIsGeneratingImage] = useState<number | null>(null);

  const handleWordChange = (index: number, field: keyof Word, value: string) => {
    const newWords = [...words];
    newWords[index] = { ...newWords[index], [field]: value };
    setWords(newWords);
  };

  const handleDeleteWord = (index: number) => {
    if (words.length <= 1) {
      alert("词库至少需要保留一个单词。");
      return;
    }
    setWords(words.filter((_, i) => i !== index));
  };

  const handleGenerateImage = async (index: number, wordText: string) => {
    if (isGeneratingImage !== null) return;
    setIsGeneratingImage(index);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: `A clean, professional illustration for the word "${wordText}" suitable for a vocabulary learning app. Minimalist style, white background, high quality, no text.` },
          ],
        },
      });
      
      let generatedUrl = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (generatedUrl) {
        handleWordChange(index, 'imageUrl', generatedUrl);
      }
    } catch (err) {
      console.error("Image generation failed:", err);
      alert("AI 生成图片失败，请稍后重试。");
    } finally {
      setIsGeneratingImage(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">词库标题</label>
            <input 
              type="text" 
              value={libName}
              onChange={(e) => setLibName(e.target.value)}
              className="text-2xl font-black text-slate-800 bg-transparent outline-none border-b-2 border-transparent focus:border-indigo-400 transition-all w-full max-w-md"
            />
          </div>
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-3 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 transition-all"
            >
              取消
            </button>
            <button 
              onClick={() => onSave(libName, words)}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all"
            >
              保存更改
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4 scrollbar-hide">
          <div className="grid grid-cols-12 gap-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            <div className="col-span-2">单词</div>
            <div className="col-span-2">音标</div>
            <div className="col-span-3">释义</div>
            <div className="col-span-4">相关图片 (URL 或 AI 生成)</div>
            <div className="col-span-1 text-center">操作</div>
          </div>
          
          {words.map((w, idx) => (
            <div key={w.id} className="grid grid-cols-12 gap-4 items-center bg-slate-50 hover:bg-white p-4 rounded-3xl border border-transparent hover:border-indigo-100 hover:shadow-sm transition-all group">
              <div className="col-span-2">
                <input 
                  type="text"
                  value={w.word}
                  onChange={(e) => handleWordChange(idx, 'word', e.target.value)}
                  className="w-full bg-white/50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:border-indigo-400 outline-none mono"
                />
              </div>
              <div className="col-span-2">
                <input 
                  type="text"
                  value={w.ipa}
                  onChange={(e) => handleWordChange(idx, 'ipa', e.target.value)}
                  className="w-full bg-white/50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-indigo-500 focus:border-indigo-400 outline-none mono"
                />
              </div>
              <div className="col-span-3">
                <input 
                  type="text"
                  value={w.meaning}
                  onChange={(e) => handleWordChange(idx, 'meaning', e.target.value)}
                  className="w-full bg-white/50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 focus:border-indigo-400 outline-none"
                />
              </div>
              <div className="col-span-4 flex gap-2 items-center">
                <div className="relative flex-1">
                  <input 
                    type="text"
                    placeholder="图片 URL"
                    value={w.imageUrl || ''}
                    onChange={(e) => handleWordChange(idx, 'imageUrl', e.target.value)}
                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold text-slate-400 focus:border-indigo-400 outline-none truncate"
                  />
                  {w.imageUrl && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md overflow-hidden border border-slate-100">
                      <img src={w.imageUrl} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => handleGenerateImage(idx, w.word)}
                  disabled={isGeneratingImage !== null}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-[10px] font-black transition-all border ${
                    isGeneratingImage === idx 
                    ? 'bg-slate-100 text-slate-400 border-slate-200' 
                    : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white'
                  }`}
                >
                  {isGeneratingImage === idx ? '生成中...' : 'AI 生成'}
                </button>
              </div>
              <div className="col-span-1 flex justify-center">
                <button 
                  onClick={() => handleDeleteWord(idx)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  title="删除此词"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
           <button 
            onClick={() => {
              const newWord: Word = {
                id: `manual-${Date.now()}`,
                word: 'new word',
                ipa: '/n/uː/',
                meaning: 'n. 新词',
                category: library.name
              };
              setWords([...words, newWord]);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm"
           >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
             </svg>
             添加单词
           </button>
        </div>
      </div>
    </div>
  );
};

export default LibraryEditModal;
