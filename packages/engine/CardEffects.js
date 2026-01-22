// Card effects definitions for the game
export const CardEffects = {
  RECRUIT: {
    description: "Recruit $AMT units",
    levels: {
      1: { amount: 1 },
      2: { amount: 2 },
      3: { amount: 3 },
      4: { amount: 4 },
      5: { amount: 5 }
    }
  },
  DISCARD: {
    description: "Discard $AMT cards",
    levels: {
      1: { amount: 1 },
      2: { amount: 2 },
      3: { amount: 3 }
    }
  },
  DRAW: {
    description: "Draw $AMT cards",
    levels: {
      1: { amount: 1 },
      2: { amount: 2 },
      3: { amount: 3 }
    }
  },
  DAMAGE: {
    description: "Deal $AMT damage",
    levels: {
      1: { amount: 1 },
      2: { amount: 2 },
      3: { amount: 3 },
      4: { amount: 4 },
      5: { amount: 5 }
    }
  }
};
