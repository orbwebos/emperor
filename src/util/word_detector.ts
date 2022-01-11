export class WordDetector {
  words: string[]

  constructor(words: string[]) {
    this.words = words;
  }

  detectsWords(input: string): boolean {
    for (const i in this.words) {
      if (input.includes(this.words[i])) {
        return true;
      }
    }
    return false;
  }
}
