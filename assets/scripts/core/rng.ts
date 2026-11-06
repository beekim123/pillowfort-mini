/** xorshift32. State is explicit and JSON-safe; zero is mapped to a nonzero seed. */
export function nextRandom(state:number):{state:number;value:number} { let x=(state>>>0)||0x6d2b79f5; x^=x<<13; x^=x>>>17; x^=x<<5; const next=x>>>0; return {state:next,value:next/4294967296}; }
export function battleSeed(z:number,w:number,attempt:number):number { return (z*1000+w+7919*attempt)>>>0; }
