
import { Word, LibraryType } from '../types';

// Built-in word libraries mapping for the app
export const WORD_LIBRARIES: Record<LibraryType, Word[]> = {
  [LibraryType.NEW_CONCEPT_1]: [
    { id: 'nc1-1', word: 'excuse', wordParts: ['ex', 'cu', 'se'], ipa: '/ɪk.ˈskjuːz/', meaning: 'v. 原谅；n. 借口', category: LibraryType.NEW_CONCEPT_1 },
    { id: 'nc1-2', word: 'brother', wordParts: ['bro', 'ther'], ipa: '/ˈbrʌð.ə/', meaning: 'n. 兄弟', category: LibraryType.NEW_CONCEPT_1 },
    { id: 'nc1-3', word: 'student', wordParts: ['stu', 'dent'], ipa: '/ˈstjuː.dənt/', meaning: 'n. 学生', category: LibraryType.NEW_CONCEPT_1 },
    { id: 'nc1-4', word: 'teacher', wordParts: ['tea', 'cher'], ipa: '/ˈtiː.tʃə/', meaning: 'n. 教师', category: LibraryType.NEW_CONCEPT_1 },
    { id: 'nc1-5', word: 'pencil', wordParts: ['pen', 'cil'], ipa: '/ˈpen.səl/', meaning: 'n. 铅笔', category: LibraryType.NEW_CONCEPT_1 },
    { id: 'nc1-6', word: 'watch', wordParts: ['watch'], ipa: '/wɒtʃ/', meaning: 'n. 手表；v. 观看', category: LibraryType.NEW_CONCEPT_1 },
    { id: 'nc1-7', word: 'handbag', wordParts: ['hand', 'bag'], ipa: '/ˈhænd.bæɡ/', meaning: 'n. 手提包', category: LibraryType.NEW_CONCEPT_1 },
  ],
  [LibraryType.NEW_CONCEPT_2]: [
    { id: 'nc2-1', word: 'private', wordParts: ['pri', 'vate'], ipa: '/ˈpraɪ.vət/', meaning: 'adj. 私人的', category: LibraryType.NEW_CONCEPT_2 },
    { id: 'nc2-2', word: 'conversation', wordParts: ['con', 'ver', 'sa', 'tion'], ipa: '/ˌkɒn.və.ˈseɪ.ʃən/', meaning: 'n. 谈话', category: LibraryType.NEW_CONCEPT_2 },
    { id: 'nc2-3', word: 'theatre', wordParts: ['thea', 'tre'], ipa: '/ˈθɪə.tə/', meaning: 'n. 剧院', category: LibraryType.NEW_CONCEPT_2 },
    { id: 'nc2-4', word: 'angry', wordParts: ['an', 'gry'], ipa: '/ˈæŋ.ɡri/', meaning: 'adj. 生气的', category: LibraryType.NEW_CONCEPT_2 },
  ],
  [LibraryType.BASIC]: [
    { id: 'basic-1', word: 'apple', wordParts: ['ap', 'ple'], ipa: '/ˈæp.əl/', meaning: 'n. 苹果', category: LibraryType.BASIC },
    { id: 'basic-2', word: 'banana', wordParts: ['ba', 'na', 'na'], ipa: '/bə.ˈnɑː.nə/', meaning: 'n. 香蕉', category: LibraryType.BASIC },
    { id: 'basic-3', word: 'computer', wordParts: ['com', 'pu', 'ter'], ipa: '/kəm.ˈpjuː.tə/', meaning: 'n. 计算机', category: LibraryType.BASIC },
    { id: 'basic-4', word: 'morning', wordParts: ['mor', 'ning'], ipa: '/ˈmɔː.nɪŋ/', meaning: 'n. 早晨', category: LibraryType.BASIC },
  ],
  [LibraryType.DAILY]: [
    { id: 'daily-1', word: 'coffee', wordParts: ['cof', 'fee'], ipa: '/ˈkɒf.i/', meaning: 'n. 咖啡', category: LibraryType.DAILY },
    { id: 'daily-2', word: 'breakfast', wordParts: ['break', 'fast'], ipa: '/ˈbrek.fəst/', meaning: 'n. 早餐', category: LibraryType.DAILY },
    { id: 'daily-3', word: 'subway', wordParts: ['sub', 'way'], ipa: '/ˈsʌb.weɪ/', meaning: 'n. 地铁', category: LibraryType.DAILY },
    { id: 'daily-4', word: 'weather', wordParts: ['wea', 'ther'], ipa: '/ˈweð.ə/', meaning: 'n. 天气', category: LibraryType.DAILY },
  ],
  [LibraryType.BUSINESS]: [
    { id: 'biz-1', word: 'management', wordParts: ['man', 'age', 'ment'], ipa: '/ˈmæn.ɪdʒ.mənt/', meaning: 'n. 管理', category: LibraryType.BUSINESS },
    { id: 'biz-2', word: 'negotiation', wordParts: ['ne', 'go', 'tia', 'tion'], ipa: '/nə.ˌɡəʊ.ʃi.ˈeɪ.ʃən/', meaning: 'n. 谈判', category: LibraryType.BUSINESS },
    { id: 'biz-3', word: 'investment', wordParts: ['in', 'vest', 'ment'], ipa: '/ɪn.ˈvest.mənt/', meaning: 'n. 投资', category: LibraryType.BUSINESS },
    { id: 'biz-4', word: 'strategy', wordParts: ['strat', 'e', 'gy'], ipa: '/ˈstræt.ə.dʒi/', meaning: 'n. 策略', category: LibraryType.BUSINESS },
    { id: 'biz-5', word: 'marketing', wordParts: ['mɑː', 'kɪ', 'tɪŋ'], ipa: '/ˈmɑː.kɪ.tɪŋ/', meaning: 'n. 营销', category: LibraryType.BUSINESS },
    { id: 'biz-6', word: 'revenue', wordParts: ['rev', 'e', 'nue'], ipa: '/ˈrev.ə.njuː/', meaning: 'n. 收入；税收', category: LibraryType.BUSINESS },
  ],
  [LibraryType.ACADEMIC]: [
    { id: 'acad-1', word: 'analysis', wordParts: ['a', 'nal', 'y', 'sis'], ipa: '/ə.ˈnæl.ə.sɪs/', meaning: 'n. 分析', category: LibraryType.ACADEMIC },
    { id: 'acad-2', word: 'hypothesis', wordParts: ['hy', 'poth', 'e', 'sis'], ipa: '/haɪ.ˈpɒθ.ə.sɪs/', meaning: 'n. 假设', category: LibraryType.ACADEMIC },
    { id: 'acad-3', word: 'significant', wordParts: ['sig', 'nif', 'i', 'cant'], ipa: '/sɪɡ.ˈnɪf.ɪ.kənt/', meaning: 'adj. 显著的；有意义的', category: LibraryType.ACADEMIC },
    { id: 'acad-4', word: 'theoretical', wordParts: ['the', 'o', 'ret', 'i', 'cal'], ipa: '/ˌθɪə.ˈret.ɪ.kəl/', meaning: 'adj. 理论的', category: LibraryType.ACADEMIC },
    { id: 'acad-5', word: 'methodology', wordParts: ['meth', 'o', 'dol', 'o', 'gy'], ipa: '/ˌmeθ.ə.ˈdɒl.ə.dʒi/', meaning: 'n. 方法论', category: LibraryType.ACADEMIC },
    { id: 'acad-6', word: 'parameter', wordParts: ['pa', 'ram', 'e', 'ter'], ipa: '/pə.ˈræm.ɪ.tə/', meaning: 'n. 参数', category: LibraryType.ACADEMIC },
  ],
  [LibraryType.CUSTOM]: []
};
