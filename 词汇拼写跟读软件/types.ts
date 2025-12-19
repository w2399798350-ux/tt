
export interface Word {
  id: string;
  word: string;
  wordParts?: string[]; // 新增：将单词划分为对应的拼写音节块，如 ["stu", "dent"]
  ipa: string; // Phonetic with syllable dots: /ˌɪn.təˈnæʃ.nəl/
  meaning: string;
  category: string;
  imageUrl?: string; // Optional URL for word illustration
}

export enum LibraryType {
  NEW_CONCEPT_1 = "新概念英语-1",
  NEW_CONCEPT_2 = "新概念英语-2",
  BASIC = "基础英语",
  DAILY = "日常英语",
  BUSINESS = "商务英语",
  ACADEMIC = "学术词汇",
  CUSTOM = "AI 自定义"
}

export interface CustomLibrary {
  id: string;
  name: string;
  words: Word[];
}

export interface UserStats {
  correctCount: number;
  totalKeys: number;
  wpm: number;
  accuracy: number;
  startTime: number | null;
}

export interface AppState {
  currentLibraryId: string; // Can be a LibraryType or a custom library ID
  currentIndex: number;
  completedIds: string[];
  customLibraries: CustomLibrary[];
  repetitionCount: number; // New: how many times each word should be repeated
}
