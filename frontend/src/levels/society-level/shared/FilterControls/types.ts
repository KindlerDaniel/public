// Shared type definitions

export interface CategoryProbabilities {
    wise: number;
    stupid: number;
    beautiful: number;
    repulsive: number;
    funny: number;
    unfunny: number;
  }
  
  export type CategoryKey = keyof CategoryProbabilities;
  
  export interface OppositeCategories {
    [key: string]: CategoryKey;
  }