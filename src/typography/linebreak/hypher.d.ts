declare module 'hypher' {
  export default class Hypher {
    constructor(patterns: unknown);
    hyphenate(word: string): string[];
  }
}
