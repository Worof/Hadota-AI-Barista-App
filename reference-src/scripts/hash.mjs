/** Stable 32-bit FNV-1a hash used to name voice clips; shared by the generator and the app. */
export function clipId(lang, text) {
  let h = 0x811c9dc5;
  for (const ch of `${lang}|${text}`) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/** Canonical form of a typed first name, so spelling variants share one voice clip. */
export function normName(name) {
  return name
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // diacritics, tatweel
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627') // alef variants -> alef
    .replace(/\u0649/g, '\u064A') // alef maqsura -> yaa
    .replace(/\u0629/g, '\u0647') // taa marbuta -> haa
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Clip id of a spoken first name. */
export const nameClipId = (lang, name) => clipId(lang, `name|${normName(name)}`);
