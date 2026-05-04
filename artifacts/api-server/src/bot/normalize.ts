const LIGATURES: Record<string, string> = {
  æ: "ae", œ: "oe", ß: "ss", ﬁ: "fi", ﬂ: "fl", ﬀ: "ff",
  ﬃ: "ffi", ﬄ: "ffl", ﬅ: "st", ﬆ: "st", ð: "d", þ: "th",
  ø: "o", ł: "l", đ: "d", ħ: "h", ŧ: "t", ŋ: "n",
};

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[æœßﬁﬂﬀﬃﬄﬅﬆðþøłđħŧŋ]/g, (ch) => LIGATURES[ch] ?? ch)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
