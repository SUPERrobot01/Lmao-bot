import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, "../../counter.json");

export const INT_MAX = 2147483647;
export const INT_MIN = -2147483648;

interface CounterData {
  count: number;
  word: string;
}

function load(): CounterData {
  if (!existsSync(DATA_FILE)) {
    return { count: 0, word: "lmao" };
  }
  try {
    const data = JSON.parse(readFileSync(DATA_FILE, "utf-8")) as Partial<CounterData>;
    return { count: data.count ?? 0, word: data.word ?? "lmao" };
  } catch {
    return { count: 0, word: "lmao" };
  }
}

function save(data: CounterData): void {
  writeFileSync(DATA_FILE, JSON.stringify(data), "utf-8");
}

export function getCount(): number {
  return load().count;
}

export function getWord(): string {
  return load().word;
}

export function setCount(value: number): void {
  const data = load();
  data.count = value;
  save(data);
}

export function setWord(word: string): void {
  const data = load();
  data.word = word.toLowerCase();
  save(data);
}

export function increment(): number {
  const data = load();
  if (data.count >= INT_MAX) {
    data.count = INT_MIN;
  } else {
    data.count += 1;
  }
  save(data);
  return data.count;
}
